import { cn } from "@/lib/utils";

/**
 * Sparkline — micro gráfico de linha em SVG (sem dependências).
 * Usado nos cards de métricas para dar sensação de "dashboard premium".
 */
export function Sparkline({
  data,
  className,
  stroke = "hsl(158 82% 48%)",
  fill = "hsl(158 82% 48% / 0.12)",
  width = 120,
  height = 40,
}: {
  data: number[];
  className?: string;
  stroke?: string;
  fill?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((value, i) => {
    const x = i * stepX;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const gradientId = `spark-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-10 w-full", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * MiniBars — micro gráfico de barras em SVG (sem dependências).
 */
export function MiniBars({
  data,
  className,
  color = "hsl(158 82% 48%)",
}: {
  data: number[];
  className?: string;
  color?: string;
}) {
  const max = Math.max(...data, 1);

  return (
    <div className={cn("flex h-16 items-end gap-1.5", className)} aria-hidden="true">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${Math.max((value / max) * 100, 6)}%`,
            background: `linear-gradient(180deg, ${color}, ${color.replace(")", " / 0.3)")})`,
          }}
        />
      ))}
    </div>
  );
}
