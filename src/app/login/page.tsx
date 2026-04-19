import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { SiteLogo } from "@/components/layout/site-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Login | Voxora AI",
  description: "Sign in to the Voxora AI dashboard.",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="page-shell flex min-h-screen items-center py-10">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="surface-strong hidden rounded-[2.4rem] border border-white/10 p-10 lg:flex lg:flex-col">
            <SiteLogo />
            <Badge className="mt-10 w-fit">Operator Console</Badge>
            <h1 className="balanced mt-6 font-heading text-5xl font-semibold text-white">
              Run your entire voice reception layer from one clean workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
              Monitor active calls, recovered leads, booking conversions, and location performance without losing the premium feel your brand depends on.
            </p>

            <div className="mt-auto grid gap-4 pt-10">
              {[
                "Conversation summaries in real time",
                "Secure role-based access for staff",
                "CRM, calendar, and analytics in one view",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-white/8 bg-slate-950/45 px-5 py-4 text-sm text-white/85"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="surface mx-auto w-full max-w-xl rounded-[2.4rem] border border-white/10 p-6 sm:p-8 lg:p-10">
            <div className="flex items-center justify-between gap-4">
              <SiteLogo />
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Back to site</Link>
              </Button>
            </div>

            <div className="mt-12">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <LockKeyhole className="size-5" />
              </div>
              <h2 className="mt-6 font-heading text-3xl font-semibold text-white">Welcome back</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Sign in to manage calls, bookings, analytics, and integrations.
              </p>
            </div>

            <div className="mt-8">
              <Suspense fallback={<div className="text-sm text-muted-foreground">Loading sign-in...</div>}>
                <LoginForm />
              </Suspense>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-slate-950/45 px-4 py-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 text-white">
                <ShieldCheck className="size-4 text-cyan-300" />
                Enterprise-grade access controls
              </div>
              <p className="mt-2 leading-7">
                SSO, audit logging, and permission-based dashboards are available on Scale plans.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
