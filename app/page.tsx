"use client";

import { LandingNav } from "@/components/landing-nav";
import { LandingFooter } from "@/components/landing-footer";
import { HeroSection } from "@/components/ui/landing/hero-section";
import { FeaturesSection } from "@/components/ui/landing/features-section";
import { IntegrationsSection } from "@/components/ui/landing/integrations-section";
import { CTASection } from "@/components/ui/landing/cta-section";
import { CursorProvider } from "@/components/ui/cursor-context";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <CursorProvider>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative cursor-none"
        >
          <CustomCursor />
          <LandingNav />
          <main className="flex min-h-screen flex-col">
            <HeroSection />
            <FeaturesSection />
            <IntegrationsSection />
            <CTASection />
          </main>
          <LandingFooter />
        </motion.div>
      </CursorProvider>
    </SmoothScrollProvider>
  );
}
