import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Ref do projeto — derivado da URL para evitar hardcode duplicado
function getProjectRef(url: string) {
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return "hdzvqxfrgzzmvwsehcna";
  }
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL nao configurado.");
  }

  const projectRef = getProjectRef(url);

  return { url, serviceRoleKey, anonKey, projectRef };
}

/**
 * Cliente server — lê o access_token do cookie correto do Supabase
 * e o passa como Authorization header para que o RLS funcione.
 * Nome do cookie: sb-[projectRef]-auth-token
 */
export async function createSupabaseServerClient() {
  const { url, anonKey, projectRef } = getSupabaseConfig();
  const cookieStore = await cookies();

  // Nome correto do cookie que o nosso login seta
  const authToken =
    cookieStore.get(`sb-${projectRef}-auth-token`)?.value ??
    // Fallback para o nome antigo, caso exista sessão anterior
    cookieStore.get("sb-auth-token")?.value;

  const headers: Record<string, string> = {};
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return createClient(url, anonKey ?? "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: { headers },
  });
}

/**
 * Cliente admin (service_role key) — bypassa RLS.
 * Usado para: criar usuários, ler dados sem contexto de sessão (n8n, API routes internas).
 */
export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseConfig();

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurado.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Retorna o nome correto do cookie de sessão para este projeto.
 * Útil no middleware e nas API routes para ler/setar cookies.
 */
export function getSessionCookieName() {
  const { projectRef } = getSupabaseConfig();
  return `sb-${projectRef}-auth-token`;
}

export function getRefreshCookieName() {
  const { projectRef } = getSupabaseConfig();
  return `sb-${projectRef}-refresh-token`;
}
