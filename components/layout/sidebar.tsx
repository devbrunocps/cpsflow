"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarDays,
  Headphones,
  LayoutDashboard,
  MessageSquareText,
  Package,
  Settings,
  Users,
  Workflow,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/mensagens", label: "FAQ", icon: MessageSquareText },
  { href: "/atendimento", label: "Atendimento", icon: Headphones },
  { href: "/fluxos", label: "Fluxos de Venda", icon: Workflow },
  { href: "/agendamento", label: "Agendamento", icon: CalendarDays },
  { href: "/produtos", label: "Catálogo", icon: Package },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export type SidebarProps = {
  companyName: string;
  companyInitials: string;
  logoUrl?: string | null;
  isSuperAdmin?: boolean;
};

export function Sidebar({ companyName, companyInitials, logoUrl, isSuperAdmin }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-border/50 bg-card/60 glass lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:flex lg:flex-col dark:border-white/[0.06] dark:bg-slate-950/60">
      {/* Logo */}
      <div className="flex h-20 items-center gap-4 border-b border-border/50 px-6 dark:border-white/[0.06]">
        {/* Avatar da empresa — logo customizada ou ícone padrão */}
        {logoUrl ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10 dark:ring-white/10">
            <Image
              src={logoUrl}
              alt={`Logo ${companyName}`}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          </div>
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-emerald-500/20"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(74 222 128) 0%, rgb(20 184 166) 52%, rgb(6 182 212) 100%)",
            }}
          >
            <Bot className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
        <div>
          <p className="text-base font-bold tracking-tight text-foreground">
            {companyName}
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-400">
            CPSFLOW
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          Menu Principal
        </div>
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex h-12 items-center justify-between rounded-2xl px-3 transition-all duration-200",
                  active
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20"
                    : "border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-foreground",
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
                {active && <ChevronRight className="h-4 w-4 text-emerald-500/60 dark:text-emerald-400/60" />}
              </Link>
            );
          })}
        </nav>

        {/* Super admin link */}
        {isSuperAdmin && (
          <div className="mt-4">
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Administração
            </div>
            <Link
              href="/admin/usuarios"
              className={cn(
                "group flex h-12 items-center justify-between rounded-2xl px-3 transition-all duration-200",
                pathname.startsWith("/admin")
                  ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20"
                  : "border border-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <Shield
                  className={cn(
                    "h-5 w-5 transition-colors",
                    pathname.startsWith("/admin") ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground group-hover:text-foreground",
                  )}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold">Gerenciar Usuários</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* User card */}
      <div className="border-t border-border/50 p-4 dark:border-white/[0.06]">
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-accent/50 p-3 transition-colors hover:bg-accent dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.06]">
          {logoUrl ? (
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 dark:ring-white/10">
              <Image
                src={logoUrl}
                alt={companyName}
                fill
                className="object-cover"
                sizes="36px"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-inner"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(14 165 233) 0%, rgb(99 102 241) 100%)" }}
            >
              {companyInitials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{companyName}</p>
            <p className="truncate text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {isSuperAdmin ? "Super Admin" : "Plano Pro"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
