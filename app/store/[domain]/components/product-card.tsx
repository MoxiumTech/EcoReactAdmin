"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Currency } from "@/components/ui/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useCart from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { Product, Variant, Image as ProductImage } from "@/types/models";

interface ProductCardProps {
  data: Product;
  size?: "default" | "compact";
}

export const ProductCard: React.FC<ProductCardProps> = ({
  data,
  size = "default"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const cart = useCart();
  const router = useRouter();
  const params = useParams();
  const domain = params?.domain as string;

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.cart-button')) {
      e.stopPropagation();
      return;
    }
    if (!data.slug) {
      console.error('Product has no slug:', data);
      return;
    }
    router.push(`/store/${domain}/product/${data.slug}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!displayVariant) return;
    
    try {
      setIsLoading(true);
      await cart.addItem({
        id: displayVariant.id,
        name: displayVariant.name,
        price: displayVariant.price,
        image: displayVariant.images?.[0]?.url || data.images?.[0]?.url || '',
        quantity: 1
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get the first available variant with stock
  const displayVariant = data.variants.find(variant => 
    variant.stockItems.some(stock => stock.count > 0)
  );

  // Use variant price if available, otherwise use product price
  const price = displayVariant?.price || data.price;
  const compareAtPrice = displayVariant?.compareAtPrice;

  // Get the first available image
  const displayImage = data.images[0];
  const discount = compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  // Log data for debugging
  console.log('Product Card Data:', {
    name: data.name,
    slug: data.slug,
    domain,
    url: `/store/${domain}/product/${data.slug}`
  });

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group cursor-pointer text-left bg-white rounded-xl overflow-hidden transition-all duration-300 relative",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100",
        size === "compact" ? "max-w-[200px]" : "w-full"
      )}
    >
      <div className={cn(
        "relative bg-gray-50 overflow-hidden",
        size === "compact" ? "aspect-[4/5]" : "aspect-[3/4]"
      )}>
        {displayImage ? (
          <Image
            src={displayImage.url}
            alt={displayImage.alt || data.name}
            fill
            className={cn(
              "object-contain object-center transition-transform duration-500",
              "group-hover:scale-105",
              "p-4"
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-gray-400 text-sm">No image</div>
          </div>
        )}
        {/* Top badges and buttons */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
          <div className="space-y-1.5">
            {discount > 0 && (
              <Badge variant="destructive" className="px-2 py-0.5 text-xs font-medium">
                Save {discount}%
              </Badge>
            )}
            {data.brand && (
              <Badge variant="secondary" className="px-2 py-0.5 text-xs bg-white/80 backdrop-blur-sm">
                {data.brand.name}
              </Badge>
            )}
          </div>
          <Button 
            variant="secondary" 
            size="icon" 
            className={cn(
              "h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-white hover:scale-110"
            )}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className={cn(
        "p-4 space-y-2",
        size === "compact" ? "p-3" : "p-4"
      )}>
        <div className="space-y-1">
          {data.brand && (
            <div className="text-xs text-muted-foreground">
              {data.brand.name}
            </div>
          )}
          <h3 className={cn(
            "font-medium text-gray-900 transition-colors group-hover:text-primary",
            size === "compact" ? "text-sm line-clamp-1" : "line-clamp-2"
          )}>
            {data.name}
          </h3>
        </div>

        {/* Reviews section - Hardcoded for now */}
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span className="text-xs font-medium">4.8</span>
          <span className="text-xs text-muted-foreground">(128)</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "font-semibold text-gray-900",
                size === "compact" ? "text-sm" : "text-base"
              )}>
                <Currency value={price} />
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-sm text-muted-foreground line-through">
                  <Currency value={compareAtPrice} />
                </span>
              )}
            </div>
          </div>
          <Button
            disabled={isLoading}
            onClick={handleAddToCart}
            size="icon"
            variant="ghost"
            className={cn(
              "cart-button h-8 w-8",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
