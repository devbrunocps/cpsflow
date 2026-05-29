"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useState } from "react";
import { cn } from "@/lib/utils";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/configuracoes": "Configurações",
  "/produtos": "Catálogo de Produtos",
  "/fluxos": "Fluxos de Atendimento",
  "/mensagens": "FAQ",
  "/admin/usuarios": "Gerenciar Usuários",
};

const mobileLinks = [
  ["Dashboard", "/dashboard"],
  ["Leads", "/leads"],
  ["FAQ", "/mensagens"],
  ["Fluxos de Venda", "/fluxos"],
  ["Catálogo", "/produtos"],
  ["Configurações", "/configuracoes"],
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b border-border/50 bg-card/70 px-4 glass sm:px-6 lg:px-8 dark:border-white/[0.06] dark:bg-slate-950/70">
      <div className="lg:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex animate-fade-in">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-full border-r border-border/50 bg-card p-6 shadow-2xl animate-slide-up dark:border-white/[0.08] dark:bg-slate-900">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-semibold text-foreground">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
              <nav className="flex flex-col gap-2">
                {mobileLinks.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      pathname === href
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
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

      <div className="flex-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {titles[pathname] ?? "Atendente Inteligente"}
        </h1>
        <p className="mt-1 hidden text-xs font-medium text-muted-foreground sm:block">
          Gerencie seu atendimento no WhatsApp com IA
        </p>
      </div>

      <div className="hidden w-full max-w-sm items-center gap-2 rounded-full border border-border/60 bg-accent/50 px-4 py-1.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 md:flex dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus-within:border-emerald-500/40">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <Input
          className="h-7 border-0 bg-transparent px-0 text-sm shadow-none outline-none focus:ring-0"
          placeholder="Buscar clientes ou fluxos..."
        />
      </div>

      <ThemeSwitcher />

      <Button 
        variant="outline" 
        size="icon" 
        className="relative rounded-full"
      >
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card animate-glow-pulse"></span>
        <Bell className="h-4 w-4" aria-hidden="true" />
      </Button>
    </header>
  );
}
