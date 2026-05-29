import { cn } from "@/lib/utils";

/**
 * BrandMark — o símbolo visual do CPSFLOW.
 * Um "flow" abstrato: dois nós conectados por um caminho, sugerindo automação.
 */
export function BrandMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-2xl",
        "bg-[hsl(222_24%_9%)] text-primary ring-1 ring-primary/30",
        "shadow-[0_8px_24px_hsl(158_82%_45%/0.25),inset_0_1px_0_hsl(0_0%_100%/0.08)]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: size * 0.55, height: size * 0.55 }}
      >
        <circle cx="6" cy="6" r="2.4" />
        <circle cx="18" cy="18" r="2.4" />
        <path d="M6 8.4v3.2A3.4 3.4 0 0 0 9.4 15h5.2" />
      </svg>
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />
    </span>
  );
}

export function BrandLockup({
  className,
  subtitle = "Atendimento com IA",
  size = 40,
  invert = false,
}: {
  className?: string;
  subtitle?: string;
  size?: number;
  invert?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark size={size} />
      <div className="min-w-0 leading-tight">
        <p
          className={cn(
            "truncate text-sm font-semibold tracking-tight",
            invert ? "text-white" : "text-foreground",
          )}
        >
          CPSFLOW
        </p>
        <p
          className={cn(
            "truncate text-[11px]",
            invert ? "text-white/70" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
