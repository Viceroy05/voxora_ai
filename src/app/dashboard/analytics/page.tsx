import type { Metadata } from "next";
import Link from "next/link";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  DashboardTable,
  type DashboardTableColumn,
} from "@/components/dashboard/dashboard-table";
import { LineChartCard } from "@/components/dashboard/line-chart-card";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { ProgressListCard } from "@/components/dashboard/progress-list-card";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import {
  analyticsMetrics,
  analyticsTrend,
  overviewOutcomeBreakdown,
  locationPerformance,
} from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Analytics | Voxora AI Dashboard",
  description: "Analyze conversion, recovered revenue, AI takeover rates, and location performance.",
};

const locationColumns: DashboardTableColumn<(typeof locationPerformance)[number]>[] = [
  {
    label: "Location",
    render: (row) => <div className="font-medium text-white">{row.location}</div>,
  },
  {
    label: "Answered",
    render: (row) => row.answered,
  },
  {
    label: "Bookings",
    render: (row) => row.bookings,
  },
  {
    label: "Conversion",
    render: (row) => row.conversion,
  },
  {
    label: "Recovered revenue",
    className: "text-right",
    render: (row) => <div className="text-right font-medium text-white">{row.recovered}</div>,
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Analytics"
        title="See what the front desk cannot measure on its own."
        description="Follow conversion, recovery, and confidence metrics across locations to understand how AI is shaping revenue."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/billing">ROI and billing</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/team-members">Compare team coverage</Link>
            </Button>
          </>
        }
      />

      <MetricGrid items={analyticsMetrics} />

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <FadeIn>
          <LineChartCard
            title="Six-week conversion trend"
            description="Qualified lead rate versus recovered revenue trajectory."
            data={analyticsTrend}
            primaryLabel="Qualified lead rate"
            secondaryLabel="Recovered revenue index"
          />
        </FadeIn>

        <FadeIn delay={0.06}>
          <ProgressListCard
            title="Outcome weighting"
            description="How inbound demand is distributed once Voxora finishes the conversation."
            items={overviewOutcomeBreakdown}
          />
        </FadeIn>
      </div>

      <FadeIn>
        <DashboardTable
          title="Location performance"
          description="Operational comparison across the businesses and locations currently powered by Voxora."
          columns={locationColumns}
          rows={locationPerformance}
        />
      </FadeIn>
    </div>
  );
}
