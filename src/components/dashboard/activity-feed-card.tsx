import { AlertTriangle, CheckCircle2, Dot } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/lib/dashboard-data";

type ActivityFeedCardProps = {
  title: string;
  description: string;
  items: ActivityItem[];
};

function getIcon(status: ActivityItem["status"]) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="size-4 text-emerald-300" />;
    case "warning":
      return <AlertTriangle className="size-4 text-amber-300" />;
    case "danger":
      return <AlertTriangle className="size-4 text-rose-300" />;
    default:
      return <Dot className="size-5 text-primary" />;
  }
}

export function ActivityFeedCard({
  title,
  description,
  items,
}: ActivityFeedCardProps) {
  return (
    <Card className="rounded-[2rem]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-[1.4rem] border border-white/8 bg-slate-950/45 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="mt-0.5">{getIcon(item.status)}</div>
                <div>
                  <div className="font-medium text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
