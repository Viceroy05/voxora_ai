import { Users, Award, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";
import { trustedBrands } from "@/lib/site-data";

export function TrustedSection() {
  return (
    <section className="page-shell py-20 sm:py-28">
      <FadeIn>
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/3 px-6 py-12 sm:px-8 sm:py-16 backdrop-blur-sm">
          <div className="mb-12 grid gap-8 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Users className="size-6" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">2,800+</div>
                <div className="text-sm text-muted-foreground">Active Businesses</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">150k+</div>
                <div className="text-sm text-muted-foreground">Appointments Booked</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Award className="size-6" />
              </div>
              <div>
                <div className="text-lg font-semibold text-white">4.9/5</div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground mb-8">
            Trusted by India&apos;s best service businesses
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {trustedBrands.map((brand) => (
              <div
                key={brand}
                className="flex items-center justify-center rounded-[1.4rem] border border-white/8 bg-slate-950/60 hover:bg-slate-950/80 px-4 py-4 text-center text-sm font-medium text-white/85 hover:text-white transition-all duration-200 backdrop-blur-sm"
              >
                {brand}
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-white/8 pt-8 text-center text-xs text-muted-foreground">
            <p>Join growing teams saving 10+ hours per week with AI reception</p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
