"use client";

import Link from "next/link";
import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { GridPattern, DiagonalLines } from "@/components/ui/grid-pattern";
import { HeroIllustration } from "@/components/ui/hero-illustration";
import { useCursor } from "@/components/ui/cursor-context";

const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN;

export function HeroSection() {
  const { setCursorType } = useCursor();
  const [baseUrl, setBaseUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBaseUrl(`${window?.location?.protocol || 'https:'}//${ADMIN_DOMAIN}`);
  }, []);

  const handleMouseEnter = useCallback((type: "button" | "text") => {
    setCursorType(type);
  }, [setCursorType]);

  const handleMouseLeave = useCallback(() => {
    setCursorType("default");
  }, [setCursorType]);

  const getURL = (path: string) => {
    if (!ADMIN_DOMAIN) return "#";
    return baseUrl ? `${baseUrl}${path}` : "#";
  };

  // Avoid hydration mismatch
  if (!mounted) return null;

  return (
    <section className="relative overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-white pt-24 pb-12 md:pt-32 md:pb-24">
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-purple-100/30 to-blue-50/20 dark:from-primary/20 dark:via-purple-900/20 dark:to-slate-900/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/80 dark:from-black dark:via-transparent dark:to-black/80" />
          <div className="absolute inset-0 opacity-20">
            <GridPattern className="absolute inset-0 text-gray-900/20 dark:text-white" />
            <DiagonalLines className="absolute inset-0 text-gray-900/20 dark:text-white rotate-180" />
          </div>
        </motion.div>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                Transform Your Business with{" "}
                <span 
                  onMouseEnter={() => handleMouseEnter("text")}
                  onMouseLeave={handleMouseLeave}
                  className="bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400 bg-clip-text text-transparent block mt-2 hover:scale-105 transition-transform cursor-pointer"
                >
                  Next-Gen Store Management
                </span>
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-[600px]"
            >
              Empower your retail operations with AI-driven insights, seamless automation, 
              and enterprise-grade tools designed for modern commerce.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-4 max-w-md"
            >
              <Link href={getURL("/signup")} className="flex-1">
                <Button 
                  onMouseEnter={() => handleMouseEnter("button")}
                  onMouseLeave={handleMouseLeave}
                  size="lg" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all dark:shadow-primary/20 hover:scale-105"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={getURL("/demo")} className="flex-1">
                <Button 
                  onMouseEnter={() => handleMouseEnter("button")}
                  onMouseLeave={handleMouseLeave}
                  size="lg" 
                  variant="outline" 
                  className="w-full border-2 border-gray-200 dark:border-gray-800 hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-800 font-semibold shadow-md hover:shadow-lg transition-all dark:shadow-gray-950/50 hover:scale-105"
                >
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-8"
            >
              <div 
                onMouseEnter={() => handleMouseEnter("text")}
                onMouseLeave={handleMouseLeave}
                className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              >
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Enterprise Security</span>
              </div>
              <div 
                onMouseEnter={() => handleMouseEnter("text")}
                onMouseLeave={handleMouseLeave}
                className="flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
              >
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Real-time Analytics</span>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="relative hidden lg:block h-[600px]"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
