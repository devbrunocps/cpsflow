import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { UserRow } from "./user-row";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Usuários — Admin CPSFLOW",
};

async function approveUser(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  const supabase = createSupabaseAdminClient();
  await supabase.from("users").update({ status: "active" }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

async function suspendUser(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  const supabase = createSupabaseAdminClient();
  await supabase.from("users").update({ status: "suspended" }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

async function reactivateUser(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  const supabase = createSupabaseAdminClient();
  await supabase.from("users").update({ status: "active" }).eq("id", userId);
  revalidatePath("/admin/usuarios");
}

async function setMaxInstances(companyId: string, maxInstances: number) {
  "use server";
  const supabase = createSupabaseAdminClient();
  await supabase.from("companies").update({ max_instances: maxInstances }).eq("id", companyId);
  revalidatePath("/admin/usuarios");
}

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string;
  is_super_admin: boolean;
  created_at: string | null;
  company_id: string | null;
  company_name: string | null; // resolvido manualmente
  company_max_instances: number | null;
};

export default async function AdminUsuariosPage() {
  const supabase = createSupabaseAdminClient();

  // Busca usuários com company_id
  const { data: usersRaw } = await supabase
    .from("users")
    .select("id, email, name, role, status, is_super_admin, created_at, company_id")
    .order("created_at", { ascending: false });

  // Busca empresas separadamente para evitar problemas de tipagem com o join
  const companyIds = [...new Set((usersRaw ?? []).map((u) => u.company_id).filter(Boolean))];
  const { data: companies } = companyIds.length > 0
    ? await supabase.from("companies").select("id, name, max_instances").in("id", companyIds)
    : { data: [] };

  const companyMap = new Map((companies ?? []).map((c) => [c.id, { name: c.name, maxInstances: c.max_instances as number | null }]));

  const allUsers: UserRow[] = (usersRaw ?? []).map((u) => ({
    ...u,
    company_name: u.company_id ? (companyMap.get(u.company_id)?.name ?? null) : null,
    company_max_instances: u.company_id ? (companyMap.get(u.company_id)?.maxInstances ?? null) : null,
  }));

  const pendingCount = allUsers.filter((u) => u.status === "pending").length;
  const activeCount = allUsers.filter((u) => u.status === "active").length;




  return (
    <div className="space-y-6">
      <PageHeading
        title="Gerenciar Usuários"
        description="Aprove, suspenda ou gerencie o acesso de empresas ao sistema."
      >
        <div className="flex gap-2">
          <Badge variant="warning">
            <Clock className="mr-1.5 h-3 w-3" />
            {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="success">
            <Users className="mr-1.5 h-3 w-3" />
            {activeCount} ativo{activeCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      </PageHeading>

      {pendingCount > 0 && (
        <div className="rounded-2xl border border-amber-300/40 bg-amber-50/50 p-4 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-semibold">
            🔔 {pendingCount} solicitação{pendingCount !== 1 ? "ões" : ""} aguardando sua aprovação
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Todos os usuários</CardTitle>
          <CardDescription>
            {allUsers.length} conta{allUsers.length !== 1 ? "s" : ""} cadastrada{allUsers.length !== 1 ? "s" : ""} no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-accent/30 p-10 text-center text-sm text-muted-foreground">
              Nenhum usuário cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {allUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onApprove={async (id) => {
                    "use server";
                    const formData = new FormData();
                    formData.append("userId", id);
                    return approveUser(formData);
                  }}
                  onSuspend={async (id) => {
                    "use server";
                    const formData = new FormData();
                    formData.append("userId", id);
                    return suspendUser(formData);
                  }}
                  onReactivate={async (id) => {
                    "use server";
                    const formData = new FormData();
                    formData.append("userId", id);
                    return reactivateUser(formData);
                  }}
                  onUpdateMaxInstances={setMaxInstances}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
