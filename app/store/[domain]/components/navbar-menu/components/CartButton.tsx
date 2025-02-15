"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useCart from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  domain: string;
  className?: string;
}

export const CartButton = ({ domain, className }: CartButtonProps) => {
  const cart = useCart();

  return (
    <Link href={`/store/${domain}/cart`}>
      <Button
        variant="ghost"
        size="icon"
        className={cn("hover:bg-accent relative", className)}
      >
        <ShoppingBag className="h-5 w-5" />
        {cart.items.length > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 bg-primary text-primary-foreground",
              "rounded-full w-4 h-4 text-xs flex items-center justify-center",
              "animate-in zoom-in-50 duration-300"
            )}
          >
            {cart.items.length}
          </span>
        )}
      </Button>
    </Link>
  );
};
