'use client';

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/price-formatter";
import { CartItem } from "@/hooks/use-cart";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  emailDiscount: number;
  customerDiscount: number;
  couponDiscount: number;
  finalTotal: number;
}

export const OrderSummary = ({ 
  items, 
  subtotal,
  emailDiscount,
  customerDiscount,
  couponDiscount,
  finalTotal
}: OrderSummaryProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <Image
                src={item.variant.images?.[0]?.url || '/placeholder.png'}
                alt={item.variant.name}
                fill
                className="object-cover rounded"
                sizes="64px"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.variant.product.name}</p>
              <p className="text-sm text-muted-foreground">{item.variant.name}</p>
              <p className="text-sm">Quantity: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {formatPrice(item.variant.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {emailDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Email Signup Discount</span>
              <span>-{formatPrice(emailDiscount)}</span>
            </div>
          )}
          {customerDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Member Discount</span>
              <span>-{formatPrice(customerDiscount)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount</span>
              <span>-{formatPrice(couponDiscount)}</span>
            </div>
          )}
          {(emailDiscount > 0 || customerDiscount > 0 || couponDiscount > 0) && (
            <div className="flex justify-between text-sm text-gray-500 pt-2">
              <span>Total Savings</span>
              <span>-{formatPrice(emailDiscount + customerDiscount + couponDiscount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between pt-2 font-semibold">
            <span>Total</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
