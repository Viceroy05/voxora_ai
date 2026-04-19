import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { features } from "@/lib/site-data";

type FeaturesGridProps = {
  showHeading?: boolean;
};

export function FeaturesGrid({ showHeading = true }: FeaturesGridProps) {
  return (
    <section className="page-shell py-20 sm:py-28">
      {showHeading ? (
        <FadeIn>
          <SectionHeading
            eyebrow="Packed with power"
            title="Everything you need to own your inbound calls and revenue."
            description="Purpose-built for Indian service businesses. Call answering, booking, CRM sync, analytics—all in one AI receptionist platform."
          />
        </FadeIn>
      ) : null}

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <FadeIn key={feature.title} delay={index * 0.06}>
              <div className="group relative h-full">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
                
                <div className="surface relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-8 h-full flex flex-col hover:border-white/20 transition-all duration-300 backdrop-blur-sm group-hover:shadow-xl">
                  <div className={`flex size-16 items-center justify-center rounded-[1.3rem] bg-gradient-to-br ${feature.accent} text-white transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="size-8" />
                  </div>
                  
                  <h3 className="mt-6 font-heading text-2xl font-semibold text-white leading-tight">{feature.title}</h3>
                  <p className="mt-4 text-base leading-7 text-muted-foreground flex-grow">{feature.description}</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Learn more</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
