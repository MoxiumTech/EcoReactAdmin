"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Minus, Plus, X } from "lucide-react";

import useCart from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/ui/currency";
import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";

interface CartItemsProps {
  isPreview?: boolean;
}

const NoImagePlaceholder = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
    <span className="text-gray-500 text-sm font-medium">No Image Found</span>
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
      <Card className="flex flex-col items-center justify-center h-[300px] p-6">
        <Loader />
        <p className="text-sm text-gray-500 mt-4">Loading cart...</p>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className="flex flex-col items-center justify-center h-[300px] p-6">
        <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <X size={24} className="text-gray-400" />
        </div>
        <p className="text-xl font-medium text-gray-900">Your cart is empty</p>
        <p className="text-gray-500 mt-2">Add items to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex space-x-4">
            <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-gray-100">
              {item.variant.images?.[0]?.url ? (
                <Image
                  fill
                  src={item.variant.images[0].url}
                  alt={item.variant.product.name}
                  className="object-cover"
                />
              ) : (
                <NoImagePlaceholder />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900 truncate">
                    {item.variant.product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    <Currency value={Number(item.variant.price)} />
                  </p>
                </div>
                <Button
                  onClick={() => removeItem(item.id)}
                  variant="ghost"
                  className="text-red-500 p-0 hover:text-red-600"
                  disabled={isLoading}
                >
                  <X size={20} />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isLoading}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
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
                    className="h-8 w-8 rounded-full"
                    disabled={isLoading}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
                <p className="font-medium">
                  <Currency value={Number(item.variant.price) * item.quantity} />
                </p>
              </div>
            </div>
          </div>
        </Card>
      ))}
      {!isPreview && (
        <Card className="p-6 mt-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <Currency value={total} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-500">Calculated at checkout</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Total</span>
              <Currency
                value={total}
                className="text-lg font-semibold"
              />
            </div>
          </div>
          <Button 
            className="w-full" 
            size="lg" 
            onClick={() => window.location.href = `/store/${params.domain}/checkout`}
            disabled={isLoading || items.length === 0}
          >
            Proceed to Checkout
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CartItems;
