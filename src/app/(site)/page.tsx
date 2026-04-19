import { CtaBanner } from "@/components/marketing/cta-banner";
import { FAQSection } from "@/components/marketing/faq-section";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { TestimonialsGrid } from "@/components/marketing/testimonials-grid";
import { HeroSection } from "@/components/home/hero-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TrustedSection } from "@/components/home/trusted-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustedSection />
      <HowItWorksSection />
      <FeaturesGrid />
      <TestimonialsGrid />
      <PricingCards />
      <FAQSection />
      <CtaBanner />
    </>
  );
}
