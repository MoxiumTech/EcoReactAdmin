'use client';

import { motion } from "framer-motion";
import { NavMenu } from "./nav-menu";
import { useCallback, useMemo } from "react";
import { 
  RiStoreLine,
  RiSettings4Line,
  RiGiftLine,
  RiPriceTag3Line,
  RiArchiveLine,
  RiBarChartBoxLine,
  RiStockLine,
  RiShoppingCart2Line,
  RiTruckLine,
  RiUserStarLine,
  RiTeamLine,
  RiAdvertisementLine,
} from "react-icons/ri";

function GlowingOrb() {
  return (
    <div className="absolute right-20 top-1/2 -translate-y-1/2 w-[800px] h-[800px]">
      <div className="absolute inset-0 blur-3xl rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 dark:from-blue-500/20 dark:to-purple-500/20 opacity-50" />
      <div className="absolute inset-0 blur-2xl rounded-full bg-gradient-to-tr from-pink-500/20 to-cyan-500/20 dark:from-pink-500/10 dark:to-cyan-500/10 opacity-40 animate-pulse" />
    </div>
  );
}

interface Position {
  x: number;
  y: number;
  duration: number;
  drift: number;
}

interface Feature {
  icon: JSX.Element;
  color: string;
  darkColor: string;
  label: string;
  description: string;
  category: string;
}

