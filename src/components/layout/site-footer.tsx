import Link from "next/link";

import { SiteLogo } from "@/components/layout/site-logo";
import { Button } from "@/components/ui/button";
import { navigation } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/6">
      <div className="page-shell py-16">
        <div className="surface-strong grid gap-10 rounded-[2rem] border border-white/10 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
          <div>
            <SiteLogo />
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Voxora AI helps salons, clinics, gyms, real estate teams, and service businesses answer every call like their best receptionist never clocks out.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/contact">Book Demo</Link>
              </Button>
              <Button asChild>
                <Link href="/pricing">Start Free Trial</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                Explore
              </h3>
              <div className="mt-4 grid gap-3">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-muted-foreground transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                Contact
              </h3>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>hello@voxora.ai</p>
                <p>+1 (415) 555-0148</p>
                <p>San Francisco, California</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/6 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 Voxora AI. All rights reserved.</p>
          <p>Built for premium customer-facing businesses.</p>
        </div>
      </div>
    </footer>
  );
}
