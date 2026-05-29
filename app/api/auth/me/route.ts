import { NextResponse } from "next/server";
import { createSupabaseAdminClient, getSessionCookieName } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const cookieName = getSessionCookieName();

    // Extrai o token de acesso do cookie da sessão Supabase
    const tokenMatch = cookieHeader.match(
      new RegExp(`${cookieName.replace(/-/g, "\\-")}=([^;]+)`),
    );
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Busca dados extras do perfil
    const { data: profile } = await supabase
      .from("users")
      .select("status, is_super_admin, company_id, name, role")
      .eq("id", data.user.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
