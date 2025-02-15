"use client";

import { useState, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { isCustomerAuthenticated } from "@/lib/client-auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  domain: string;
  className?: string;
}

export const UserMenu = ({ domain, className }: UserMenuProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const origin = window.location.origin;
        const response = await fetch(`${origin}/api/auth/customer/profile?domain=${domain}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const { success, data } = await response.json();
          setIsAuthenticated(success && data?.id);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Handle auth state changes
    window.addEventListener('auth-state-change', checkAuth);
    return () => {
      window.removeEventListener('auth-state-change', checkAuth);
    };
  }, [domain]);

  const handleSignOut = async () => {
    try {
      const origin = window.location.origin;
      const response = await fetch(`${origin}/api/storefront/${domain}/auth/signout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        localStorage.removeItem(`cart_${domain}`);
        window.location.href = `/store/${domain}`;
      }
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = `/store/${domain}`;
    }
  };

  if (isLoading) {
    return <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />;
  }

  if (isAuthenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "hover:bg-accent/60 flex items-center gap-2 px-3",
              "text-muted-foreground hover:text-foreground transition-colors"
            )}
            size="sm"
          >
            <User className="h-4 w-4" />
            <span className="hidden md:inline text-sm">Account</span>
            <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link 
              href={`/store/${domain}/profile`} 
              className="cursor-pointer text-sm font-medium"
            >
              Profile Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              href={`/store/${domain}/orders`} 
              className="cursor-pointer text-sm font-medium"
            >
              My Orders
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link 
              href={`/store/${domain}/wishlist`} 
              className="cursor-pointer text-sm font-medium"
            >
              Wishlist
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-sm font-medium text-destructive focus:text-destructive"
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Not authenticated
  return (
      <div className={cn("flex items-center gap-2", className)}>
        <Link href={`/store/${domain}/signin`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Button>
        </Link>
        <Link href={`/store/${domain}/signup`}>
          <Button 
            size="sm"
            className="bg-primary/90 hover:bg-primary"
          >
            Sign Up
          </Button>
        </Link>
      </div>
  );
};
