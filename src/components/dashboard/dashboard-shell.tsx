"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Menu, Search, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { SiteLogo } from "@/components/layout/site-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { dashboardNavigation, sidebarStatusCards } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: ReactNode;
};

function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-2">
      {dashboardNavigation.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const content = (
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
              active
                ? "bg-primary/12 text-white"
                : "text-muted-foreground hover:bg-white/5 hover:text-white",
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="size-4" />
              <span>{item.label}</span>
            </div>
            {item.badge ? (
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-white/70">
                {item.badge}
              </span>
            ) : null}
          </div>
        );

        if (mobile) {
          return (
            <SheetClose asChild key={item.href}>
              <Link href={item.href}>{content}</Link>
            </SheetClose>
          );
        }

        return (
          <Link href={item.href} key={item.href}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#030711_0%,#081122_38%,#050815_100%)]">
      <div className="grid min-h-screen xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/6 px-5 py-6 xl:block">
          <div className="sticky top-6 space-y-6">
            <div className="surface rounded-[2rem] border border-white/10 p-5">
              <SiteLogo />
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Premium voice operations for customer-facing businesses.
              </p>
            </div>

            <div className="surface rounded-[2rem] border border-white/10 p-4">
              <DashboardNav />
            </div>

            <div className="space-y-3">
              {sidebarStatusCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="surface rounded-[1.6rem] border border-white/10 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {item.label}
                        </div>
                        <div className="mt-2 text-base font-semibold text-white">{item.value}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{item.helper}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/6 bg-slate-950/70 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 xl:px-8">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      className="xl:hidden"
                      variant="outline"
                      size="icon"
                      aria-label="Open dashboard navigation"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[min(92vw,22rem)]">
                    <SheetHeader>
                      <SheetTitle>
                        <SiteLogo textClassName="text-base" />
                      </SheetTitle>
                      <SheetDescription>Navigate the Voxora AI workspace.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-8">
                      <DashboardNav mobile />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="hidden min-w-72 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-muted-foreground lg:flex">
                  <Search className="size-4" />
                  Search calls, bookings, team, or integrations
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="success" className="hidden sm:inline-flex">
                  Live sync
                </Badge>
                <Button variant="secondary" size="icon" aria-label="Notifications">
                  <Bell className="size-4" />
                </Button>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/">Back to site</Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/contact">
                    <Sparkles className="size-4" />
                    Book Demo
                  </Link>
                </Button>
                <div className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">
                  VA
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 xl:px-8 xl:py-8">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
