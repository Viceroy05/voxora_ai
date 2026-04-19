"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { SiteLogo } from "@/components/layout/site-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navigation } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/6 bg-slate-950/65 backdrop-blur-xl">
      <div className="page-shell flex h-20 items-center justify-between gap-4">
        <SiteLogo />

        <nav className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition hover:text-white",
                  active && "text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/contact">Book Demo</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/pricing">Start Free Trial</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon" aria-label="Open navigation">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                <SiteLogo textClassName="text-base" />
              </SheetTitle>
              <SheetDescription>
                AI voice receptionist for premium customer-facing businesses.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-10 flex flex-col gap-4">
              {navigation.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard" || pathname.startsWith("/dashboard/")
                    : pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl border border-white/8 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:text-white",
                      active && "border-primary/30 bg-primary/10 text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto grid gap-3 pt-8">
              <Button asChild variant="secondary">
                <Link href="/contact">Book Demo</Link>
              </Button>
              <Button asChild>
                <Link href="/pricing">Start Free Trial</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
