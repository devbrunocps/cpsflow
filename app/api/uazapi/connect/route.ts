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
 * POST /api/uazapi/connect
 *
 * Chama POST /instance/connect na UAZAPI.
 * Spec: body é opcional (sem phone → QR code; com phone → paircode)
 * Resposta: { connected, loggedIn, jid, instance: { qrcode, paircode, status, ... } }
 */
export async function POST(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID da instância ausente" }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const phone = body.phone;

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const companyId = await getCompanyId(user.id);
    if (!companyId) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const admin = createSupabaseAdminClient();
    const { data: integration } = await admin
      .from("company_integrations")
      .select("uazapi_token")
      .eq("company_id", companyId)
      .eq("id", id)
      .maybeSingle();

    if (!integration?.uazapi_token) {
      return NextResponse.json({ error: "Instância não criada. Crie a instância primeiro." }, { status: 400 });
    }

    const baseUrl = (process.env.UAZAPI_BASE_URL ?? "").replace(/\/$/, "");

    const res = await fetch(`${baseUrl}/instance/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: integration.uazapi_token,
      },
      body: phone ? JSON.stringify({ phone }) : undefined,
    });

    const text = await res.text();
    console.log(`[uazapi/connect POST] status=${res.status} body=${text.slice(0, 500)}`);

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: `UAZAPI retornou resposta inválida (${res.status}): ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          error: (data?.message as string) ?? (data?.error as string) ?? `Erro ${res.status}`,
          raw: data,
        },
        { status: res.status }
      );
    }

    // Spec: qrcode e paircode ficam dentro de data.instance
    const instance = (data?.instance ?? {}) as Record<string, unknown>;

    // Status da conexão
    const connected = Boolean(data?.connected ?? instance?.status === "connected");
    const status: string =
      (instance?.status as string) ??
      (connected ? "connected" : "connecting");

    return NextResponse.json({
      qrcode: (instance?.qrcode as string) ?? null,
      paircode: (instance?.paircode as string) ?? null,
      status,
      connected,
      loggedIn: Boolean(data?.loggedIn),
      raw: data,
    });
  } catch (err) {
    console.error("[uazapi/connect POST] erro:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
