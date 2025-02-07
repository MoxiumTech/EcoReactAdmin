'use client';

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function FloatingObject({ delay = 0, size = 20, color = "primary" }: { delay?: number; size?: number; color?: string }) {
  const randomX = Math.random() * 100;
  const randomDuration = 15 + Math.random() * 15;

  return (
    <motion.div
      className={`absolute bg-${color}/10 rounded-full backdrop-blur-md`}
      style={{
        width: size,
        height: size,
        left: `${randomX}%`,
      }}
      animate={{
        y: [0, -1000],
        rotate: [0, 360],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
    />
  );
}

function GameGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.15]">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />
    </div>
  );
}

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 300]);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10">
      {/* Game-like grid background */}
      <GameGrid />

      {/* Animated elements */}
      <motion.div style={{ y: backgroundY }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingObject 
            key={i} 
            delay={i * 2} 
            size={10 + Math.random() * 30}
            color={i % 2 === 0 ? "primary" : "secondary"}
          />
        ))}
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white/40" />
    </div>
  );
}
