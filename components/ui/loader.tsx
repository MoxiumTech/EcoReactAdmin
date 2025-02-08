"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoaderProps {
  className?: string;
  progress?: number;
  status?: string;
  simulateProgress?: boolean;
  onComplete?: () => void;
}

export const Loader = ({ 
  className,
  progress: externalProgress,
  status,
  simulateProgress = true,
  onComplete
}: LoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (simulateProgress && typeof externalProgress === 'undefined') {
      const startTime = Date.now();
      const duration = 2000; // 2 seconds total
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const nextProgress = Math.min(elapsed / duration * 100, 100);
        
        setProgress(nextProgress);
        
        if (nextProgress < 100) {
          requestAnimationFrame(updateProgress);
        } else if (onComplete) {
          onComplete();
        }
      };
      
      requestAnimationFrame(updateProgress);
    }
  }, [simulateProgress, externalProgress, onComplete]);

  useEffect(() => {
    if (typeof externalProgress !== 'undefined') {
      setProgress(externalProgress);
    }
  }, [externalProgress]);

  if (!mounted) return null;

  const progressValue = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn("w-full max-w-md mx-auto py-12", className)}>
      <div className="relative">
        {/* Clean, professional container */}
        <div className="bg-background rounded-xl p-8 shadow-lg">
          {/* Progress circle */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Track */}
              <circle
                className="text-muted/20"
                strokeWidth="8"
                stroke="currentColor"
                fill="none"
                r="42"
                cx="50"
                cy="50"
              />
              {/* Progress */}
              <motion.circle
                className="text-primary"
                strokeWidth="8"
                stroke="currentColor"
                fill="none"
                r="42"
                cx="50"
                cy="50"
                strokeLinecap="round"
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ 
                  strokeDashoffset: 264 - (progressValue / 100) * 264 
                }}
                transition={{ 
                  duration: 0.5, 
                  ease: "easeOut"
                }}
              />
            </svg>

            {/* Percentage display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span 
                className="text-2xl font-medium"
                key={Math.round(progressValue)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {Math.round(progressValue)}%
              </motion.span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-1 w-full bg-muted/20 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ width: `${progressValue}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Status */}
          <AnimatePresence mode="wait">
            {status && (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-4 text-center"
              >
                <span className="text-sm text-muted-foreground">
                  {status}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress steps */}
          <div className="mt-6 grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((step) => (
              <motion.div
                key={step}
                className={cn(
                  "h-1 rounded-full",
                  step <= progressValue 
                    ? "bg-primary" 
                    : "bg-muted/20"
                )}
                initial={false}
                animate={{
                  backgroundColor: step <= progressValue 
                    ? "var(--primary)" 
                    : "rgba(0,0,0,0.1)"
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
