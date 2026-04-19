import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { CtaBanner } from "@/components/marketing/cta-banner";
import { PageHero } from "@/components/marketing/page-hero";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata: Metadata = {
  title: "Pricing | Voxora AI",
  description: "Flexible Voxora AI pricing for salons, clinics, gyms, real estate teams, and service businesses.",
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Clear pricing that scales with your call volume."
        description="Choose the plan that matches your current stage, then upgrade as your inbound demand and automation needs grow."
      />
      <PricingCards showHeading={false} />

      <section className="page-shell py-6 sm:py-10">
        <FadeIn>
          <div className="surface rounded-[2rem] border border-white/10 p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-primary">Included with every plan</p>
                <h2 className="mt-4 font-heading text-3xl font-semibold text-white">Everything needed to launch fast.</h2>
              </div>
              <div className="grid gap-3">
                {[
                  "Business-specific call scripts and FAQs",
                  "Onboarding support and testing",
                  "Spam filtering and intelligent routing",
                  "Conversation summaries and call notes",
                  "Booking flow customization",
                  "Usage and performance reporting",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <CtaBanner />
    </>
  );
}
