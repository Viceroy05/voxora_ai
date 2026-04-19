"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  DashboardTable,
  type DashboardTableColumn,
} from "@/components/dashboard/dashboard-table";

interface BookingData {
  id: string;
  customerName: string;
  serviceName: string;
  startsAt: string;
  status: string;
  amountCents: number;
}
import { DonutChartCard } from "@/components/dashboard/donut-chart-card";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { useCurrentBusiness } from "@/components/dashboard/useCurrentBusiness";

type BookingRow = {
  id: string;
  customer: string;
  owner: string;
  service: string;
  time: string;
  status: string;
  value: string;
};

type BookingMetric = {
  label: string;
  value: string;
  delta: string;
  helper: string;
};

type DonutSegment = {
  label: string;
  value: number;
  color: string;
};

function formatMoney(amountCents: number | null | undefined) {
  if (!amountCents) return "₹0";
  return `₹${(amountCents / 100).toLocaleString("en-IN")}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function buildMetrics(bookings: BookingRow[]): BookingMetric[] {
  const total = bookings.length;
  const confirmed = bookings.filter((booking) => booking.status === "CONFIRMED").length;
  const rescheduled = bookings.filter((booking) => booking.status === "RESCHEDULED").length;
  const revenue = bookings.reduce((sum, booking) => {
    const numeric = Number(booking.value.replace(/[₹,]/g, ""));
    return sum + (Number.isFinite(numeric) ? numeric : 0);
  }, 0);

  return [
    {
      label: "Bookings this week",
      value: `${total}`,
      delta: "—",
      helper: "Live bookings from the last load",
    },
    {
      label: "Confirmed bookings",
      value: `${confirmed}`,
      delta: total ? `+${Math.round((confirmed / total) * 100)}%` : "—",
      helper: "Confirmed appointments",
    },
    {
      label: "Revenue impact",
      value: `₹${Math.round(revenue).toLocaleString("en-IN")}`,
      delta: "—",
      helper: "Estimated booking value",
    },
    {
      label: "Reschedules",
      value: `${rescheduled}`,
      delta: total ? `${Math.round((rescheduled / total) * 100)}%` : "—",
      helper: "Bookings changed after initial booking",
    },
  ];
}

function buildSourceSegments(bookings: BookingRow[]): DonutSegment[] {
  const counts = bookings.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  const palette = ["#7af0ff", "#5b8cff", "#34d399", "#f59e0b", "#fb7185"];

  return Object.entries(counts).map(([label, value], index) => ({
    label,
    value,
    color: palette[index % palette.length],
  }));
}

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
    render: (row) => row.service,
  },
  {
    label: "Time",
    render: (row) => <span className="text-white/85">{row.time}</span>,
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

export default function BookingsPage() {
  const { businessId, loading: businessLoading, error: businessError } = useCurrentBusiness();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) return;

    async function loadBookings() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/businesses/${businessId}/bookings?limit=25`, {
          cache: "no-store",
        });
        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || "Unable to load booking data.");
        }

        const payload = await response.json();
        const rows = (payload.bookings ?? []).map((booking: BookingData) => ({
          id: booking.id,
          customer: booking.customerName,
          owner: "Voxora AI",
          service: booking.serviceName,
          time: formatDate(booking.startsAt),
          status: booking.status,
          value: formatMoney(booking.amountCents),
        }));

        setBookings(rows);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unable to load booking data.");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, [businessId]);

  const metrics = useMemo(() => buildMetrics(bookings), [bookings]);
  const segments = useMemo(() => buildSourceSegments(bookings), [bookings]);

  const isLoading = businessLoading || loading;
  const pageError = businessError || error;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Salon bookings"
        title="Fill more appointment slots without lifting a finger."
        description="Track salon appointments, reschedules, revenue impact, and the channels that convert salon leads best."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/integrations">Calendar sync</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/calls">Review call sources</Link>
            </Button>
          </>
        }
      />

      {pageError ? (
        <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/5 p-8 text-white">
          <p className="font-semibold">Unable to load bookings</p>
          <p className="mt-2 text-sm text-muted-foreground">{pageError}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading booking metrics...</div>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading table...</div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8">Loading chart...</div>
          </div>
        </div>
      ) : (
        <>
          <MetricGrid items={metrics} />

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <FadeIn>
              {bookings.length > 0 ? (
                <DashboardTable
                  title="Latest bookings"
                  description="Appointments and lead handoffs created or confirmed by Voxora AI."
                  columns={bookingColumns}
                  rows={bookings}
                />
              ) : (
                <div className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-10 text-center">
                  <p className="text-lg font-semibold text-white">No bookings yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Once Voxora starts scheduling appointments, your latest bookings will show up here.
                  </p>
                </div>
              )}
            </FadeIn>

            <FadeIn delay={0.06}>
              <DonutChartCard
                title="Booking status mix"
                description="Live status distribution for recent bookings."
                centerLabel="Status"
                centerValue={`${bookings.length}`}
                segments={segments.length > 0 ? segments : [{ label: "No bookings", value: 1, color: "#64748b" }]}
              />
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}
