"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Users, Activity, ChevronUp } from "lucide-react";

export function HeroIllustration() {
  return (
    <div>
      {/* Subtle Background Effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      </div>

      {/* Performance Analytics Card */}
      <AnimatePresence>
        <motion.div
          variants={cardVariants(0.5)}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="absolute top-[25%] left-[15%] w-72 bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50 dark:border-white/20 shadow-2xl dark:shadow-black/20 z-10"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-gray-900 dark:text-white/90">Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-emerald-400"
              />
              <span className="text-xs text-emerald-400">Live</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                98.3%
              </motion.span>
              <div className="flex items-center text-xs text-emerald-400">
                <ChevronUp className="h-3 w-3" />
                <span>2.4%</span>
              </div>
            </div>
            <div className="space-y-2">
              {[0.8, 0.6, 0.9].map((width, i) => (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8 + i * 0.2 }}
                  className="relative h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10"
                >
                  <div
                    className="absolute h-full bg-primary/80 dark:bg-primary/60 rounded-full transition-all duration-1000"
                    style={{ width: `${width * 100}%` }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Analytics Card */}
      <AnimatePresence>
        <motion.div
          variants={cardVariants(0.7)}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="absolute top-[35%] right-[15%] w-80 bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50 dark:border-white/20 shadow-2xl dark:shadow-black/20 z-10"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <BarChart3 className="h-5 w-5 text-primary" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-primary"
                />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white/90">Analytics</span>
            </div>
          </div>
          <div className="mt-2 relative h-32">
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between h-24">
              {[65, 45, 75, 55, 85, 70, 90].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                  className="w-6 bg-gradient-to-t from-primary/40 to-primary/80 rounded-t"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Team Card */}
      <AnimatePresence>
        <motion.div
          variants={cardVariants(0.9)}
          initial="initial"
          animate="animate"
          whileHover="hover"
          className="absolute bottom-[25%] left-[25%] bg-white/90 dark:bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-gray-200/50 dark:border-white/20 shadow-2xl dark:shadow-black/20 z-10"
        >
          <div className="flex items-center gap-3 mb-3">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-gray-900 dark:text-white/90">Active Team</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 border-2 border-gray-200/50 dark:border-white/20 flex items-center justify-center text-xs text-gray-900 dark:text-white/90"
                >
                  {String.fromCharCode(65 + i)}
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8 }}
              className="h-8 w-8 rounded-full bg-white/60 dark:bg-white/10 border border-gray-200/50 dark:border-white/20 flex items-center justify-center text-xs text-gray-700 dark:text-white/70"
            >
              +4
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Optimized Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            initial={{ 
              opacity: 0,
              scale: 0,
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%"
            }}
            animate={{ 
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0],
              x: `${(Math.random() - 0.5) * 50 + 50}%`,
              y: `${(Math.random() - 0.5) * 50 + 50}%`
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "linear"
            }}
            className="absolute h-1 w-1 bg-primary/40 dark:bg-primary/30 rounded-full blur-sm"
          />
        ))}
      </div>
    </div>
  );
}

function cardVariants(delay: number) {
  return {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        delay,
        duration: 0.5
      }
    },
    hover: { 
      y: -5,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };
}
