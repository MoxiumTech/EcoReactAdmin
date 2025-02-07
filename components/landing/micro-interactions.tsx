'use client';

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedFeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  delay?: number;
}

export function AnimatedFeatureCard({ title, description, icon, delay = 0 }: AnimatedFeatureCardProps) {
  return (
    <motion.div 
      className="p-6 bg-background border-2 border-foreground rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <div className="mb-4 text-2xl">{icon}</div>
      <h3 className="text-xl font-semibold mb-4 font-handwriting">{title}</h3>
      <p className="text-muted-foreground font-mono text-sm">
        {description}
      </p>
    </motion.div>
  );
}

interface AnimatedTitleProps {
  children: ReactNode;
}

export function AnimatedTitle({ children }: AnimatedTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 opacity-75 blur"></div>
      <h1 className="relative text-6xl font-bold tracking-tight font-handwriting text-background">
        {children}
      </h1>
    </motion.div>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
}

export function FloatingElement({ children, delay = 0 }: FloatingElementProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
