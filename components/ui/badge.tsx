import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "success" | "warning" | "error" | "info" | "neutral";
};

const variants = {
  success:
    "bg-emerald-100/80 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/20",
  warning:
    "bg-amber-100/80 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/20",
  error:
    "bg-red-100/80 text-red-800 ring-red-600/20 dark:bg-red-500/15 dark:text-red-300 dark:ring-red-400/20",
  info:
    "bg-blue-100/80 text-blue-800 ring-blue-600/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-400/20",
  neutral:
    "bg-slate-100 text-slate-700 ring-slate-300/40 dark:bg-white/[0.06] dark:text-slate-300 dark:ring-white/10",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
