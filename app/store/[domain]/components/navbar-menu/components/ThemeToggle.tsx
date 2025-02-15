"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn("hover:bg-accent", className)}
      title="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 transition-transform hover:rotate-45" />
      ) : (
        <Sun className="h-5 w-5 transition-transform hover:rotate-45" />
      )}
    </Button>
  );
};
