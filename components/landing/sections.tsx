'use client';

import { motion } from "framer-motion";

export function SolutionsSection() {
  return (
    <section id="solutions" className="min-h-screen w-full bg-background dark:bg-background relative overflow-visible pt-24 transition-colors duration-300">
      <div className="container mx-auto px-4 py-20 relative">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-medium text-foreground dark:text-slate-50 mb-6 transition-colors duration-300">
            Solutions for Every Business
          </h2>
          <p className="text-xl text-muted-foreground dark:text-slate-400 transition-colors duration-300">
            Discover how our platform can be tailored to your specific industry needs.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="min-h-screen w-full bg-gradient-to-b from-slate-50/50 to-background dark:from-slate-950/50 dark:to-background relative overflow-visible pt-24 transition-colors duration-300">
      <div className="container mx-auto px-4 py-20 relative">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-medium text-foreground dark:text-slate-50 mb-6 transition-colors duration-300">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground dark:text-slate-400 transition-colors duration-300">
            Choose the perfect plan for your business needs.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function CustomersSection() {
  return (
    <section id="customers" className="min-h-screen w-full bg-background dark:bg-background relative overflow-visible pt-24 transition-colors duration-300">
      <div className="container mx-auto px-4 py-20 relative">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-medium text-foreground dark:text-slate-50 mb-6 transition-colors duration-300">
            Trusted by Leading Brands
          </h2>
          <p className="text-xl text-muted-foreground dark:text-slate-400 transition-colors duration-300">
            Join thousands of successful businesses already using our platform.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function ResourcesSection() {
  return (
    <section id="resources" className="min-h-screen w-full bg-gradient-to-b from-slate-50/50 to-background dark:from-slate-950/50 dark:to-background relative overflow-visible pt-24 transition-colors duration-300">
      <div className="container mx-auto px-4 py-20 relative">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-medium text-foreground dark:text-slate-50 mb-6 transition-colors duration-300">
            Resources & Support
          </h2>
          <p className="text-xl text-muted-foreground dark:text-slate-400 transition-colors duration-300">
            Everything you need to succeed with our platform.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
