import type { Metadata } from "next";
import { CalendarDays, Mail, Phone } from "lucide-react";

import { ContactForm } from "@/components/marketing/contact-form";
import { PageHero } from "@/components/marketing/page-hero";
import { FadeIn } from "@/components/shared/fade-in";
import { contactHighlights } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Contact | Voxora AI",
  description: "Book a Voxora AI demo or reach out to discuss call automation for your business.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Book a tailored demo for your business."
        description="Tell us about your call flow, locations, booking process, and CRM stack. We will map the fastest path to launch."
      />

      <section className="page-shell py-8 sm:py-12">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <FadeIn>
            <div className="surface rounded-[2rem] border border-white/10 p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-semibold text-white">Tell us about your team</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                We respond to demo requests within one business day.
              </p>

              <ContactForm />
            </div>
          </FadeIn>

          <div className="grid gap-6">
            <FadeIn delay={0.06}>
              <div className="surface-strong rounded-[2rem] border border-white/10 p-6 sm:p-8">
                <p className="text-sm uppercase tracking-[0.18em] text-primary">What to expect</p>
                <div className="mt-6 grid gap-4">
                  {contactHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.4rem] border border-white/8 bg-slate-950/45 px-4 py-4 text-sm text-white/90"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="surface rounded-[2rem] border border-white/10 p-6 sm:p-8">
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: "Email", value: "hello@voxora.ai" },
                    { icon: Phone, label: "Phone", value: "+1 (415) 555-0148" },
                    { icon: CalendarDays, label: "Demo window", value: "Mon-Fri - 9 AM to 6 PM PST" },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="flex items-start gap-4 rounded-[1.4rem] border border-white/8 bg-slate-950/45 p-4">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">{item.label}</div>
                          <div className="mt-1 text-base font-medium text-white">{item.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
