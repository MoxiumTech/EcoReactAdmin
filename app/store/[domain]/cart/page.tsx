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
import { Breadcrumb } from "../components/breadcrumb";
import { ArrowRight } from "lucide-react";

export default function CartPage() {
  const cart = useCart();
  const params = useParams();

  const { isInitialized, isLoading, fetchCart } = cart;
  
  useEffect(() => {
    // Only fetch if not initialized and not loading
    if (!isInitialized && !isLoading) {
      fetchCart();
    }
  }, [isInitialized, isLoading, fetchCart]);

  if (cart.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner className="text-primary" size={40} />
              <p className="mt-4 text-sm text-gray-500">Loading your cart...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no customer ID is set, user needs to sign in
  if (!cart.customerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
            <p className="text-muted-foreground mb-8">Sign in to view your cart and continue shopping</p>
            <Button asChild size="lg" className="w-full max-w-sm">
              <Link href={`/store/${params.domain}/signin`} className="flex items-center justify-center gap-2">
                Sign In
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    {
      label: "Shopping Cart",
      href: `/store/${params.domain}/cart`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <h1 className="text-3xl font-bold mt-6 mb-8">Shopping Cart</h1>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-7">
            <CartItems />
          </div>
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 space-y-6 border shadow-sm">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <Currency value={cart.items.reduce((total, item) => total + (Number(item.variant.price) * item.quantity), 0)} className="text-lg" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-500 italic">Calculated at checkout</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total</span>
                    <Currency 
                      value={cart.items.reduce((total, item) => total + (Number(item.variant.price) * item.quantity), 0)} 
                      className="text-2xl font-semibold" 
                    />
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = `/store/${params.domain}/checkout`}
                className="w-full py-6 text-lg font-medium transition-all duration-200 hover:shadow-lg"
                disabled={cart.isLoading || cart.items.length === 0}
                size="lg"
              >
                {cart.isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size={20} />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </div>
                )}
              </Button>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <span>Secure checkout powered by</span>
                  <span className="font-medium text-gray-900">Stripe</span>
                </div>
                <p className="text-xs text-center text-gray-500">
                  Taxes and shipping will be calculated at checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
