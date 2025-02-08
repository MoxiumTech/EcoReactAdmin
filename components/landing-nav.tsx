"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN;

export function LandingNav() {
  const [baseUrl, setBaseUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBaseUrl(`${window?.location?.protocol || 'https:'}//${ADMIN_DOMAIN}`);
  }, []);

  // Avoid hydration mismatch
  if (!mounted) return null;

  const getURL = (path: string) => {
    if (!ADMIN_DOMAIN) return "#";
    return baseUrl ? `${baseUrl}${path}` : "#";
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/70 backdrop-blur-lg border-b border-gray-200/30 dark:border-gray-800/30" />
      <nav className="container relative flex h-20 items-center justify-between px-4">
        <Link 
          href="/" 
          className="flex items-center space-x-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary dark:from-primary dark:via-purple-400 dark:to-primary bg-clip-text text-transparent bg-[length:200%_auto] hover:animate-gradient">
            Moxium
          </span>
        </Link>

        <div className="hidden md:flex items-center">
          <div className="flex space-x-1">
            <Link 
              href="#features" 
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              Features
              <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 transition-opacity opacity-0 group-hover:opacity-100" />
            </Link>
            <Link 
              href="#integrations" 
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              Integrations
              <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 transition-opacity opacity-0 group-hover:opacity-100" />
            </Link>
            <Link 
              href={getURL("/pricing")}
              className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              Pricing
              <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 transition-opacity opacity-0 group-hover:opacity-100" />
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <ThemeToggle />
          <div className="h-5 w-px bg-gray-200 dark:bg-gray-800" />
          <Link href={getURL("/signin")}>
            <Button 
              variant="ghost" 
              className="font-medium hover:bg-gray-100/50 dark:hover:bg-white/5 transition-all relative group"
            >
              Sign In
              <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-primary/0 via-primary/40 to-primary/0 transition-opacity opacity-0 group-hover:opacity-100" />
            </Button>
          </Link>
          <Link href={getURL("/signup")}>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-primary dark:via-purple-400 opacity-0 group-hover:opacity-100 transition-opacity bg-[length:200%_auto] animate-gradient" />
              <span className="relative">
                Get Started
              </span>
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
