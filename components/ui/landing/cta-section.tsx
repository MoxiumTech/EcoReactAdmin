"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GridPattern, DiagonalLines } from "@/components/ui/grid-pattern";

const ADMIN_DOMAIN = process.env.ADMIN_DOMAIN;

export function CTASection() {
  if (!ADMIN_DOMAIN) {
    console.error("ADMIN_DOMAIN is not defined");
  }

  return (
    <section className="relative w-full py-12 md:py-24 overflow-hidden bg-white dark:bg-black/95">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-purple-100/20 to-blue-50/10 dark:from-primary/10 dark:via-purple-900/10 dark:to-slate-900/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent dark:via-black/30" />
      </div>
      <div className="absolute inset-0 opacity-[0.15] dark:opacity-10">
        <GridPattern className="absolute inset-0 text-gray-900 dark:text-white [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <DiagonalLines className="absolute inset-0 text-gray-900 dark:text-white [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>
      <div className="container relative px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-purple-600 dark:from-primary dark:via-primary/80 dark:to-purple-700 shadow-2xl shadow-primary/10 dark:shadow-primary/20 p-8 md:p-12"
        >
          <div className="absolute inset-0">
            <GridPattern className="absolute inset-0 text-white/[0.15] dark:text-white/[0.1] rotate-180 [mask-image:radial-gradient(circle_at_center,white,transparent)]" />
            <DiagonalLines className="absolute inset-0 text-white/[0.15] dark:text-white/[0.1] [mask-image:radial-gradient(circle_at_center,white,transparent)]" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center text-white">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Transform Your Business?
            </h2>
            <p className="mx-auto max-w-[600px] text-white/80 text-lg mt-4">
              Join thousands of successful businesses already using our platform. 
              Start your journey today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href={ADMIN_DOMAIN ? `http://${ADMIN_DOMAIN}/signup` : "#"}>
                <Button 
                  size="lg" 
                  className="bg-background hover:bg-background/90 text-primary hover:text-primary/90 dark:bg-gray-950 dark:hover:bg-gray-900 dark:text-white dark:hover:text-white/90 font-semibold shadow-lg hover:shadow-xl transition-all px-8 group"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href={ADMIN_DOMAIN ? `http://${ADMIN_DOMAIN}/contact` : "#"}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white/80 hover:border-white bg-white/5 hover:bg-white/20 text-white font-semibold shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all px-8 group dark:bg-white/10 dark:hover:bg-white/20"
                >
                  Talk to Sales <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
