import Link from "next/link";
import { ArrowRight, Clock, Users, TrendingUp } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="page-shell py-20 sm:py-28">
      <FadeIn>
        <div className="surface-strong relative overflow-hidden rounded-[2.5rem] border border-white/10 px-6 py-16 sm:px-10 lg:px-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-50" />
          
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-primary font-semibold">Ready to launch?</p>
              <h2 className="balanced mt-4 font-heading text-4xl font-bold text-white sm:text-5xl lg:text-6xl leading-tight">
                Turn your missed calls into booked revenue—today.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Join 2,800+ Indian businesses already answering calls 24/7. Get live with your AI receptionist in just 3-5 days. No setup required.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3 text-sm">
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="size-5 text-emerald-400 flex-shrink-0" />
                  <span>3-5 day setup</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <Users className="size-5 text-blue-400 flex-shrink-0" />
                  <span>Dedicated onboarding</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <TrendingUp className="size-5 text-violet-400 flex-shrink-0" />
                  <span>ROI in 60 days</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:justify-start">
              <Button asChild size="xl" className="text-base font-semibold">
                <Link href="/contact">
                  Start Free Trial
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="text-base font-semibold border-white/20 hover:bg-white/5">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mt-12 border-t border-white/10 pt-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-center text-sm">
              <div>
                <div className="font-bold text-white text-lg">14 days</div>
                <div className="mt-1 text-muted-foreground">Free trial</div>
              </div>
              <div>
                <div className="font-bold text-white text-lg">₹0</div>
                <div className="mt-1 text-muted-foreground">Setup cost</div>
              </div>
              <div>
                <div className="font-bold text-white text-lg">24/7</div>
                <div className="mt-1 text-muted-foreground">Support</div>
              </div>
              <div>
                <div className="font-bold text-white text-lg">Any time</div>
                <div className="mt-1 text-muted-foreground">Cancel anytime</div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
