"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CartItems from "../components/cart-items";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";
import { Loader } from "@/components/ui/loader";
import { Spinner } from "@/components/ui/spinner";

export default function CartPage() {
  const cart = useCart();
  const params = useParams();

  useEffect(() => {
    // Only fetch if not initialized and not loading
    if (!cart.isInitialized && !cart.isLoading) {
      cart.fetchCart();
    }
  }, [cart.isInitialized, cart.isLoading, cart.fetchCart]);

  if (cart.isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-sm text-gray-500">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no customer ID is set, user needs to sign in
  if (!cart.customerId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-6">You need to sign in to view your cart</p>
          <Button asChild>
            <Link href={`/store/${params.domain}/signin`}>Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <CartItems />
        </div>
        <div className="lg:col-span-5 mt-8 lg:mt-0">
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium">Order Summary</h2>
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <Currency value={cart.items.reduce((total, item) => total + (Number(item.variant.price) * item.quantity), 0)} />
              </div>
              <div className="flex justify-between mt-2">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <Currency 
                  value={cart.items.reduce((total, item) => total + (Number(item.variant.price) * item.quantity), 0)} 
                  className="font-semibold" 
                />
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = `/store/${params.domain}/checkout`}
              className="w-full"
              disabled={cart.isLoading || cart.items.length === 0}
              size="lg"
            >
              {cart.isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner size={20} />
                  <span>Loading...</span>
                </div>
              ) : (
                "Proceed to Checkout"
              )}
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Taxes and shipping calculated at checkout</p>
            <p className="mt-2">We accept all major credit cards and PayPal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
