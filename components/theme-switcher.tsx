"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/app/theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <div className="flex gap-0.5 rounded-xl border border-border/60 bg-muted/50 p-1 dark:border-white/[0.08] dark:bg-white/[0.04]">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          title={label}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all duration-200 ${
            theme === value
              ? "bg-primary text-primary-foreground shadow-sm shadow-emerald-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
