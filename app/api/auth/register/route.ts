import { NextResponse } from "next/server";
import { createSupabaseAdminClient, getSessionCookieName, getRefreshCookieName } from "@/lib/supabase";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(request: Request) {
  try {
    const { email, password, businessName } = await request.json();

    if (!email || !password || !businessName) {
      return NextResponse.json(
        { error: "Nome do negócio, e-mail e senha são obrigatórios." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();

    // 1. Criar usuário no Supabase Auth (sem confirmação de email)
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Pula confirmação de email
      });

    if (authError || !authData.user) {
      // Verifica se já existe
      if (authError?.message?.includes("already")) {
        return NextResponse.json(
          { error: "Este e-mail já está cadastrado." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: authError?.message ?? "Erro ao criar usuário." },
        { status: 500 },
      );
    }

    const userId = authData.user.id;
    const isSuperAdmin =
      SUPER_ADMIN_EMAIL !== "" &&
      email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    // Status: super admin entra ativo; outros ficam pendentes
    const userStatus = isSuperAdmin ? "active" : "pending";

    // 2. Criar a empresa
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        name: businessName.trim(),
        slug: slugify(businessName),
      })
      .select("id")
      .single();

    if (companyError || !company) {
      // Rollback: deletar usuário criado
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Erro ao criar empresa: " + companyError?.message },
        { status: 500 },
      );
    }

    // 3. Criar perfil do usuário
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      company_id: company.id,
      email: email.toLowerCase(),
      name: businessName.trim(),
      role: "owner",
      status: userStatus,
      is_super_admin: isSuperAdmin,
    });

    if (userError) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Erro ao criar perfil: " + userError.message },
        { status: 500 },
      );
    }

    // 4. Criar configurações padrão da empresa
    await supabase.from("company_settings").insert({
      company_id: company.id,
      welcome_message:
        "Olá! 👋 Bem-vindo! Como posso te ajudar hoje?",
      fallback_message:
        "Não entendi muito bem. Pode reformular sua pergunta? 😊",
      off_hours_message:
        "Olá! No momento estamos fora do horário de atendimento. Retornaremos em breve!",
    });

    // 5. Criar registro de integrações com webhook_secret automático
    await supabase.from("company_integrations").insert({
      company_id: company.id,
      // webhook_secret é gerado automaticamente pelo DEFAULT do banco
    });

    // 6. Se for super admin ou se aprovado, fazer login automático
    if (isSuperAdmin) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (!sessionError && sessionData.session) {
        const response = NextResponse.json({ ok: true, redirectTo: "/dashboard" });
        const { access_token, refresh_token, expires_at } = sessionData.session;

        const cookieOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax" as const,
          path: "/",
        };

        response.cookies.set(
          getSessionCookieName(),
          access_token,
          {
            ...cookieOptions,
            expires: expires_at ? new Date(expires_at * 1000) : undefined,
          },
        );
        response.cookies.set(
          getRefreshCookieName(),
          refresh_token ?? "",
          {
            ...cookieOptions,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        );

        return response;
      }
    }

    // Usuário pendente: informa que está aguardando aprovação
    return NextResponse.json({
      ok: true,
      redirectTo: "/aguardando-aprovacao",
      message:
        "Conta criada com sucesso! Sua solicitação de acesso foi enviada e está aguardando aprovação.",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno ao processar o cadastro." },
      { status: 500 },
    );
  }
}
