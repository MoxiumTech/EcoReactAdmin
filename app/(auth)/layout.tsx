'use client';

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/check');
    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const cards = document.getElementsByClassName('glass-gradient');
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
      (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    checkAuth().then((isAuthenticated) => {
      if (isAuthenticated) {
        router.push('/');
      } else {
        setIsLoading(false);
      }
    });
  }, [router]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0,0.1)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(255,255,255,0.1)_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="fixed top-6 right-6 z-50 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Content Container */}
      <div className="relative flex min-h-screen flex-col items-center justify-center p-8">
        {/* Logo */}
        <div className="mb-8">
          <span className="moxium-logo text-2xl text-gray-800 dark:text-white">moxium</span>
        </div>

        {/* Content Box */}
        <div className="w-full max-w-[400px] relative">
          <div className="glass-auth-container rounded-2xl overflow-hidden">
            <div className="glass-gradient absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative px-8 py-12">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
