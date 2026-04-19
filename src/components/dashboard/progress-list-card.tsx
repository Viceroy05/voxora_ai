import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProgressItem = {
  label: string;
  value: number;
  displayValue?: string;
  meta?: string;
};

type ProgressListCardProps = {
  title: string;
  description: string;
  items: ProgressItem[];
};

export function ProgressListCard({
  title,
  description,
  items,
}: ProgressListCardProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                {item.meta ? <div className="text-xs text-muted-foreground">{item.meta}</div> : null}
              </div>
              <div className="text-sm text-white">{item.displayValue ?? item.value}</div>
            </div>
            <div className="h-3 rounded-full bg-white/6">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-cyan-200"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
