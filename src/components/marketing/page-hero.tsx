import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-shell pt-24 pb-14 sm:pt-28 sm:pb-20">
      <FadeIn>
        <div className="surface-strong rounded-[2rem] border border-white/10 px-6 py-12 sm:px-10 lg:px-12">
          <SectionHeading
            align="center"
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </div>
      </FadeIn>
    </section>
  );
}
