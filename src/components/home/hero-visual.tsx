"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarClock, MessageSquareMore, PhoneCall, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function HeroVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(71,135,255,0.32),transparent_52%)] blur-3xl" />

      <motion.div
        className="surface-strong relative overflow-hidden rounded-[2.25rem] border border-white/12 p-5 sm:p-6"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />

        <div className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/55 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live call</p>
            <p className="mt-1 font-heading text-lg font-semibold text-white">Luxury color consultation</p>
          </div>
          <Badge>AI handling</Badge>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            className="rounded-[1.75rem] border border-white/10 bg-white/4 p-5"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -8, 0],
                  }
            }
            transition={{ duration: 5.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/15 text-primary">
                <PhoneCall className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Conversation quality</p>
                <p className="mt-1 text-2xl font-semibold text-white">96.4%</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                "Caller wants balayage pricing",
                "Preferred stylist: senior colorist",
                "Available Thursday after 3 PM",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/8 bg-slate-950/55 px-4 py-3 text-sm text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid gap-4">
            <motion.div
              className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-blue-500/16 to-cyan-400/8 p-5"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, 10, 0],
                    }
              }
              transition={{ duration: 6.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <CalendarClock className="size-5 text-cyan-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/60">Booked automatically</p>
                  <p className="mt-1 text-lg font-semibold text-white">Thu - 3:30 PM</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      scale: [1, 1.02, 1],
                    }
              }
              transition={{ duration: 5.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-3">
                <MessageSquareMore className="size-5 text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">CRM synced</p>
                  <p className="mt-1 text-base font-semibold text-white">Lead tagged as premium color</p>
                </div>
              </div>
            </motion.div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-cyan-300" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Impact</p>
                  <p className="mt-1 text-base font-semibold text-white">$4,800 recovered this week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
