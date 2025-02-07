'use client';

import { NavMenu } from "@/components/landing/nav-menu";
import { HeroSection } from "@/components/landing/hero-section";
import { 
  SolutionsSection,
  PricingSection,
  CustomersSection,
  ResourcesSection
} from "@/components/landing/sections";
import { Footer } from "@/components/landing/footer";
import { motion } from "framer-motion";
import { 
  RiShoppingBag2Line,
  RiBarChart2Line,
  RiUserSmileLine,
  RiRocketLine,
  RiFlashlightLine,
  RiLightbulbLine,
  RiStore2Line,
  RiPieChartLine,
  RiGlobalLine
} from "react-icons/ri";

export default function LandingPage() {
  return (
    <main className="h-screen w-full overflow-y-auto overflow-hidden landing-page">
      <NavMenu />
      
      {/* Hero Section */}
      <section id="hero" className="h-screen w-full">
        <HeroSection />
      </section>

      {/* Features Section */}
      <section id="features" className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-background relative overflow-hidden pt-20 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(0,0,0,0))]" />
        
        <div className="container mx-auto px-4 py-20 relative">
          {/* Section Header */}
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-medium text-gray-900 dark:text-slate-50 mb-6 transition-colors duration-300">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-400 transition-colors duration-300">
              Our platform provides all the tools and features you need to build and scale your online business.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {featuresData.map((feature, i) => (
              <motion.div
                key={i}
                className="group"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
              >
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 shadow-lg hover:shadow-xl dark:shadow-slate-900/50 transition-all relative overflow-hidden group-hover:translate-y-[-2px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10">
                    <div className="text-3xl text-primary mb-4 dark:text-primary/90">{feature.icon}</div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-slate-50 mb-4 transition-colors duration-300">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-slate-400 transition-colors duration-300">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Additional Sections */}
      <SolutionsSection />
      <PricingSection />
      <CustomersSection />
      <ResourcesSection />

      <Footer />
    </main>
  );
}

const featuresData = [
  {
    icon: <RiShoppingBag2Line />,
    title: "Smart Inventory",
    description: "Manage your inventory with real-time tracking and automated reordering systems."
  },
  {
    icon: <RiBarChart2Line />,
    title: "Analytics Dashboard",
    description: "Get detailed insights into your business performance with beautiful visualizations."
  },
  {
    icon: <RiUserSmileLine />,
    title: "Customer Insights",
    description: "Understand your customers better with comprehensive profiles and behavior analysis."
  },
  {
    icon: <RiRocketLine />,
    title: "Quick Setup",
    description: "Get your store up and running in minutes with our intuitive setup process."
  },
  {
    icon: <RiFlashlightLine />,
    title: "Smart Search",
    description: "Help customers find exactly what they're looking for with intelligent search."
  },
  {
    icon: <RiGlobalLine />,
    title: "Global Reach",
    description: "Sell to customers anywhere in the world with multi-currency and language support."
  },
  {
    icon: <RiStore2Line />,
    title: "Multi-Store",
    description: "Manage multiple stores from a single dashboard with powerful organization tools."
  },
  {
    icon: <RiPieChartLine />,
    title: "Sales Reports",
    description: "Track your performance with detailed reports and actionable insights."
  },
  {
    icon: <RiLightbulbLine />,
    title: "Smart Automation",
    description: "Automate routine tasks and focus on growing your business."
  }
];
