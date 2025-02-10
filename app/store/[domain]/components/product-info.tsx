"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { type Product, type Variant } from "@/types/models";
import { Currency } from "@/components/ui/currency";
import { Button } from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProductInfoProps {
  product: Product;
  onVariantChange?: (variant: Variant | null) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  onVariantChange
}) => {
  const cart = useCart();
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Get available variants with their options
  const availableVariants = product.variants
    .filter(variant => variant.isVisible)
    .sort((a, b) => {
      // First sort by in stock status
      const aInStock = a.stockItems.some(item => item.count > 0);
      const bInStock = b.stockItems.some(item => item.count > 0);
      if (aInStock !== bInStock) return bInStock ? 1 : -1;
      
      // Then sort by price
      return a.price - b.price;
    });

  useEffect(() => {
    onVariantChange?.(selectedVariant);
  }, [selectedVariant, onVariantChange]);

  const handleVariantSelect = (variant: Variant) => {
    // If clicking the already selected variant, deselect it
    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null);
    } else {
      setSelectedVariant(variant);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const max = selectedVariant 
      ? Math.max(...selectedVariant.stockItems.map(item => item.count))
      : 99;
    
    setQuantity(Math.min(Math.max(1, newQuantity), max));
  };

  const handleAddToCart = async () => {
    const variantToAdd = selectedVariant || product;
    if (!variantToAdd) return;

    setAddingToCart(true);
    await cart.addItem(variantToAdd.id, quantity);
    setTimeout(() => setAddingToCart(false), 600);
  };

  const currentPrice = selectedVariant?.price || product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice || null;
  const inStock = selectedVariant 
    ? selectedVariant.stockItems.some(item => item.count > 0)
    : true; // Base product is always considered in stock

  const discount = compareAtPrice && currentPrice 
    ? Math.round((1 - currentPrice / compareAtPrice) * 100)
    : null;

  return (
    <Card className="p-6 space-y-8 bg-white/50 backdrop-blur-sm shadow-sm">
      <div className="space-y-4">
        {/* Brand name */}
        {product.brand && (
          <div className="inline-block bg-primary/10 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-primary">
              {product.brand.name}
            </span>
          </div>
        )}
        
        {/* Product name and price */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
        <div className="flex items-baseline gap-4">
            <span className="text-4xl font-semibold tracking-tight text-gray-900">
            <Currency value={currentPrice} />
          </span>
          {compareAtPrice && (
            <span className="text-xl text-gray-400 line-through">
              <Currency value={compareAtPrice} />
            </span>
          )}
          {discount && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-600 animate-in slide-in-from-right-5 duration-300">
              {discount}% OFF
            </span>
          )}
        </div>
      </div>
      
      {/* Variants List */}
      {availableVariants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Available Variants</h3>
            {selectedVariant && (
              <button
                onClick={() => setSelectedVariant(null)}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Reset to default
              </button>
            )}
          </div>
          <div className="space-y-2">
            {availableVariants.map(variant => {
              const variantInStock = variant.stockItems.some(item => item.count > 0);
              const isSelected = selectedVariant?.id === variant.id;
              
              // Just use the variant name
              const variantName = variant.name;

              return (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(variant)}
                disabled={!variantInStock}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md",
                  isSelected ? (
                    "border-primary bg-primary text-white"
                  ) : variantInStock ? (
                    "border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                  ) : (
                    "border-gray-200 bg-gray-50/50 text-gray-400 cursor-not-allowed"
                  )
                )}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {variantName}
                    </span>
                    <span className={cn(
                      "text-xs mt-1",
                      isSelected ? "text-primary-foreground/75" : "text-gray-500"
                    )}>
                      {variantInStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-semibold",
                      isSelected ? "text-white" : "text-gray-900"
                    )}>
                      <Currency value={variant.price} />
                    </span>
                    {isSelected && (
                      <Check size={16} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity and add to cart */}
      <div className="space-y-6 pt-2">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
            {inStock ? (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                In Stock
              </span>
            ) : (
              <span className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Out of Stock
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">Choose the quantity you'd like to order</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center border rounded-full shadow-sm bg-white">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={!inStock || quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded-l-full"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
              className="w-16 text-center border-x py-2 text-sm bg-transparent"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={!inStock}
              className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded-r-full"
            >
              <Plus size={16} />
            </button>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!inStock || addingToCart}
            className={cn(
              "flex-1 py-6 text-lg font-medium transition-all duration-300 relative overflow-hidden",
              addingToCart ? "bg-green-600 hover:bg-green-700" : ""
            )}
            size="lg"
          >
            <span className={cn(
              "absolute inset-0 flex items-center justify-center bg-green-600 transition-transform duration-300",
              addingToCart ? "translate-y-0" : "translate-y-full"
            )}>
              Added to Cart!
            </span>
            <span className={cn(
              "flex items-center justify-center gap-2 transition-transform duration-300",
              addingToCart ? "-translate-y-full" : "translate-y-0"
            )}>
              <ShoppingCart size={20} />
              Add to Cart
            </span>
          </Button>
        </div>
      </div>

      {/* Description */}
      {/* Description */}
      {product.description && product.description.length > 0 && (
        <div className="border-t pt-8">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
          <div 
            className="prose prose-sm text-gray-600 max-w-none prose-headings:font-medium prose-headings:text-gray-900 prose-strong:text-gray-900 prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: product.description || '' }}
          />
        </div>
      )}
    </Card>
  );
};
