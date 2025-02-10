"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import useCart from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/ui/currency";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

interface CartItemsProps {
  isPreview?: boolean;
}

const NoImagePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
    <ShoppingBag className="w-8 h-8 text-gray-400" />
  </div>
);

const CartItems: React.FC<CartItemsProps> = ({ isPreview }) => {
  const params = useParams();
  const { items, isLoading, updateQuantity, removeItem } = useCart();

  // Memoize the total calculation
  const calculateTotal = React.useCallback(() => {
    return items.reduce((total: number, item) => {
      return total + (Number(item.variant.price) * item.quantity);
    }, 0);
  }, [items]);

  const total = React.useMemo(() => calculateTotal(), [calculateTotal]);

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center h-[400px] p-6">
        <div className="animate-pulse">
          <Loader />
        </div>
        <p className="text-sm text-gray-500 mt-4 animate-pulse">Loading your cart...</p>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className="flex flex-col items-center justify-center h-[400px] p-8">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 text-center mb-6">Looks like you haven't added anything to your cart yet</p>
        <Button asChild size="lg">
          <Link href={`/store/${params.domain}`}>Start Shopping</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6 hover:shadow-md transition-all duration-200 group">
              <div className="flex space-x-6">
                <div className="relative h-32 w-32 rounded-xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow transition-shadow duration-200">
                  {item.variant.images?.[0]?.url ? (
                    <Image
                      fill
                      src={item.variant.images[0].url}
                      alt={item.variant.product.name}
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <NoImagePlaceholder />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link 
                        href={`/store/${params.domain}/product/${item.variant.product.slug}`}
                        className="block hover:text-primary transition-colors"
                      >
                        <h3 className="text-lg font-medium text-gray-900">
                          {item.variant.product.name}
                        </h3>
                      </Link>
                      <div className="text-sm text-gray-500 space-y-1">
                        {item.variant.name && (
                          <p>Variant: {item.variant.name}</p>
                        )}
                        <p>
                          Price: <Currency value={Number(item.variant.price)} />
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => removeItem(item.id)}
                      variant="ghost"
                      className="text-gray-400 p-2 hover:text-red-600 hover:bg-red-50 -mr-2 rounded-full transition-colors"
                      disabled={isLoading}
                    >
                      <X size={20} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <Button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isLoading}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full transition-colors hover:border-primary hover:text-primary"
                      >
                        <Minus size={14} />
                      </Button>
                      <span className="text-sm font-medium w-12 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full transition-colors hover:border-primary hover:text-primary"
                        disabled={isLoading}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    <p className="font-medium text-lg">
                      <Currency value={Number(item.variant.price) * item.quantity} />
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {!isPreview && (
        <Card className="p-8 mt-8 space-y-6 bg-gray-50/50 backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <Currency value={total} className="text-base" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-500 italic">Calculated at checkout</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Total</span>
                <Currency
                  value={total}
                  className="text-2xl font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              className="w-full py-6 text-lg font-medium transition-all duration-200 hover:shadow-lg" 
              size="lg" 
              onClick={() => window.location.href = `/store/${params.domain}/checkout`}
              disabled={isLoading || items.length === 0}
            >
              Proceed to Checkout
            </Button>
            <p className="text-sm text-center text-gray-500 space-x-1">
              <span>Secure checkout powered by</span>
              <span className="font-medium text-gray-900">Stripe</span>
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CartItems;
