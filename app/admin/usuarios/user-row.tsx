"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Building2, Save, Smartphone, Loader2 } from "lucide-react";

type UserRowData = {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  status: string;
  is_super_admin: boolean;
  created_at: string | null;
  company_id: string | null;
  company_name: string | null;
  company_max_instances: number | null;
};

const statusConfig = {
  pending: { label: "Aguardando", variant: "warning" as const },
  active: { label: "Ativo", variant: "success" as const },
  suspended: { label: "Suspenso", variant: "neutral" as const },
};

interface UserRowProps {
  user: UserRowData;
  onApprove: (id: string) => Promise<void>;
  onSuspend: (id: string) => Promise<void>;
  onReactivate: (id: string) => Promise<void>;
  onUpdateMaxInstances: (companyId: string, max: number) => Promise<void>;
}

export function UserRow({
  user: initialUser,
  onApprove,
  onSuspend,
  onReactivate,
  onUpdateMaxInstances,
}: UserRowProps) {
  const [user, setUser] = useState(initialUser);
  const [maxInstances, setMaxInstances] = useState(user.company_max_instances ?? 1);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const config = statusConfig[user.status as keyof typeof statusConfig] ?? statusConfig.pending;

  async function handleStatusAction(action: "approve" | "suspend" | "reactivate") {
    setLoadingAction(action);
    try {
      if (action === "approve") await onApprove(user.id);
      if (action === "suspend") await onSuspend(user.id);
      if (action === "reactivate") await onReactivate(user.id);
      
      setUser((prev) => ({
        ...prev,
        status: action === "suspend" ? "suspended" : "active",
      }));
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleSaveInstances() {
    if (!user.company_id) return;
    setLoadingAction("save_instances");
    try {
      await onUpdateMaxInstances(user.company_id, maxInstances);
      setUser((prev) => ({ ...prev, company_max_instances: maxInstances }));
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-accent/20 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08] dark:bg-white/[0.02]">
      {/* Info do usuário */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-sm">
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground truncate">
              {user.name ?? "Sem nome"}
            </p>
            {user.is_super_admin && (
              <Badge variant="info" className="text-xs">Super Admin</Badge>
            )}
          </div>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            <span>{user.company_name ?? "—"}</span>
            <span>·</span>
            <span>
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("pt-BR")
                : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Status + Ações */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant={config.variant}>{config.label}</Badge>

          {!user.is_super_admin && (
            <>
              {user.status === "pending" && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={loadingAction !== null}
                  onClick={() => handleStatusAction("approve")}
                >
                  {loadingAction === "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Aprovar
                </Button>
              )}
              {user.status === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-900/40 dark:text-red-400"
                  disabled={loadingAction !== null}
                  onClick={() => handleStatusAction("suspend")}
                >
                  {loadingAction === "suspend" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Suspender
                </Button>
              )}
              {user.status === "suspended" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loadingAction !== null}
                  onClick={() => handleStatusAction("reactivate")}
                >
                  {loadingAction === "reactivate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Reativar
                </Button>
              )}
            </>
          )}
        </div>

        {/* Máx. instâncias WhatsApp */}
        {!user.is_super_admin && user.status === "active" && user.company_id && (
          <div className="flex items-center gap-2 mt-1">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
              <Smartphone className="h-3 w-3" />
              Máx. instâncias
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={maxInstances}
              onChange={(e) => setMaxInstances(Number(e.target.value))}
              className="w-16 h-7 text-xs px-2"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs"
              disabled={loadingAction !== null || maxInstances === user.company_max_instances}
              onClick={handleSaveInstances}
            >
              {loadingAction === "save_instances" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Salvar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
