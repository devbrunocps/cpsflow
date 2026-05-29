import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient, getSessionCookieName, getRefreshCookieName } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 },
      );
    }

    // Usa anon key para signInWithPassword — o admin client com persistSession:false
    // pode não retornar sessão corretamente em alguns ambientes
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    // 1. Autentica o usuário
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error("[login] signInWithPassword error:", error?.message);
      return NextResponse.json(
        { error: error?.message ?? "Credenciais inválidas." },
        { status: 401 },
      );
    }

    // 2. Busca perfil usando admin client (bypassa RLS)
    const supabase = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("status, is_super_admin, company_id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[login] profile fetch error:", profileError.message);
    }

    // Se não existe perfil, permite login mas sem verificação de status
    // (usuário foi criado antes do sistema de aprovação)
    if (profile) {
      if (profile.status === "pending") {
        return NextResponse.json(
          {
            error: "pending_approval",
            message: "Sua conta está aguardando aprovação.",
          },
          { status: 403 },
        );
      }

      if (profile.status === "suspended") {
        return NextResponse.json(
          { error: "Sua conta foi suspensa. Entre em contato com o suporte." },
          { status: 403 },
        );
      }
    }

    // 3. Monta resposta com cookies de sessão
    const response = NextResponse.json({
      ok: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        is_super_admin: profile?.is_super_admin ?? false,
      },
    });

    const { access_token, refresh_token, expires_at } = data.session;

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    // Cookie do access token
    response.cookies.set(
      getSessionCookieName(),
      access_token,
      {
        ...cookieOptions,
        // expires_at vem em segundos (unix timestamp)
        expires: expires_at ? new Date(expires_at * 1000) : undefined,
      },
    );

    // Cookie do refresh token
    if (refresh_token) {
      response.cookies.set(
        getRefreshCookieName(),
        refresh_token,
        {
          ...cookieOptions,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      );
    }

    return response;
  } catch (err) {
    console.error("[login] unexpected error:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar o login." },
      { status: 500 },
    );
  }
}
