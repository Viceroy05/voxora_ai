import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DonutChartSegment = {
  label: string;
  value: number;
  displayValue?: string;
  meta?: string;
  color: string;
};

type DonutChartCardProps = {
  title: string;
  description: string;
  segments: DonutChartSegment[];
  centerLabel: string;
  centerValue: string;
};

export function DonutChartCard({
  title,
  description,
  segments,
  centerLabel,
  centerValue,
}: DonutChartCardProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let current = 0;
  const gradient = segments
    .map((segment) => {
      const start = current;
      const end = current + (segment.value / total) * 360;
      current = end;

      return `${segment.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex items-center justify-center">
          <div
            className="relative flex size-48 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          >
            <div className="flex size-32 flex-col items-center justify-center rounded-full bg-slate-950 text-center shadow-inner">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {centerLabel}
              </span>
              <span className="mt-2 font-heading text-3xl font-semibold text-white">
                {centerValue}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="rounded-[1.4rem] border border-white/8 bg-slate-950/45 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="size-3 rounded-full" style={{ backgroundColor: segment.color }} />
                  <span className="text-sm font-medium text-white">{segment.label}</span>
                </div>
                <span className="text-sm text-white">
                  {segment.displayValue ?? `${segment.value}%`}
                </span>
              </div>
              {segment.meta ? (
                <p className="mt-2 text-sm text-muted-foreground">{segment.meta}</p>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
