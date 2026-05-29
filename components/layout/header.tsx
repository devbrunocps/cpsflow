"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useState } from "react";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/atendimento": "Atendimento",
  "/configuracoes": "Configurações",
  "/produtos": "Catálogo de Produtos",
  "/fluxos": "Fluxos de Venda",
  "/agendamento": "Agendamento",
  "/mensagens": "FAQ & Respostas",
  "/admin/usuarios": "Gerenciar Usuários",
};

const mobileLinks = [
  ["Dashboard", "/dashboard"],
  ["Leads", "/leads"],
  ["Atendimento", "/atendimento"],
  ["Fluxos de Venda", "/fluxos"],
  ["FAQ & Respostas", "/mensagens"],
  ["Agendamento", "/agendamento"],
  ["Catálogo", "/produtos"],
  ["Configurações", "/configuracoes"],
] as const;

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const title = titles[pathname] ?? "CPSFLOW";

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
      {/* Mobile menu trigger */}
      <div className="lg:hidden">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(true)} aria-label="Abrir menu">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex animate-fade-in">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-72 max-w-full border-r border-border bg-card p-5 shadow-2xl animate-slide-up">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">CPSFLOW</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} aria-label="Fechar menu">
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1">
                {mobileLinks.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === href
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-foreground">{title}</h1>
      </div>

      {/* Command search */}
      <button
        type="button"
        className="hidden h-9 items-center gap-2 rounded-xl border border-border bg-background/60 px-3 text-sm text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground md:flex md:w-64 dark:bg-white/[0.03]"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <ThemeSwitcher />

      <Button variant="outline" size="icon" className="relative rounded-xl" aria-label="Notificações">
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background animate-glow-pulse" />
        <Bell className="h-4 w-4" aria-hidden="true" />
      </Button>
    </header>
  );
}
