import type { Metadata } from "next";
import Link from "next/link";
import { Plus, RefreshCcw } from "lucide-react";

import { ActivityFeedCard } from "@/components/dashboard/activity-feed-card";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  integrationMetrics,
  integrations,
  integrationSyncFeed,
} from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Integrations | Voxora AI Dashboard",
  description: "Manage CRM, calendar, billing, and messaging integrations connected to Voxora AI.",
};

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Integrations"
        title="Connected systems that keep voice operations in sync."
        description="Keep CRM, calendar, payments, messaging, and workflow tools healthy so every call becomes actionable data."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/ai-settings">Webhook rules</Link>
            </Button>
            <Button disabled title="Integration setup UI is not wired yet.">
              <Plus className="size-4" />
              Add integration soon
            </Button>
          </>
        }
      />

      <MetricGrid items={integrationMetrics} />

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((integration, index) => {
          const Icon = integration.icon;

          return (
            <FadeIn key={integration.id} delay={index * 0.05}>
              <Card className="rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <StatusBadge label={integration.status} />
                  </div>
                  <CardTitle className="mt-4">{integration.name}</CardTitle>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">{integration.sync}</span>
                  <Button
                    disabled
                    title="Manual sync actions are not wired yet."
                    variant="ghost"
                    size="sm"
                  >
                    <RefreshCcw className="size-4" />
                    Sync soon
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn>
        <ActivityFeedCard
          title="Recent sync activity"
          description="Latest integration events across CRM, calendar, and workflow systems."
          items={integrationSyncFeed}
        />
      </FadeIn>
    </div>
  );
}
