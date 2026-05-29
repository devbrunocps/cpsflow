import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { Logos } from "@/components/landing/logos";
import { Features } from "@/components/landing/features";
import { AutomationShowcase } from "@/components/landing/automation-showcase";
import { Steps } from "@/components/landing/steps";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth bg-slate-950 text-slate-100 antialiased">
      <LandingNav />
      <main>
        <Hero />
        <Logos />
        <Features />
        <AutomationShowcase />
        <Steps />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
