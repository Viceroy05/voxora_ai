import Link from "next/link";
import { Check, ArrowRight, Zap } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/site-data";
import { cn } from "@/lib/utils";

type PricingCardsProps = {
  showHeading?: boolean;
};

export function PricingCards({ showHeading = true }: PricingCardsProps) {
  return (
    <section className="page-shell py-20 sm:py-28">
      {showHeading ? (
        <FadeIn>
          <SectionHeading
            eyebrow="Simple, transparent pricing"
            title="No surprises. No long contracts. Cancel anytime."
            description="Choose the plan that fits your business size. All plans include 24/7 call answering, CRM sync, and instant booking—plus 14-day free trial."
          />
        </FadeIn>
      ) : null}

      <div className="mt-14 grid gap-6 xl:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <FadeIn key={plan.name} delay={index * 0.08}>
            <div className="group relative h-full">
              {plan.featured && (
                <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-75 group-hover:opacity-100 transition-opacity duration-300 blur-lg -z-10" />
              )}

              <div
                className={cn(
                  "surface relative flex h-full flex-col rounded-[2rem] border p-8 transition-all duration-300 backdrop-blur-sm",
                  plan.featured 
                    ? "surface-strong border-primary/50 bg-gradient-to-br from-white/10 to-white/5 shadow-2xl scale-100 md:scale-105" 
                    : "border-white/10 bg-gradient-to-br from-white/8 to-white/3 hover:border-white/20 hover:bg-gradient-to-br hover:from-white/12 hover:to-white/6"
                )}
              >
                {plan.badge ? (
                  <div className="flex items-center gap-2 mb-6">
                    <Badge className="bg-primary/20 text-primary hover:bg-primary/30">
                      <Zap className="size-3 mr-1" />
                      {plan.badge}
                    </Badge>
                  </div>
                ) : (
                  <div className="mb-6 h-8" />
                )}

                <div className="text-sm font-medium uppercase tracking-[0.16em] text-white/70">{plan.name}</div>

                <div className="mt-4 flex items-end gap-1">
                  <span className="font-heading text-5xl font-bold text-white tabular-nums">
                    {plan.price}
                  </span>
                  {plan.cadence && <span className="pb-2 text-base text-muted-foreground">{plan.cadence}</span>}
                </div>

                <p className="mt-4 text-base leading-7 text-muted-foreground min-h-14">{plan.description}</p>

                <div className="mt-8 space-y-4 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <Check className="size-3.5" />
                      </span>
                      <span className="text-sm text-white/85 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  asChild 
                  className="mt-10 w-full text-base font-semibold" 
                  variant={plan.featured ? "default" : "outline"}
                  size="lg"
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {plan.name === "Starter" ? "No credit card required" : "Setup in 3-5 days"}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <div className="mt-14 rounded-[2rem] border border-white/10 bg-gradient-to-r from-emerald-500/5 via-white/5 to-blue-500/5 p-8">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Money-back</div>
              <div className="mt-2 text-base text-white">30-day guarantee</div>
              <div className="mt-1 text-sm text-muted-foreground">Not satisfied? Full refund.</div>
            </div>
            <div className="border-l border-r border-white/10">
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Always included</div>
              <div className="mt-2 text-base text-white">24/7 support</div>
              <div className="mt-1 text-sm text-muted-foreground">Email, phone, and in-app chat.</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-violet-400 uppercase tracking-wide">Free migration</div>
              <div className="mt-2 text-base text-white">From any provider</div>
              <div className="mt-1 text-sm text-muted-foreground">We'll handle the transition.</div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
