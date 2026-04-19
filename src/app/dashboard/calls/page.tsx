"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DemoCallSimulator } from "@/components/dashboard/demo-call-simulator";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  DashboardTable,
  type DashboardTableColumn,
} from "@/components/dashboard/dashboard-table";
import { LineChartCard } from "@/components/dashboard/line-chart-card";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { ProgressListCard } from "@/components/dashboard/progress-list-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { useCurrentBusiness } from "@/components/dashboard/useCurrentBusiness";

type CallRow = {
  id: string;
  caller: string;
  channel: string;
  intent: string;
  duration: string;
  result: string;
  sentiment: string;
  createdAt: string;
};

type CallMetric = {
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

type ProgressItem = {
  label: string;
  value: number;
  displayValue?: string;
  meta?: string;
};

function formatDuration(durationSeconds: number | null | undefined) {
  if (!durationSeconds) {
    return "—";
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return `${minutes}m ${seconds}s`;
}

function getSentimentLabel(raw: unknown) {
  const sentiment = typeof raw === "string" ? raw : undefined;
  if (!sentiment) return "Unknown";
  return sentiment;
}

function getIntent(raw: unknown, summary: string | null | undefined) {
  if (typeof raw === "string" && raw.length > 0) {
    return raw;
  }

  if (summary) {
    return summary.length > 40 ? `${summary.slice(0, 40)}…` : summary;
  }

  return "Call handled";
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function buildTrend(calls: CallRow[]) {
  const buckets = new Map<string, { calls: number; booked: number }>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    buckets.set(formatDateLabel(date), { calls: 0, booked: 0 });
  }

  calls.forEach((call) => {
    const label = formatDateLabel(new Date(call.createdAt));
    const bucket = buckets.get(label);
    if (!bucket) return;
    bucket.calls += 1;
    if (/BOOKED|CONFIRMED|SCHEDULED/i.test(call.result)) {
      bucket.booked += 1;
    }
  });

  return Array.from(buckets.entries()).map(([label, values]) => ({
    label,
    value: values.calls,
    secondary: values.booked,
  }));
}

function buildDisposition(calls: CallRow[]): ProgressItem[] {
  const counts = calls.reduce<Record<string, number>>((acc, call) => {
    acc[call.result] = (acc[call.result] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, value]) => ({
      label,
      value,
      displayValue: `${value}`,
      meta: "Recent calls",
    }));
}

function buildMetrics(calls: CallRow[]): CallMetric[] {
  const total = calls.length;
  const completed = calls.filter((call) => /COMPLETED|IN_PROGRESS|RINGING/i.test(call.result)).length;
  const booked = calls.filter((call) => /BOOKED|CONFIRMED|SCHEDULED/i.test(call.result)).length;
  const avgSeconds = total
    ? Math.round(
        calls.reduce((sum, call) => sum + Number(call.duration?.split("m")[0] || 0) * 60, 0) / total,
      )
    : 0;
  const duration = avgSeconds ? `${Math.round(avgSeconds / 60)}m` : "—";
  const positive = calls.filter((call) => /positive/i.test(call.sentiment)).length;

  return [
    {
      label: "Recent calls",
      value: `${total}`,
      delta: "—",
      helper: "Loaded from live call logs",
    },
    {
      label: "Calls handled",
      value: `${completed}`,
      delta: total ? `+${Math.round((completed / total) * 100)}%` : "—",
      helper: "Total answered or in progress",
    },
    {
      label: "Avg handle time",
      value: duration,
      delta: "—",
      helper: "Based on recent call duration",
    },
    {
      label: "Positive sentiment",
      value: total ? `${Math.round((positive / total) * 100)}%` : "—",
      delta: "—",
      helper: "From AI call analysis",
    },
  ];
}

const callColumns: DashboardTableColumn<CallRow>[] = [
  {
    label: "Caller",
    render: (row) => row.caller,
  },
  {
    label: "Channel",
    render: (row) => row.channel,
  },
  {
    label: "Intent",
    render: (row) => row.intent,
  },
  {
    label: "Duration",
    render: (row) => row.duration,
  },
  {
    label: "Result",
    render: (row) => <StatusBadge status={row.result} />,
  },
  {
    label: "Sentiment",
    render: (row) => row.sentiment,
  },
  {
    label: "Date",
    render: (row) => new Date(row.createdAt).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  },
];

export default function CallsPage() {
  const { businessId, loading: businessLoading, error: businessError } = useCurrentBusiness();
  const [calls, setCalls] = useState<CallRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;

    async function loadCalls() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/businesses/${businessId}/calls?limit=25`, {
          cache: "no-store",
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || "Unable to load call data.");
        }

        const payload = await response.json();
        const rows = (payload.calls ?? []).map((call: any) => {
          const analysis = typeof call.aiAnalysis === "object" ? call.aiAnalysis : {};
          return {
            id: call.id,
            caller: call.customerName || call.callerPhone || "Unknown",
            channel: call.direction || "Voice",
            intent: getIntent(analysis?.callerIntent, call.summaryText),
            duration: formatDuration(call.durationSeconds),
            result: analysis?.disposition || call.status || "Unknown",
            sentiment: getSentimentLabel(analysis?.sentiment),
            createdAt: call.createdAt,
          };
        });

        setCalls(rows);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load call data.");
      } finally {
        setLoading(false);
      }
    }

    loadCalls();
  }, [businessId]);

  const metrics = useMemo(() => buildMetrics(calls), [calls]);
  const trend = useMemo(() => buildTrend(calls), [calls]);
  const dispositionBreakdown = useMemo(() => buildDisposition(calls), [calls]);

  const isLoading = businessLoading || loading;
  const pageError = businessError || error;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Salon calls"
        title="Every customer call handled like a premium guest."
        description="Monitor live call handling, sentiment, missed recovery, and pickup speed for salon appointments and lead conversion."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/analytics">Disposition report</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/ai-settings">Tune AI settings</Link>
            </Button>
          </>
        }
      />

      {pageError ? (
        <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/5 p-8 text-white">
          <p className="font-semibold">Unable to load calls</p>
          <p className="mt-2 text-sm text-muted-foreground">{pageError}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading recent calls...</div>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading chart...</div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading breakdown...</div>
          </div>
        </div>
      ) : (
        <>
          <DemoCallSimulator businessId={businessId} onSimulationComplete={() => {
            // Reload calls to show updated data
            window.location.reload();
          }} />

          <MetricGrid items={metrics} />

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <FadeIn>
              <LineChartCard
                title="Calls handled this week"
                description="Recent call volume and booked outcomes by day."
                data={trend}
                primaryLabel="Handled calls"
                secondaryLabel="Booked calls"
              />
            </FadeIn>

            <FadeIn delay={0.06}>
              <ProgressListCard
                title="Disposition breakdown"
                description="How Voxora resolves inbound demand before human takeover is needed."
                items={dispositionBreakdown}
              />
            </FadeIn>
          </div>

          <FadeIn>
            {calls.length > 0 ? (
              <DashboardTable
                title="Recent calls"
                description="Latest handled conversations across your connected voice and recovery channels."
                columns={callColumns}
                rows={calls}
              />
            ) : (
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-10 text-center">
                <p className="text-lg font-semibold text-white">No recent calls found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your business has not received any call logs yet. Once Twilio starts sending call events, data will appear here.
                </p>
              </div>
            )}
          </FadeIn>
        </>
      )}
    </div>
  );
}
