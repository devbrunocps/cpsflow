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
import { Reveal } from "@/components/landing/reveal";

export default function Home() {
  return (
    <div className="landing-page min-h-screen scroll-smooth bg-slate-950 text-slate-100 antialiased">
      <LandingNav />
      <main>
        <Hero />
        <Reveal>
          <Logos />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <AutomationShowcase />
        </Reveal>
        <Reveal>
          <Steps />
        </Reveal>
        <Reveal>
          <Testimonials />
        </Reveal>
        <Reveal>
          <Pricing />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <FinalCta />
        </Reveal>
      </main>
      <LandingFooter />
    </div>
  );
}
