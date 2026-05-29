import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase";

const SUPABASE_PROJECT_REF = "hdzvqxfrgzzmvwsehcna";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verifica sessão
  const cookieStore = await cookies();
  const token = cookieStore.get(`sb-${SUPABASE_PROJECT_REF}-auth-token`)?.value;

  if (!token) redirect("/login");

  // Verifica se é super admin
  const supabase = createSupabaseAdminClient();
  const { data: authUser } = await supabase.auth.getUser(token);

  if (!authUser.user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("is_super_admin, status")
    .eq("id", authUser.user.id)
    .maybeSingle();

  if (!profile?.is_super_admin || profile?.status !== "active") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/60 px-6 py-4 dark:border-white/[0.06] dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Super Admin
            </p>
            <h1 className="text-xl font-bold text-foreground">Painel de Administração</h1>
          </div>
          <a
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Voltar ao Painel
          </a>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
