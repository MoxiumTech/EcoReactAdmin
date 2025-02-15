"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { Logo } from "./components/Logo";
import { SearchBar } from "./components/SearchBar";
import { CategoryMenu } from "./components/CategoryMenu";
import { UserMenu } from "./components/UserMenu";
import { CartButton } from "./components/CartButton";
import { ThemeToggle } from "./components/ThemeToggle";

interface NavbarProps {
  taxonomies: Array<{
    id: string;
    name: string;
    taxons: Array<{
      id: string;
      name: string;
      permalink: string;
      children: any[];
    }>;
  }>;
  store: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  className?: string;
}

export const Navbar = ({ taxonomies = [], store, className }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [domain, setDomain] = useState<string>("");

  // Get domain from URL
  useEffect(() => {
    const parts = window.location.pathname.split('/');
    const domainIndex = parts.indexOf('store') + 1;
    if (domainIndex > 0 && parts[domainIndex]) {
      setDomain(parts[domainIndex]);
    }
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={className}>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-1">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-xs">
            <div>Free Shipping on Orders Over $50</div>
            <div className="flex gap-4">
              <a href={`/store/${domain}/contact`} className="hover:underline">
                Contact
              </a>
              <a href={`/store/${domain}/help`} className="hover:underline">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={cn(
          "sticky top-0 z-50 bg-background transition-all duration-300",
          isScrolled && "shadow-md"
        )}
      >
        {/* Upper Nav Section */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-8">
            {/* Logo */}
            <Logo domain={domain} store={store} className="flex-shrink-0" />

            {/* Search Bar */}
            <SearchBar 
              storeId={store.id} 
              domain={domain}
              className="hidden lg:block flex-1 max-w-2xl" 
            />

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <CartButton domain={domain} />
              <UserMenu domain={domain} />
            </div>
          </div>
        </div>

        {/* Categories Navigation */}
        <CategoryMenu domain={domain} taxonomies={taxonomies} />
      </nav>
    </div>
  );
};

export * from "./components/SearchBar";
export * from "./components/CategoryMenu";
export * from "./components/UserMenu";
export * from "./components/CartButton";
export * from "./components/ThemeToggle";
export * from "./components/Logo";
