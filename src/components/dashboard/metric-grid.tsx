import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import type { DashboardMetric } from "@/lib/dashboard-data";

type MetricGridProps = {
  items: DashboardMetric[];
};

export function MetricGrid({ items }: MetricGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-5">
      {items.map((item, index) => {
        const isNegative = item.delta.trim().startsWith("-");
        const isNeutral = !item.delta.includes("+") && !item.delta.includes("-");
        const deltaClasses = isNeutral
          ? "bg-primary/10 text-primary"
          : isNegative
            ? "bg-amber-400/10 text-amber-300"
            : "bg-emerald-400/10 text-emerald-300";
        const DeltaIcon = isNeutral ? ArrowUpRight : isNegative ? ArrowDownRight : ArrowUpRight;

        return (
          <FadeIn key={item.label} delay={index * 0.05}>
            <div className="surface rounded-[1.75rem] border border-white/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${deltaClasses}`}
                >
                  {item.delta}
                  <DeltaIcon className="size-3.5" />
                </span>
              </div>
              <div className="mt-5 font-heading text-3xl font-semibold text-white">{item.value}</div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.helper}</p>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
