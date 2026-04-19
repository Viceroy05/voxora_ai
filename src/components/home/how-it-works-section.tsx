import { Phone, CheckSquare2, Send } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { workflowSteps } from "@/lib/site-data";

const stepIcons = [
  { icon: Phone, color: "from-blue-500/20 to-cyan-500/10" },
  { icon: CheckSquare2, color: "from-emerald-500/20 to-teal-500/10" },
  { icon: Send, color: "from-violet-500/20 to-purple-500/10" },
];

export function HowItWorksSection() {
  return (
    <section className="page-shell py-20 sm:py-28">
      <FadeIn>
        <SectionHeading
          eyebrow="How It Works"
          title="Three simple steps from first call to booked revenue"
          description="Go live in days, not weeks. Your AI receptionist learns your business and turns every inbound call into an opportunity."
        />
      </FadeIn>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {workflowSteps.map((item, index) => {
          const IconComponent = stepIcons[index].icon;
          return (
            <FadeIn key={item.step} delay={index * 0.1}>
              <div className="group relative h-full">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                
                <div className="surface relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-8 h-full flex flex-col backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`flex size-16 items-center justify-center rounded-[1.3rem] bg-gradient-to-br ${stepIcons[index].color} text-white`}>
                      <IconComponent className="size-7" />
                    </div>
                    <div className="text-4xl font-bold text-white/20 tabular-nums">{item.step}</div>
                  </div>

                  <h3 className="font-heading text-2xl font-semibold text-white leading-tight mb-4">{item.title}</h3>
                  <p className="text-base leading-7 text-muted-foreground flex-grow">{item.description}</p>

                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 text-white/20">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn delay={0.3}>
        <div className="mt-14 rounded-[2rem] border border-white/10 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 p-6 sm:p-8">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">Deployment</div>
              <div className="mt-2 text-2xl font-bold text-white">3-5 days</div>
              <div className="mt-1 text-sm text-muted-foreground">From signup to live</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Setup</div>
              <div className="mt-2 text-2xl font-bold text-white">Zero code</div>
              <div className="mt-1 text-sm text-muted-foreground">We handle configuration</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-violet-400 uppercase tracking-wide">Training</div>
              <div className="mt-2 text-2xl font-bold text-white">1 hour</div>
              <div className="mt-1 text-sm text-muted-foreground">Your team learns the dashboard</div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
