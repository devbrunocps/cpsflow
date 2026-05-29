import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-background/60 px-3.5 text-sm text-foreground outline-none transition-all duration-200 dark:bg-white/[0.03]",
        "focus:border-primary/60 focus:ring-4 focus:ring-primary/10 hover:border-border/80",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
