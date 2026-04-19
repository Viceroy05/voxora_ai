"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ActivityFeedCard } from "@/components/dashboard/activity-feed-card";
import { DemoCallSimulator } from "@/components/dashboard/demo-call-simulator";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  DashboardTable,
  type DashboardTableColumn,
} from "@/components/dashboard/dashboard-table";
import { DonutChartCard } from "@/components/dashboard/donut-chart-card";
import { LineChartCard } from "@/components/dashboard/line-chart-card";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { useCurrentBusiness } from "@/components/dashboard/useCurrentBusiness";

type OverviewMetric = {
  label: string;
  value: string;
  delta: string;
  helper: string;
};

type TrendPoint = {
  label: string;
  value: number;
  secondary?: number;
};

type OutcomeSegment = {
  label: string;
  value: number;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "danger" | "secondary";
};

type BookingRow = {
  id: string;
  customer: string;
  owner: string;
  service: string;
  time: string;
  status: string;
  value: string;
};

type OverviewResponse = {
  metrics: OverviewMetric[];
  trend: TrendPoint[];
  outcomeBreakdown: OutcomeSegment[];
  activities: ActivityItem[];
  bookingsTable: BookingRow[];
};

const bookingColumns: DashboardTableColumn<BookingRow>[] = [
  {
    label: "Customer",
    render: (row) => (
      <div>
        <div className="font-medium text-white">{row.customer}</div>
        <div className="mt-1 text-xs text-muted-foreground">{row.owner}</div>
      </div>
    ),
  },
  {
    label: "Service",
    render: (row) => (
      <div>
        <div>{row.service}</div>
        <div className="mt-1 text-xs text-muted-foreground">{row.time}</div>
      </div>
    ),
  },
  {
    label: "Status",
    render: (row) => <StatusBadge label={row.status} />,
  },
  {
    label: "Value",
    className: "text-right",
    render: (row) => <div className="text-right font-medium text-white">{row.value}</div>,
  },
];

export default function DashboardOverviewPage() {
  const { businessId, loading: businessLoading, error: businessError } = useCurrentBusiness();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;

    async function loadOverview() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/businesses/${businessId}/overview`, {
          cache: "no-store",
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || "Unable to load overview data.");
        }

        const payload = (await response.json()) as OverviewResponse;
        setOverview(payload);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load overview data.");
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, [businessId]);

  const isLoading = businessLoading || loading;
  const pageError = businessError || error;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Salon Operations"
        title="Salon performance, powered by Voxora AI."
        description="Track answered calls, bookings, recovered missed leads, and daily revenue impact for your salon business in India."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/analytics">View analytics</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/calls">Open live calls</Link>
            </Button>
          </>
        }
      />

      {pageError ? (
        <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/5 p-8 text-white">
          <p className="font-semibold">Unable to load overview</p>
          <p className="mt-2 text-sm text-muted-foreground">{pageError}</p>
        </div>
      ) : isLoading || !overview ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading overview metrics...</div>
          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading chart...</div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading outcome mix...</div>
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading activity...</div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading bookings...</div>
          </div>
        </div>
      ) : (
        <>
          <DemoCallSimulator businessId={businessId} onSimulationComplete={async () => {
            // Refresh overview data without full page reload
            setLoading(true);
            setError(null);
            try {
              const response = await fetch(`/api/businesses/${businessId}/overview`, {
                cache: "no-store",
              });
              if (response.ok) {
                const payload = await response.json();
                setOverview(payload);
              }
            } catch (err) {
              console.error("Failed to refresh overview:", err);
            } finally {
              setLoading(false);
            }
          }} />

          <MetricGrid items={overview.metrics} />

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <FadeIn>
              <LineChartCard
                title="Weekly call and booking trend"
                description="Compare handled call volume against booking creation across the last 7 days."
                data={overview.trend}
                primaryLabel="Calls answered"
                secondaryLabel="Bookings"
              />
            </FadeIn>

            <FadeIn delay={0.06}>
              <DonutChartCard
                title="Call outcome mix"
                description="Where inbound conversations end up after Voxora handles them."
                centerLabel="Outcomes"
                centerValue={`${overview.outcomeBreakdown.reduce((sum, item) => sum + item.value, 0)}`}
                segments={overview.outcomeBreakdown.map((segment, index) => ({
                  ...segment,
                  color: ["#7af0ff", "#5b8cff", "#34d399", "#f59e0b", "#fb7185"][index % 5],
                }))}
              />
            </FadeIn>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <FadeIn>
              <ActivityFeedCard
                title="Live activity"
                description="Events that matter most to revenue and customer experience right now."
                items={overview.activities}
              />
            </FadeIn>

            <FadeIn delay={0.06}>
              {overview.bookingsTable.length > 0 ? (
                <DashboardTable
                  title="Upcoming bookings"
                  description="Appointments and lead handoffs created directly by Voxora AI."
                  columns={bookingColumns}
                  rows={overview.bookingsTable}
                />
              ) : (
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-10 text-center">
                  <p className="text-lg font-semibold text-white">No upcoming bookings</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bookings will appear here once calls are converted into appointments.
                  </p>
                </div>
              )}
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}
