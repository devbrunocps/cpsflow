import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { createSupabaseAdminClient, getSessionCookieName } from "@/lib/supabase";
import { cn } from "@/lib/utils";

async function getSidebarData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getSessionCookieName())?.value;
    if (!token) return null;

    const supabase = createSupabaseAdminClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return null;

    // 1. Busca perfil do usuário (com company_id)
    const { data: profile } = await supabase
      .from("users")
      .select("is_super_admin, company_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return null;

    // 2. Busca nome e logo da empresa
    let companyName = "Minha Empresa";
    let logoUrl: string | null = null;
    if (profile.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("name, logo_url")
        .eq("id", profile.company_id)
        .maybeSingle();

      if (company?.name) companyName = company.name;
      if (company?.logo_url) logoUrl = company.logo_url;
    }

    const initials = companyName
      .split(" ")
      .slice(0, 2)
      .map((w: string) => w[0]?.toUpperCase() ?? "")
      .join("") || "ME";

    return {
      companyName,
      companyInitials: initials,
      logoUrl,
      isSuperAdmin: profile.is_super_admin ?? false,
    };
  } catch {
    return null;
  }
}

export async function PageShell({ children }: { children: React.ReactNode }) {
  const sidebarData = await getSidebarData();

  return (
    <div className="relative min-h-screen bg-transparent text-foreground">
      <Sidebar
        companyName={sidebarData?.companyName ?? "Minha Empresa"}
        companyInitials={sidebarData?.companyInitials ?? "ME"}
        logoUrl={sidebarData?.logoUrl}
        isSuperAdmin={sidebarData?.isSuperAdmin ?? false}
      />

      <div className={cn("relative z-10 lg:pl-[264px]")}>
        <Header />
        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
