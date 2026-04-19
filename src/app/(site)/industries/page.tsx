import type { Metadata } from "next";

import { CtaBanner } from "@/components/marketing/cta-banner";
import { IndustryGrid } from "@/components/marketing/industry-grid";
import { PageHero } from "@/components/marketing/page-hero";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata: Metadata = {
  title: "Industries | Voxora AI",
  description: "See how Voxora AI serves salons, clinics, gyms, real estate, and service businesses.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Designed for businesses where the phone is still the conversion engine."
        description="From patient intake to service dispatch to listing inquiries, Voxora adapts its scripts and workflows around the way your business actually operates."
      />
      <IndustryGrid showHeading={false} />

      <section className="page-shell py-6 sm:py-10">
        <FadeIn>
          <div className="surface-strong rounded-[2rem] border border-white/10 p-6 sm:p-8">
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { label: "Lead response", value: "< 5 sec" },
                { label: "Booking lift", value: "+22%" },
                { label: "Missed call recovery", value: "3.1x" },
              ].map((metric) => (
                <div key={metric.label} className="rounded-[1.6rem] border border-white/8 bg-slate-950/45 p-5">
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="mt-3 font-heading text-4xl font-semibold text-white">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      <CtaBanner />
    </>
  );
}
