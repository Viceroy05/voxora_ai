import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { industries } from "@/lib/site-data";

type IndustryGridProps = {
  showHeading?: boolean;
};

export function IndustryGrid({ showHeading = true }: IndustryGridProps) {
  return (
    <section className="page-shell py-20 sm:py-24">
      {showHeading ? (
        <FadeIn>
          <SectionHeading
            eyebrow="Industries"
            title="Purpose-built for high-intent phone-driven businesses."
            description="If the first call shapes trust, conversion, or scheduling, Voxora becomes an operating advantage."
          />
        </FadeIn>
      ) : null}

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {industries.map((industry, index) => {
          const Icon = industry.icon;

          return (
            <FadeIn key={industry.title} delay={index * 0.06}>
              <div className="surface rounded-[1.9rem] border border-white/10 p-6">
                <div className="flex size-14 items-center justify-center rounded-[1.3rem] bg-primary/12 text-primary">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 font-heading text-2xl font-semibold text-white">{industry.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{industry.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {industry.outcomes.map((outcome) => (
                    <span
                      key={outcome}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80"
                    >
                      {outcome}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
