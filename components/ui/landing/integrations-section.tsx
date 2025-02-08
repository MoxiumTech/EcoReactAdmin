"use client";

import { motion } from "framer-motion";
import { BarChart3, ShoppingBag, Users } from "lucide-react";
import { GridPattern, DiagonalLines, DottedPattern } from "@/components/ui/grid-pattern";

const integrations = [
  {
    title: "Payment Processing",
    description: "Integrate with leading payment gateways for secure transactions.",
    icon: ShoppingBag
  },
  {
    title: "Analytics & BI",
    description: "Connect with your favorite analytics and business intelligence tools.",
    icon: BarChart3
  },
  {
    title: "CRM Systems",
    description: "Sync customer data with popular CRM platforms for unified management.",
    icon: Users
  }
];

export function IntegrationsSection() {
  return (
    <section className="relative w-full py-12 md:py-24 overflow-hidden bg-white dark:bg-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-purple-100/30 to-blue-50/20 dark:from-primary/20 dark:via-purple-900/20 dark:to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent dark:via-black/50" />
      </div>
      <div className="absolute inset-0 opacity-10">
        <GridPattern className="absolute inset-0 text-gray-900/20 dark:text-white" />
        <DottedPattern className="absolute inset-0 text-gray-900/20 dark:text-white" />
      </div>
      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
              Seamless Integration with Your Tech Stack
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
              Connect with your favorite tools and services. Our platform integrates with 
              leading e-commerce, payment, and analytics solutions.
            </p>
            <div className="mt-12 space-y-3">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
                >
                  <div className="rounded-xl p-3 bg-primary/10">
                    <integration.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{integration.title}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{integration.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/80 to-purple-600/80">
              <div className="absolute inset-0 bg-grid-small-white/[0.2]" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 p-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-video rounded-lg bg-white/20 backdrop-blur-sm animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
