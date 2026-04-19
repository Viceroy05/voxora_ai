import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/lib/site-data";

export function FAQSection() {
  return (
    <section className="page-shell py-20 sm:py-24">
      <FadeIn>
        <SectionHeading
          eyebrow="FAQ"
          title="Questions teams ask before they hand the front desk to AI."
          description="The product is designed to feel premium, safe, and operationally useful from day one."
        />
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="surface mt-10 rounded-[2rem] border border-white/10 px-6 py-2 sm:px-8">
          <Accordion type="single" collapsible>
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </FadeIn>
    </section>
  );
}
