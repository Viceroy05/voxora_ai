import type { Metadata } from "next";

import { CtaBanner } from "@/components/marketing/cta-banner";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { FadeIn } from "@/components/shared/fade-in";
import { featureSpotlights } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Features | Voxora AI",
  description: "Explore the core Voxora AI features for answering calls, booking appointments, syncing CRM data, and recovering missed leads.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="A premium receptionist layer built for conversion, not just coverage."
        description="Voxora combines natural AI voice, automation, integrations, and analytics into one system designed for revenue-focused teams."
      />

      <section className="page-shell py-8 sm:py-12">
        <div className="grid gap-5 lg:grid-cols-3">
          {featureSpotlights.map((item, index) => {
            const Icon = item.icon;

            return (
              <FadeIn key={item.title} delay={index * 0.08}>
                <div className="surface rounded-[1.9rem] border border-white/10 p-6">
                  <div className="flex size-14 items-center justify-center rounded-[1.3rem] bg-primary/12 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h2 className="mt-6 font-heading text-2xl font-semibold text-white">{item.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  <div className="mt-6 space-y-3">
                    {item.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-2xl border border-white/8 bg-slate-950/45 px-4 py-3 text-sm text-white/85"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      <FeaturesGrid showHeading={false} />
      <CtaBanner />
    </>
  );
}