function FloatingCubes() {
  const features: Feature[] = [
    // Store Management
    {
      icon: <RiStoreLine className="w-4 h-4" />,
      color: "from-blue-500/20 to-blue-600/20",
      darkColor: "dark:from-blue-400/20 dark:to-blue-500/20",
      label: "Multi-Store Management",
      description: "Run multiple stores from a single dashboard",
      category: "Store"
    },
    {
      icon: <RiSettings4Line className="w-4 h-4" />,
      color: "from-indigo-500/20 to-indigo-600/20",
      darkColor: "dark:from-indigo-400/20 dark:to-indigo-500/20",
      label: "Store Customization",
      description: "Custom domains, themes & localization",
      category: "Store"
    },
    // Product Management
    {
      icon: <RiGiftLine className="w-4 h-4" />,
      color: "from-purple-500/20 to-purple-600/20",
      darkColor: "dark:from-purple-400/20 dark:to-purple-500/20",
      label: "Product Management",
      description: "Variants, SKUs & bulk operations",
      category: "Products"
    },
    {
      icon: <RiPriceTag3Line className="w-4 h-4" />,
      color: "from-pink-500/20 to-pink-600/20",
      darkColor: "dark:from-pink-400/20 dark:to-pink-500/20",
      label: "Dynamic Pricing",
      description: "Advanced pricing & discount rules",
      category: "Products"
    },
    // Stock Management
    {
      icon: <RiArchiveLine className="w-4 h-4" />,
      color: "from-red-500/20 to-red-600/20",
      darkColor: "dark:from-red-400/20 dark:to-red-500/20",
      label: "Inventory Control",
      description: "Real-time stock management",
      category: "Stock"
    },
    {
      icon: <RiBarChartBoxLine className="w-4 h-4" />,
      color: "from-orange-500/20 to-orange-600/20",
      darkColor: "dark:from-orange-400/20 dark:to-orange-500/20",
      label: "Stock Analytics",
      description: "Stock forecasting & alerts",
      category: "Stock"
    },
    // Marketing & Sales
    {
      icon: <RiAdvertisementLine className="w-4 h-4" />,
      color: "from-yellow-500/20 to-yellow-600/20",
      darkColor: "dark:from-yellow-400/20 dark:to-yellow-500/20",
      label: "Marketing Tools",
      description: "SEO, promos & email campaigns",
      category: "Marketing"
    },
    {
      icon: <RiTeamLine className="w-4 h-4" />,
      color: "from-green-500/20 to-green-600/20",
      darkColor: "dark:from-green-400/20 dark:to-green-500/20",
      label: "Team Collaboration",
      description: "Multi-user access & roles",
      category: "Team"
    },
    // Order Management
    {
      icon: <RiShoppingCart2Line className="w-4 h-4" />,
      color: "from-teal-500/20 to-teal-600/20",
      darkColor: "dark:from-teal-400/20 dark:to-teal-500/20",
      label: "Smart Orders",
      description: "Automated order processing",
      category: "Orders"
    },
    {
      icon: <RiTruckLine className="w-4 h-4" />,
      color: "from-cyan-500/20 to-cyan-600/20",
      darkColor: "dark:from-cyan-400/20 dark:to-cyan-500/20",
      label: "Shipping",
      description: "Multiple carriers & tracking",
      category: "Orders"
    },
    // Customer Management
    {
      icon: <RiUserStarLine className="w-4 h-4" />,
      color: "from-sky-500/20 to-sky-600/20",
      darkColor: "dark:from-sky-400/20 dark:to-sky-500/20",
      label: "Customer Profiles",
      description: "Detailed customer insights",
      category: "Customers"
    },
    {
      icon: <RiStockLine className="w-4 h-4" />,
      color: "from-blue-500/20 to-blue-600/20",
      darkColor: "dark:from-blue-400/20 dark:to-blue-500/20",
      label: "Analytics",
      description: "Real-time performance metrics",
      category: "Analytics"
    }
  ].sort(() => Math.random() - 0.5);

  const positions = useMemo<Position[]>(() => {
    const positions: Position[] = [];
    const zones = {
      left: { xStart: 5, xEnd: 30 },
      middle: { xStart: 35, xEnd: 60 },
      right: { xStart: 65, xEnd: 90 }
    };

    const createPositionsForZone = (zone: { xStart: number, xEnd: number }, count: number) => {
      for (let i = 0; i < count; i++) {
        const x = zone.xStart + Math.random() * (zone.xEnd - zone.xStart);
        const y = 120 + (i * 150) + (Math.random() * 50);
        
        positions.push({
          x,
          y,
          duration: 20 + Math.random() * 10,
          drift: Math.random() * 15 - 7.5,
        });
      }
    };

    createPositionsForZone(zones.left, 4);
    createPositionsForZone(zones.middle, 4);
    createPositionsForZone(zones.right, 4);

    return positions.sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div className="fixed right-40 bottom-0 w-[600px] h-[calc(100vh+5rem)] overflow-visible pointer-events-none floating-icons">
      {features.map((feature, i) => {
        const position = positions[i];
        return (
          <motion.div
            key={i}
            className="w-14 h-14 bg-gradient-to-br from-white/90 to-white/70 dark:from-white/10 dark:to-white/5 backdrop-blur-sm rounded-xl shadow-xl absolute group"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(45deg) rotateZ(45deg)",
              backfaceVisibility: "hidden",
              left: `${position.x}%`,
            }}
            initial={{ 
              y: `${position.y}vh`,
              x: 0
            }}
            animate={{
              y: [null, "-20vh"],
              x: [0, position.drift]
            }}
            transition={{
              duration: position.duration,
              repeat: Infinity,
              ease: "linear",
              times: [0, 1]
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} ${feature.darkColor} rounded-xl`} />
            <div className="absolute inset-0 flex items-center justify-center text-gray-800 dark:text-gray-200 transform -rotate-45">
              {feature.icon}
            </div>
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 dark:bg-white/80 text-white dark:text-gray-900 text-xs p-2 rounded-md -translate-y-full -translate-x-1/2 left-1/2 pointer-events-none whitespace-nowrap">
              <div className="font-medium">{feature.label}</div>
              <div className="text-gray-300 dark:text-gray-600 text-[10px]">{feature.description}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function HeroSection() {
  return (
    <div className="relative h-screen flex flex-col overflow-visible bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
      <NavMenu />
      
      <div className="flex-1 flex items-center">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl">
            <motion.h1
              className="text-5xl sm:text-7xl font-medium text-gray-900 dark:text-gray-50 leading-[1.1] mb-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              Transform Your Business with Modern E-commerce
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-400 mb-10"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Build, manage, and scale your online store with our powerful platform designed for modern businesses.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => window.location.href = `${window.location.protocol}//admin.${window.location.host}/signup`}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-primary/25"
              >
                Get Started
              </button>
              <button 
                onClick={() => window.location.href = `${window.location.protocol}//admin.${window.location.host}/signin`}
                className="px-8 py-4 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg font-medium border border-border transition-all hover:shadow-lg"
              >
                See Demo
              </button>
            </motion.div>
          </div>
        </div>
        
        <GlowingOrb />
        <FloatingCubes />
      </div>
    </div>
  );
}
