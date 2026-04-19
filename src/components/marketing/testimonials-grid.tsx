import { Quote, Star } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { testimonials } from "@/lib/site-data";

type TestimonialsGridProps = {
  showHeading?: boolean;
};

export function TestimonialsGrid({ showHeading = true }: TestimonialsGridProps) {
  return (
    <section className="page-shell py-20 sm:py-28">
      {showHeading ? (
        <FadeIn>
          <SectionHeading
            eyebrow="Loved by teams"
            title="Real results from real businesses across India"
            description="From salons to clinics to real estate teams—see how they're handling calls, booking revenue, and keeping customers happy."
          />
        </FadeIn>
      ) : null}

      <div className="mt-14 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <FadeIn key={testimonial.name} delay={index * 0.08}>
            <div className="group relative h-full">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-blue-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
              
              <div className="surface relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-8 h-full flex flex-col hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Quote className="size-5" />
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-base leading-8 text-white/92 flex-grow italic">{testimonial.quote}</p>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {testimonial.role} <span className="text-primary">•</span> {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
