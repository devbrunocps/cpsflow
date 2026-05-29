import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";
import { listIntegrations } from "@/lib/dashboard";

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL ?? "https://cpscode-n8n-a10e213ca132.herokuapp.com/webhook/n8n-cpsflow-8asgd8h38hr83";

async function getUazapiConfig() {
  const baseUrl = process.env.UAZAPI_BASE_URL;
  const adminToken = process.env.UAZAPI_ADMIN_TOKEN;
  if (!baseUrl || !adminToken) {
    throw new Error("UAZAPI_BASE_URL ou UAZAPI_ADMIN_TOKEN não configurado no servidor.");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), adminToken };
}

async function getCompany(userId: string) {
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.company_id) return null;

  const { data: company } = await admin
    .from("companies")
    .select("id, slug, max_instances")
    .eq("id", profile.company_id)
    .maybeSingle();

  return company ?? null;
}

/** POST /api/uazapi/instance — cria instância e configura webhook */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const company = await getCompany(user.id);
    if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const label = body.label ?? "Instância Principal";

    // Verificar limites
    const maxInstances = company.max_instances ?? 1;
    const existing = await listIntegrations(company.id);
    if (existing.length >= maxInstances) {
      return NextResponse.json({ error: `Limite de ${maxInstances} instância(s) atingido` }, { status: 400 });
    }

    const { baseUrl, adminToken } = await getUazapiConfig();

    // Nome único da instância: slug + timestamp
    const reqInstanceName = `${company.slug}-${Date.now()}`;

    // 1. Criar instância na UAZAPI
    const createRes = await fetch(`${baseUrl}/instance/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        admintoken: adminToken,
      },
      body: JSON.stringify({ name: reqInstanceName }),
    });

    const createText = await createRes.text();
    let createData: Record<string, unknown>;
    try {
      createData = JSON.parse(createText);
    } catch {
      return NextResponse.json({ error: "Resposta inválida da UAZAPI" }, { status: 502 });
    }

    if (!createRes.ok) {
      return NextResponse.json(
        { error: (createData?.message as string) ?? (createData?.error as string) ?? `Erro ${createRes.status} ao criar instância` },
        { status: createRes.status }
      );
    }

    const instanceToken = (createData?.token as string) ?? (createData?.instance as Record<string, unknown> | undefined)?.token as string ?? "";
    const instanceName = (createData?.name as string) ?? (createData?.instance as Record<string, unknown> | undefined)?.name as string ?? reqInstanceName;

    if (!instanceToken) {
      return NextResponse.json({ error: "UAZAPI não retornou token" }, { status: 502 });
    }

    // 2. Configurar webhook
    const webhookRes = await fetch(`${baseUrl}/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: instanceToken,
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        enabled: true,
        events: ["connection", "messages"],
        excludeMessages: ["wasSentByApi"],
      }),
    });

    if (!webhookRes.ok) {
      console.warn("[uazapi/instance] Webhook com aviso");
    }

    // 3. Salvar no banco (como uma nova integração/instância)
    const admin = createSupabaseAdminClient();
    const { data: newIntegration, error: dbError } = await admin
      .from("company_integrations")
      .insert({
        company_id: company.id,
        uazapi_token: instanceToken,
        uazapi_instance: instanceName,
        uazapi_base_url: baseUrl,
        n8n_webhook_url: WEBHOOK_URL,
        label: label,
        active: true,
      })
      .select('id, company_id, uazapi_base_url, uazapi_token, uazapi_instance, uazapi_status, label, active, n8n_webhook_url, webhook_secret, created_at, updated_at')
      .maybeSingle<import('@/lib/types').CompanyIntegration>();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(newIntegration);
  } catch (err) {
    console.error("[uazapi/instance POST] erro:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** PATCH /api/uazapi/instance — atualiza dados (ex: label) */
export async function PATCH(request: NextRequest) {
  try {
    const { id, label } = await request.json();
    if (!id || !label) return NextResponse.json({ error: "Missing id or label" }, { status: 400 });

    const admin = createSupabaseAdminClient();
    const { data: instance, error } = await admin
      .from("company_integrations")
      .update({ label })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(instance);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** DELETE /api/uazapi/instance — desconecta e remove dados da instância */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID da instância não fornecido" }, { status: 400 });

    const company = await getCompany(user.id);
    if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    const admin = createSupabaseAdminClient();
    const { data: integration } = await admin
      .from("company_integrations")
      .select("id, uazapi_token")
      .eq("id", id)
      .eq("company_id", company.id)
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ error: "Instância não encontrada" }, { status: 404 });
    }

    const { baseUrl } = await getUazapiConfig();

    if (integration.uazapi_token) {
      // Tentar desconectar e remover da UAZAPI (Logout / Delete)
      await fetch(`${baseUrl}/instance/logout`, {
        method: "DELETE",
        headers: { token: integration.uazapi_token },
      }).catch(() => {});

      await fetch(`${baseUrl}/instance/delete`, {
        method: "DELETE",
        headers: { token: integration.uazapi_token },
      }).catch(() => {});
    }

    // Remover do banco de dados
    await admin.from("company_integrations").delete().eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[uazapi/instance DELETE] erro:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
