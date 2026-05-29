import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

async function getCompanyId(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();
  return profile?.company_id ?? null;
}

/**
 * GET /api/uazapi/status
 *
 * Chama GET /instance/status na UAZAPI para obter o status real de conexão.
 * Spec: resposta = { instance: { status, qrcode, paircode, ... }, status: { connected, loggedIn, jid } }
 * Persiste o status no banco (company_integrations.uazapi_status).
 */
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID da instância ausente" }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const companyId = await getCompanyId(user.id);
    if (!companyId) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const admin = createSupabaseAdminClient();
    const { data: integration } = await admin
      .from("company_integrations")
      .select("uazapi_token, uazapi_instance, uazapi_status")
      .eq("company_id", companyId)
      .eq("id", id)
      .maybeSingle();

    if (!integration?.uazapi_token) {
      return NextResponse.json({
        status: "no_instance",
        connected: false,
        loggedIn: false,
        qrcode: null,
        paircode: null,
      });
    }

    const baseUrl = (process.env.UAZAPI_BASE_URL ?? "").replace(/\/$/, "");

    // GET /instance/status — não precisa de body
    const res = await fetch(`${baseUrl}/instance/status`, {
      method: "GET",
      headers: {
        token: integration.uazapi_token,
      },
      // Sem cache para sempre pegar dados frescos
      cache: "no-store",
    });

    const text = await res.text();
    console.log(`[uazapi/status GET] status=${res.status} body=${text.slice(0, 400)}`);

    if (!res.ok) {
      // Token inválido ou instância não existe na UAZAPI
      if (res.status === 401 || res.status === 404) {
        // Atualiza banco para refletir que não está conectado
        await admin
          .from("company_integrations")
          .update({ uazapi_status: "disconnected" })
          .eq("id", id);

        return NextResponse.json({
          status: "disconnected",
          connected: false,
          loggedIn: false,
          qrcode: null,
          paircode: null,
          error: `Instância não encontrada na UAZAPI (${res.status}). O token pode ser inválido ou a instância não existe mais.`,
        });
      }

      return NextResponse.json(
        { error: `Erro ${res.status} ao verificar status`, raw: text.slice(0, 200) },
        { status: res.status }
      );
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Resposta inválida da UAZAPI", raw: text.slice(0, 200) }, { status: 502 });
    }

    // Spec: status real vem de data.instance.status ou data.status.connected
    const instance = (data?.instance ?? {}) as Record<string, unknown>;
    const statusBlock = (data?.status ?? {}) as Record<string, unknown>;

    const instanceStatus = (instance?.status as string) ?? "disconnected";
    const connected = Boolean(statusBlock?.connected ?? instance?.status === "connected");
    const loggedIn = Boolean(statusBlock?.loggedIn);
    const qrcode = (instance?.qrcode as string) ?? null;
    const paircode = (instance?.paircode as string) ?? null;

    // Normaliza status para os três valores possíveis
    const normalizedStatus: "disconnected" | "connecting" | "connected" =
      instanceStatus === "connected" || connected
        ? "connected"
        : instanceStatus === "connecting"
        ? "connecting"
        : "disconnected";

    await admin
      .from("company_integrations")
      .update({ uazapi_status: normalizedStatus })
      .eq("id", id);

    return NextResponse.json({
      status: normalizedStatus,
      connected,
      loggedIn,
      qrcode,
      paircode,
      profileName: (instance?.profileName as string) ?? null,
      profilePicUrl: (instance?.profilePicUrl as string) ?? null,
      instanceName: (instance?.name as string) ?? integration.uazapi_instance,
      raw: data,
    });
  } catch (err) {
    console.error("[uazapi/status GET] erro:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
