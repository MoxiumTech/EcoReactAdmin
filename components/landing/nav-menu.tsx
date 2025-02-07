'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { useAuthCheck } from "@/hooks/use-auth";

const navLinks = [
  { href: "features", label: "Features" },
  { href: "solutions", label: "Solutions" },
  { href: "pricing", label: "Pricing" },
  { href: "customers", label: "Customers" },
  { href: "resources", label: "Resources" },
];

// Nav links configuration

export function NavMenu() {
  const { theme, setTheme } = useTheme();
  const { user, checkAuth } = useAuthCheck();

  // Check auth on component mount
  useEffect(() => {
    checkAuth();
  }, []); // Only run once on mount since checkAuth reference is stable

  const scrollToSection = (sectionId: string) => {
    // Using a timeout to ensure DOM is fully loaded
    setTimeout(() => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 dark:bg-background/80 backdrop-blur-md border-b border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <div className="container mx-auto h-20">
        <div className="flex items-center justify-between h-full px-4">
          <Link
            href="/"
            className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary"
          >
            Moxium
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-muted-foreground hover:text-foreground font-medium transition-colors relative group py-2"
              >
                {link.label}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="mr-6"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user ? (
              <a
                href={`http://${process.env.NEXT_PUBLIC_ADMIN_DOMAIN || 'admin.lvh.me:3000'}/${user.storeId}/overview`}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/10 hover:shadow-primary/20"
              >
                Dashboard
              </a>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-muted-foreground hover:text-foreground font-medium px-4 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
