import type { Metadata } from "next";
import Link from "next/link";
import { Check, Play } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { ProgressListCard } from "@/components/dashboard/progress-list-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  aiControls,
  aiSettingsMetrics,
  automationRules,
} from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "AI Settings | Voxora AI Dashboard",
  description: "Configure voice persona, escalation logic, multilingual behavior, and automation rules for Voxora AI.",
};

export default function AISettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="AI Settings"
        title="Tune how Voxora sounds, decides, and escalates."
        description="Control voice behavior, confidence thresholds, multilingual routing, and recovery automations from one premium settings surface."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/dashboard/analytics">See impact</Link>
            </Button>
            <Button>
              <Play className="size-4" />
              Test voice flow
            </Button>
          </>
        }
      />

      <MetricGrid items={aiSettingsMetrics} />

      <div className="grid gap-6 xl:grid-cols-3">
        {aiControls.map((item, index) => {
          const Icon = item.icon;

          return (
            <FadeIn key={item.title} delay={index * 0.05}>
              <Card className="rounded-[2rem]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <StatusBadge label={item.status} />
                  </div>
                  <CardTitle className="mt-4">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </FadeIn>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <FadeIn>
          <ProgressListCard
            title="Automation rules"
            description="The current thresholds and live automations shaping conversion and takeover behavior."
            items={automationRules}
          />
        </FadeIn>

        <FadeIn delay={0.06}>
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Prompt and guardrail stack</CardTitle>
              <CardDescription>
                The current instruction layers keeping conversations premium, safe, and on-brand.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {[
                "Brand voice: concise, warm, premium, and calm under pressure.",
                "Industry context: salon, clinic, gym, real estate, and service-specific flows loaded.",
                "Compliance guardrails: no diagnosis, no pricing commitments beyond configured limits.",
                "Human escalation: confidence drops, urgent requests, or VIP callers route immediately.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/8 bg-slate-950/45 px-4 py-4 text-sm text-white/85"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                      <Check className="size-3.5" />
                    </span>
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
