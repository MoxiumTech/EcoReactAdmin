"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams, useRouter } from "next/navigation";
import { ShoppingBag, Moon, Sun, User, Store, ChevronDown, Search, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import useCart from "@/hooks/use-cart";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Taxon {
  id: string;
  name: string;
  permalink: string;
  children: Taxon[];
}

interface Category {
  id: string;
  name: string;
  taxons: Taxon[];
}

interface NavbarProps {
  taxonomies: Category[];
  store: {
    name: string;
    logoUrl: string | null;
  };
}

const NestedDropdown: React.FC<{
  taxon: Taxon;
  domain: string;
}> = ({ taxon, domain }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/store/${domain}/category/${taxon.id}`}
        className="flex items-center justify-between px-4 py-2 hover:bg-accent w-full text-sm"
      >
        {taxon.name}
        {taxon.children?.length > 0 && (
          <ChevronRight className="h-4 w-4 ml-2" />
        )}
      </Link>
      
      {taxon.children?.length > 0 && isHovered && (
        <div className="absolute left-full top-0 w-48 bg-background border rounded-md shadow-md">
          {taxon.children.map((child) => (
            <NestedDropdown key={child.id} taxon={child} domain={domain} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({ 
  taxonomies = [], 
  store = { name: "Store", logoUrl: null }  // Default values
}) => {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const cart = useCart();
  const domain = params?.domain as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    const checkAuth = async () => {
      try {
        const origin = window.location.origin;
        const response = await fetch(`${origin}/api/auth/customer/profile?domain=${domain}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });
        
        if (response.ok) {
          const { success, data } = await response.json();
          if (success && data?.id) {
            setIsAuthenticated(true);
            return;
          }
        }
        
        setIsAuthenticated(false);
        if (pathname.includes('/profile') || pathname.includes('/orders')) {
          router.replace(`/store/${domain}/signin`);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Auth check failed:', error);
          setIsAuthenticated(false);
        }
      }
    };

    if (domain) {
      checkAuth();
    }

    return () => controller.abort();
  }, [domain, pathname, router]);

  // Separate useEffect for cart fetching
  useEffect(() => {
    if (isAuthenticated && !cart.items.length) {
      cart.fetchCart();
    }
  }, [isAuthenticated, cart]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-1">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-xs">
            <div>Free Shipping on Orders Over $50</div>
            <div className="flex gap-4">
              <Link href={`/store/${domain}/contact`}>Contact</Link>
              <Link href={`/store/${domain}/help`}>Help</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "bg-background"
      )}>
        {/* Upper Nav Section */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href={`/store/${domain}`} 
              className="flex items-center gap-x-2 hover:opacity-90 transition-opacity"
            >
              {store?.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store?.name || "Store"}
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              ) : (
                <p className="font-bold text-2xl tracking-tight">{store?.name || "Store"}</p>
              )}
            </Link>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="hover:bg-accent"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>

              <Link href={`/store/${domain}/cart`}>
                <Button variant="ghost" size="icon" className="hover:bg-accent relative">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {cart.items.length}
                  </span>
                </Button>
              </Link>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="hover:bg-accent flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span className="hidden md:inline">Account</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href={`/store/${domain}/profile`}>Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/store/${domain}/orders`}>My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/store/${domain}/wishlist`}>Wishlist</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500 cursor-pointer"
                      onSelect={async (event) => {
                        event.preventDefault();
                        try {
                          const origin = window.location.origin;
                          const response = await fetch(`${origin}/api/storefront/${domain}/auth/signout`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                          });

                          if (response.ok) {
                            // Clear local cart state if needed
                            localStorage.removeItem(`cart_${domain}`);
                            // Force page refresh to clear all states
                            window.location.href = `/store/${domain}`;
                          }
                        } catch (error) {
                          console.error('Error signing out:', error);
                          // Still redirect on error
                          window.location.href = `/store/${domain}`;
                        }
                      }}
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href={`/store/${domain}/signin`}>
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href={`/store/${domain}/signup`}>
                    <Button>Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="border-t">
          <div className="container mx-auto px-4">
            <div className="flex">
              {taxonomies.map((category) => (
                <div key={category.id} className="group relative">
                  <button className="px-4 py-3 text-sm font-medium hover:text-primary flex items-center gap-1">
                    {category.name}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  <div className="hidden group-hover:block absolute left-0 top-full w-48 bg-background border rounded-md shadow-md">
                    {category.taxons.map((taxon) => (
                      <NestedDropdown 
                        key={taxon.id} 
                        taxon={taxon} 
                        domain={domain}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
