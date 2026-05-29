"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Headphones,
  LayoutDashboard,
  MessageSquareText,
  Package,
  Settings,
  Users,
  Workflow,
  Shield,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Geral",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/leads", label: "Leads", icon: Users },
      { href: "/atendimento", label: "Atendimento", icon: Headphones },
    ],
  },
  {
    label: "Automação",
    items: [
      { href: "/fluxos", label: "Fluxos de Venda", icon: Workflow },
      { href: "/mensagens", label: "FAQ & Respostas", icon: MessageSquareText },
      { href: "/agendamento", label: "Agendamento", icon: CalendarDays },
    ],
  },
  {
    label: "Negócio",
    items: [
      { href: "/produtos", label: "Catálogo", icon: Package },
      { href: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
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
    <aside className="hidden h-screen w-[264px] shrink-0 flex-col border-r border-border bg-card lg:fixed lg:left-0 lg:top-0 lg:z-40 lg:flex dark:bg-[hsl(222_24%_5%/0.85)] dark:backdrop-blur-2xl">
      {/* Brand */}
      <div className="flex h-[68px] items-center gap-3 border-b border-border px-5">
        {logoUrl ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-border">
            <Image src={logoUrl} alt={`Logo ${companyName}`} fill className="object-cover" sizes="40px" unoptimized />
          </div>
        ) : (
          <BrandMark size={40} />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-foreground">{companyName}</p>
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
            CPSFLOW
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-foreground ring-1 ring-primary/15"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_hsl(158_82%_45%/0.8)]" />
                    )}
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {isSuperAdmin && (
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Administração
            </p>
            <Link
              href="/admin/usuarios"
              className={cn(
                "group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200",
                pathname.startsWith("/admin")
                  ? "bg-amber-500/10 text-foreground ring-1 ring-amber-500/15"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {pathname.startsWith("/admin") && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber-500" />
              )}
              <Shield
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  pathname.startsWith("/admin") ? "text-amber-500" : "text-muted-foreground group-hover:text-foreground",
                )}
                aria-hidden="true"
              />
              <span className="truncate">Gerenciar Usuários</span>
            </Link>
          </div>
        )}
      </nav>

      {/* AI status card */}
      <div className="px-3 pb-2">
        <div className="spotlight relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] p-3.5">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            IA ativa
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Respostas automáticas rodando 24/7 no seu WhatsApp.
          </p>
          <Link
            href="/configuracoes"
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:brightness-110"
          >
            Gerenciar IA
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* User card */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-accent">
          {logoUrl ? (
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
              <Image src={logoUrl} alt={companyName} fill className="object-cover" sizes="36px" unoptimized />
            </div>
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-foreground ring-1 ring-border">
              {companyInitials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{companyName}</p>
            <p className="truncate text-xs text-muted-foreground">{isSuperAdmin ? "Super Admin" : "Plano Pro"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
