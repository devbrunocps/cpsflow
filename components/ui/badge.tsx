import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "success" | "warning" | "error" | "info" | "neutral" | "primary";
};

const variants = {
  success:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
  warning:
    "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
  error:
    "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300",
  info:
    "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
  neutral:
    "bg-muted text-muted-foreground ring-border dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10",
  primary:
    "bg-primary/10 text-primary ring-primary/20 dark:text-emerald-300",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
