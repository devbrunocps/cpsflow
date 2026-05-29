import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

const variants = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_1px_0_hsl(0_0%_100%/0.18)_inset,0_6px_20px_hsl(158_82%_45%/0.25)] hover:brightness-110 hover:-translate-y-px",
  secondary:
    "bg-secondary text-secondary-foreground border border-border hover:bg-accent",
  outline:
    "border border-border bg-card/40 text-foreground backdrop-blur-sm hover:bg-accent hover:border-border/80",
  ghost:
    "text-muted-foreground hover:bg-accent hover:text-foreground",
  danger:
    "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/15 dark:bg-destructive/15 dark:hover:bg-destructive/25",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
  icon: "h-9 w-9 p-0",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
