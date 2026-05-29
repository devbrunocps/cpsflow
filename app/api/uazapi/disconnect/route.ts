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

/** POST /api/uazapi/disconnect — desconecta a instância WhatsApp (mantém a instância no servidor) */
export async function POST(request: NextRequest) {
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
      .select("uazapi_token, uazapi_base_url")
      .eq("company_id", companyId)
      .eq("id", id)
      .maybeSingle();

    if (!integration?.uazapi_token) {
      return NextResponse.json({ error: "Instância não configurada" }, { status: 400 });
    }

    const baseUrl = (process.env.UAZAPI_BASE_URL ?? integration.uazapi_base_url ?? "").replace(/\/$/, "");

    const res = await fetch(`${baseUrl}/instance/disconnect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: integration.uazapi_token,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? data?.error ?? "Erro ao desconectar instância" },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true, raw: data });
  } catch (err) {
    console.error("[uazapi/disconnect POST] erro:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
