"use client";

import { motion } from "framer-motion";
import { BarChart3, ShoppingBag, Users, Globe, Shield, Zap } from "lucide-react";
import { GridPattern, DiagonalLines, DottedPattern } from "@/components/ui/grid-pattern";

const features = [
  {
    title: "Smart Inventory",
    description: "AI-powered inventory management with predictive analytics and automated reordering.",
    icon: ShoppingBag
  },
  {
    title: "Advanced Analytics",
    description: "Real-time insights and forecasting with customizable dashboards and reports.",
    icon: BarChart3
  },
  {
    title: "Customer Relations",
    description: "Comprehensive CRM with segmentation, loyalty programs, and engagement tools.",
    icon: Users
  },
  {
    title: "Global Commerce",
    description: "Multi-currency support, localization, and international shipping management.",
    icon: Globe
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade security with role-based access control and data encryption.",
    icon: Shield
  },
  {
    title: "Automation Suite",
    description: "Streamline operations with intelligent workflows and business process automation.",
    icon: Zap
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative w-full py-12 md:py-24 overflow-hidden bg-gray-50 dark:bg-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-purple-100/30 to-blue-50/20 dark:from-primary/20 dark:via-purple-900/20 dark:to-slate-900/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent dark:via-black/50" />
      </div>
      <div className="absolute inset-0 opacity-10">
        <GridPattern className="absolute inset-0 text-gray-900/20 dark:text-white" />
        <DiagonalLines className="absolute inset-0 text-gray-900/20 dark:text-white rotate-180" />
      </div>
      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white">
            Enterprise Features for Modern Commerce
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg">
            Built for scale, designed for success. Our platform brings enterprise-grade 
            capabilities to businesses of all sizes.
          </p>
        </motion.div>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-white/[0.05] backdrop-blur-sm p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5 dark:from-primary/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5">
                <DottedPattern className="absolute inset-0" />
              </div>
              <div className="relative z-10">
                <div className="rounded-xl bg-primary/10 w-14 h-14 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
