"use client";

import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { HeroSection } from "@/components/ui/landing/hero-section";
import { FeaturesSection } from "@/components/ui/landing/features-section";
import { IntegrationsSection } from "@/components/ui/landing/integrations-section";
import { CTASection } from "@/components/ui/landing/cta-section";

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <IntegrationsSection />
        <CTASection />
      </main>
      <LandingFooter />
    </>
  );
}
