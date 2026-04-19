import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, Download } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  DashboardTable,
  type DashboardTableColumn,
} from "@/components/dashboard/dashboard-table";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { ProgressListCard } from "@/components/dashboard/progress-list-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { billingMetrics, invoices, type InvoiceRow } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Billing | Voxora AI Dashboard",
  description: "Manage plan usage, invoices, payment methods, and ROI across Voxora AI.",
};

const invoiceColumns: DashboardTableColumn<InvoiceRow>[] = [
  {
    label: "Invoice",
    render: (row) => (
      <div>
        <div className="font-medium text-white">{row.invoice}</div>
        <div className="mt-1 text-xs text-muted-foreground">{row.period}</div>
      </div>
    ),
  },
  {
    label: "Amount",
    render: (row) => row.amount,
  },
  {
    label: "Status",
    render: (row) => <StatusBadge label={row.status} />,
  },
  {
    label: "Method",
    className: "text-right",
    render: (row) => <div className="text-right text-white/85">{row.method}</div>,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Billing"
        title="Usage, spend, and ROI in one operating view."
        description="Keep plan usage transparent while tying Voxora cost directly to recovered and converted revenue."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/analytics">See ROI details</Link>
            </Button>
            <Button disabled title="Invoice export is not wired yet.">
              <Download className="size-4" />
              Export coming soon
            </Button>
          </>
        }
      />

      <MetricGrid items={billingMetrics} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <FadeIn>
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Current subscription</CardTitle>
              <CardDescription>
                Your active workspace plan and the operating capabilities it unlocks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="surface-strong rounded-[1.75rem] border border-white/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Plan</div>
                    <div className="mt-2 font-heading text-3xl font-semibold text-white">Growth</div>
                  </div>
                  <StatusBadge label="Active" />
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Includes advanced automations, analytics, CRM sync, and multi-location routing.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/45 px-4 py-4">
                <div className="flex items-center gap-3 text-white">
                  <CreditCard className="size-4 text-primary" />
                  Visa ending 4242
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Auto-pay enabled. Next invoice closes in 12 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.06}>
          <ProgressListCard
            title="Usage by capability"
            description="Where this month's AI volume is being spent across the workspace."
            items={[
              {
                label: "Inbound voice minutes",
                value: 84,
                displayValue: "84%",
                meta: "Primary call handling",
              },
              {
                label: "Missed-call recovery",
                value: 48,
                displayValue: "48%",
                meta: "SMS + callback automations",
              },
              {
                label: "CRM sync workflows",
                value: 62,
                displayValue: "62%",
                meta: "Lead and booking pushes",
              },
              {
                label: "Analytics processing",
                value: 39,
                displayValue: "39%",
                meta: "Conversation summaries and scoring",
              },
            ]}
          />
        </FadeIn>
      </div>

      <FadeIn>
        <DashboardTable
          title="Invoice history"
          description="Recent billing periods, payment status, and payment methods on file."
          columns={invoiceColumns}
          rows={invoices}
        />
      </FadeIn>
    </div>
  );
}
