import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

/**
 * POST /api/auth/reset-password
 * Envia o email de reset de senha via Supabase Auth
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();

    // Usa o admin client para garantir que não haja bloqueios
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/redefinir-senha`,
    });

    if (error) {
      console.error("[reset-password] error:", error.message);
      // Não revela se o email existe ou não (segurança)
    }

    // Sempre retorna sucesso para não vazar informação sobre emails existentes
    return NextResponse.json({
      ok: true,
      message: "Se este e-mail estiver cadastrado, você receberá um link em breve.",
    });
  } catch (err) {
    console.error("[reset-password] unexpected error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/auth/update-password
 * Atualiza a senha do usuário autenticado via token de reset
 */
export async function PUT(request: Request) {
  try {
    const { access_token, password } = await request.json();

    if (!access_token || !password) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios." },
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

    // Usa o token de reset para autenticar e atualizar a senha
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(access_token);

    if (getUserError || !user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 401 },
      );
    }

    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[update-password] unexpected error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente." },
      { status: 500 },
    );
  }
}
