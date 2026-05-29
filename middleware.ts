import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Project ref do Supabase — extraído de NEXT_PUBLIC_SUPABASE_URL
// URL: https://hdzvqxfrgzzmvwsehcna.supabase.co → ref = hdzvqxfrgzzmvwsehcna
const SUPABASE_PROJECT_REF = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0]
  : "hdzvqxfrgzzmvwsehcna";

const AUTH_COOKIE = `sb-${SUPABASE_PROJECT_REF}-auth-token`;

// Rotas que exigem sessão ativa
const DASHBOARD_PREFIXES = [
  "/dashboard",
  "/produtos",
  "/mensagens",
  "/fluxos",
  "/configuracoes",
  "/leads",
];

// Rotas que exigem super admin
const ADMIN_PREFIXES = ["/admin"];

// Rotas públicas (não redirecionam mesmo sem sessão)
const PUBLIC_ROUTES = ["/login", "/register", "/aguardando-aprovacao", "/redefinir-senha"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = DASHBOARD_PREFIXES.some((p) =>
    pathname.startsWith(p),
  );
  const isAdminRoute = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicRoute = PUBLIC_ROUTES.some((p) => pathname.startsWith(p));

  const sessionCookie = request.cookies.get(AUTH_COOKIE);
  const hasSession = !!sessionCookie?.value;

  // Redireciona para login se rota protegida sem sessão
  if ((isDashboardRoute || isAdminRoute) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redireciona para dashboard se já logado tentando acessar login/register
  if (isPublicRoute && hasSession && pathname !== "/aguardando-aprovacao") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
