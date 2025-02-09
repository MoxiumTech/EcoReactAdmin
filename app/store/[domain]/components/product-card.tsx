"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product, Variant, StockItem } from "@/types/models";
import { Currency } from "@/components/ui/currency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import useCart from "@/hooks/use-cart";

interface ProductCardProps {
  data: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  data
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const cart = useCart();
  const router = useRouter();
  const params = useParams();
  const domain = params?.domain as string;

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking the cart button
    if ((e.target as HTMLElement).closest('.cart-button')) {
      e.stopPropagation();
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
        name: displayVariant.name || data.name,
        price: displayVariant.price || data.price,
        image: displayVariant.images?.[0]?.url || data.images?.[0]?.url || '',
        quantity: 1
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get the first available variant with a price, or use the product's price
  const displayVariant = data.variants.find((variant: Variant) => 
    variant.isVisible && 
    variant.price && 
    variant.stockItems.some((stock: StockItem) => stock.count > 0)
  );
  const price = displayVariant?.price || data.price;
  const compareAtPrice = displayVariant?.compareAtPrice;

  // Get the first available image from either the product or its variants
  const displayImage = data.images[0] || data.variants.flatMap((variant: Variant) => variant.images)[0];

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer w-full text-left bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300 relative"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden group">
        <Image
          src={displayImage?.url || "/placeholder.png"}
          alt={data.name}
          fill
          className="object-cover object-center transition duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {compareAtPrice && compareAtPrice > price && (
            <Badge variant="destructive" className="text-xs">
              {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% OFF
            </Badge>
          )}
          {data.brand && (
            <Badge variant="secondary" className="text-xs">
              {data.brand.name}
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {data.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-gray-900">
              <Currency value={price} />
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-gray-500 line-through">
                <Currency value={compareAtPrice} />
              </span>
            )}
          </div>
          <Button
            disabled={isLoading}
            onClick={handleAddToCart}
            size="sm"
            className="cart-button opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
