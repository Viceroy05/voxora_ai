import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChartPoint = {
  label: string;
  value: number;
  secondary?: number;
};

type LineChartCardProps = {
  title: string;
  description: string;
  data: ChartPoint[];
  primaryLabel?: string;
  secondaryLabel?: string;
  className?: string;
};

function buildPath(
  values: number[],
  width: number,
  height: number,
  padding: number,
  maxValue: number,
) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * innerWidth;
      const y = height - padding - (value / maxValue) * innerHeight;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildArea(
  values: number[],
  width: number,
  height: number,
  padding: number,
  maxValue: number,
) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const top = values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * innerWidth;
      const y = height - padding - (value / maxValue) * innerHeight;

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const lastX = padding + innerWidth;
  const baseY = height - padding;

  return `${top} L ${lastX} ${baseY} L ${padding} ${baseY} Z`;
}

export function LineChartCard({
  title,
  description,
  data,
  primaryLabel = "Primary",
  secondaryLabel,
  className,
}: LineChartCardProps) {
  const width = 680;
  const height = 260;
  const padding = 24;
  const primaryValues = data.map((item) => item.value);
  const secondaryValues = data.map((item) => item.secondary ?? 0);
  const combinedMax = Math.max(...primaryValues, ...secondaryValues, 1);
  const primaryPath = buildPath(primaryValues, width, height, padding, combinedMax);
  const primaryArea = buildArea(primaryValues, width, height, padding, combinedMax);
  const hasSecondary = data.some((item) => item.secondary !== undefined);
  const secondaryPath = hasSecondary
    ? buildPath(secondaryValues, width, height, padding, combinedMax)
    : undefined;
  const chartId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <Card className={cn("rounded-[2rem]", className)}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="size-2 rounded-full bg-cyan-300" />
              {primaryLabel}
            </div>
            {secondaryLabel ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <span className="size-2 rounded-full bg-blue-500" />
                {secondaryLabel}
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-[1.75rem] border border-white/8 bg-slate-950/45 p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full">
            <defs>
              <linearGradient id={`${chartId}-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(122, 240, 255, 0.35)" />
                <stop offset="100%" stopColor="rgba(122, 240, 255, 0)" />
              </linearGradient>
            </defs>

            {[0.25, 0.5, 0.75].map((ratio) => {
              const y = height - padding - ratio * (height - padding * 2);

              return (
                <line
                  key={ratio}
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 6"
                />
              );
            })}

            <path d={primaryArea} fill={`url(#${chartId}-area)`} />
            {secondaryPath ? (
              <path
                d={secondaryPath}
                fill="none"
                stroke="rgba(59, 130, 246, 0.85)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            <path
              d={primaryPath}
              fill="none"
              stroke="rgba(122, 240, 255, 0.95)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div
            className="mt-3 grid gap-2 text-center text-xs text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
          >
            {data.map((item) => (
              <span key={item.label}>{item.label}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
