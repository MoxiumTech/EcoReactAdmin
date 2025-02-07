'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MousePosition {
  x: number;
  y: number;
}

export function MouseParallaxContainer({ children }: { children: React.ReactNode }) {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    setMousePosition({
      x: (clientX - innerWidth / 2) / innerWidth,
      y: (clientY - innerHeight / 2) / innerHeight,
    });
  }, []);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);
  
  return (
    <div className="relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-3xl"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
        }}
      />
      {children}
    </div>
  );
}

export function GlassCard({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    x.set(clientX - left);
    y.set(clientY - top);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl backdrop-blur-lg bg-white/10 border border-white/20 ${className}`}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        background: "linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
      }}
    >
      <motion.div
        className="absolute -inset-px bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          x: mouseX,
          y: mouseY,
          background: "radial-gradient(circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(255,255,255,0.1) 0%, transparent 50%)",
        }}
      />
      {children}
    </motion.div>
  );
}
