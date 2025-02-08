"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { GridPattern, DiagonalLines, DottedPattern } from "@/components/ui/grid-pattern";
import { HeroIllustration } from "@/components/ui/hero-illustration";

const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN;

const stats = [
  // { label: "Active Stores", value: "2500+" },
  // { label: "Uptime", value: "99.9%" },
  // { label: "Transactions", value: "150M+" },
  // { label: "Countries", value: "50+" }
];

export function HeroSection() {
  if (!ADMIN_DOMAIN) {
    console.error("NEXT_PUBLIC_ADMIN_DOMAIN is not defined");
  }

  return (
    <section className="relative overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-white pt-24 pb-12 md:pt-32 md:pb-24">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-purple-100/30 to-blue-50/20 dark:from-primary/20 dark:via-purple-900/20 dark:to-slate-900/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/80 dark:from-black dark:via-transparent dark:to-black/80" />
        </div>
        <div className="absolute inset-0 opacity-20">
          <GridPattern className="absolute inset-0 text-gray-900/20 dark:text-white" />
          <DiagonalLines className="absolute inset-0 text-gray-900/20 dark:text-white rotate-180" />
        </div>
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50" />
      </div>
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-left space-y-8"
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
              Transform Your Business with 
              <span className="bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400 bg-clip-text text-transparent block mt-2">
                Next-Gen Store Management
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-[600px]">
              Empower your retail operations with AI-driven insights, seamless automation, 
              and enterprise-grade tools designed for modern commerce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              <Link href={ADMIN_DOMAIN ? `http://${ADMIN_DOMAIN}/signup` : "#"} className="flex-1">
                <Button 
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all dark:shadow-primary/20"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={ADMIN_DOMAIN ? `http://${ADMIN_DOMAIN}/demo` : "#"} className="flex-1">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full border-2 border-gray-200 dark:border-gray-800 hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-800 font-semibold shadow-md hover:shadow-lg transition-all dark:shadow-gray-950/50"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Real-time Analytics</span>
              </div>
            </div>
          </motion.div>
          <div className="relative hidden lg:block h-[600px]">
            <HeroIllustration />
          </div>
        </div>
      </div>
      {/* Stats Section */}
      <div className="container relative z-10 px-4 md:px-6 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
        </motion.div>
      </div>
    </section>
  );
}
