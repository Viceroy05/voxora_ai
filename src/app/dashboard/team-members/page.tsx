import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import {
  DashboardTable,
  type DashboardTableColumn,
} from "@/components/dashboard/dashboard-table";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { teamMembers, teamMetrics, type TeamMember } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Team Members | Voxora AI Dashboard",
  description: "Manage seats, roles, coverage, and human escalation ownership across your Voxora workspace.",
};

const teamColumns: DashboardTableColumn<TeamMember>[] = [
  {
    label: "Member",
    render: (row) => (
      <div>
        <div className="font-medium text-white">{row.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">{row.role}</div>
      </div>
    ),
  },
  {
    label: "Location",
    render: (row) => row.location,
  },
  {
    label: "Coverage",
    render: (row) => <span className="text-white/85">{row.coverage}</span>,
  },
  {
    label: "Status",
    render: (row) => <StatusBadge label={row.status} />,
  },
];

export default function TeamMembersPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Team Members"
        title="Humans stay in control where judgment matters."
        description="Manage operators, escalation owners, and admin seats that work alongside Voxora AI."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/ai-settings">Escalation rules</Link>
            </Button>
            <Button>
              <UserPlus className="size-4" />
              Invite member
            </Button>
          </>
        }
      />

      <MetricGrid items={teamMetrics} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <FadeIn>
          <DashboardTable
            title="Workspace roster"
            description="Roles and coverage windows for everyone who touches Voxora handoffs."
            columns={teamColumns}
            rows={teamMembers}
          />
        </FadeIn>

        <FadeIn delay={0.06}>
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Role permissions</CardTitle>
              <CardDescription>
                Access is scoped so operators only see what they need.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: "Admins",
                  description: "Full access to AI settings, billing, integrations, and analytics exports.",
                },
                {
                  title: "Managers",
                  description: "Manage locations, review calls, approve scripts, and oversee bookings.",
                },
                {
                  title: "Operators",
                  description: "Handle escalations, view assigned bookings, and update call outcomes.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/8 bg-slate-950/45 px-4 py-4"
                >
                  <div className="font-medium text-white">{item.title}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
