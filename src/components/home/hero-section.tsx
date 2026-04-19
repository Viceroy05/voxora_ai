import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Shield } from "lucide-react";

import { HeroVisual } from "@/components/home/hero-visual";
import { FadeIn } from "@/components/shared/fade-in";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { heroStats } from "@/lib/site-data";

export function HeroSection() {
  return (
    <section className="page-shell pt-12 pb-16 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32">
      <div className="grid items-center gap-12 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr]">
        <FadeIn>
          <div className="max-w-2xl">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Badge variant="secondary" className="w-fit">
                🚀 Trusted by 2,800+ Indian businesses
              </Badge>
              <Badge variant="secondary" className="w-fit text-xs">
                <Zap className="size-3 mr-1" /> 14-day free trial
              </Badge>
            </div>

            <h1 className="balanced mt-8 font-heading text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
              Stop losing calls.<br />
              Start booking revenue.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">
              Your AI receptionist answers every inbound call in Hindi or English, books appointments instantly, syncs your CRM automatically—and turns missed calls into revenue 24/7.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button asChild size="xl" className="text-base font-semibold">
                <Link href="/contact">
                  Start Free Trial
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="text-base font-semibold border-white/20 hover:bg-white/5">
                <Link href="/pricing">
                  See Pricing
                </Link>
              </Button>
            </div>

            <div className="mt-10 space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0" />
                <span>Zero setup needed—goes live in 3 days</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0" />
                <span>Works in Hindi, English, and 26+ languages</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0" />
                <span>Google Calendar, WhatsApp, and CRM sync built-in</span>
              </div>
            </div>

            <div className="mt-12 grid gap-4 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/6 to-white/3 p-6 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-[1.5rem] border border-white/8 bg-slate-950/50 p-4 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</div>
                  <div className="mt-2 text-xs text-muted-foreground uppercase tracking-wide font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3 text-xs text-muted-foreground border-t border-white/10 pt-8">
              <Shield className="size-4" />
              <span>ISO 27001 & GDPR Compliant • Data hosted in India • No long-term contracts</span>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="relative">
            <HeroVisual />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
