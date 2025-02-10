'use client';

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Currency } from "@/components/ui/currency";
import type { CartItem } from "@/types/cart";
import { Badge } from "@/components/ui/badge";
import { Package, Tag } from "lucide-react";

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
  const params = useParams();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalDiscount = emailDiscount + customerDiscount + couponDiscount;
  const hasDiscounts = totalDiscount > 0;

  return (
    <Card className="bg-white/50 backdrop-blur-sm border shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <p className="text-sm text-muted-foreground">{totalItems} items</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            Free Shipping
          </div>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="group">
              <Link 
                href={`/store/${params.domain}/product/${item.variant.product.permalink || ""}`}
                className="flex items-start gap-4 group-hover:opacity-75 transition-opacity"
              >
                <div className="relative w-20 h-20">
                  <div className="relative w-full h-full overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.variant.images?.[0]?.url || '/placeholder.png'}
                      alt={item.variant.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="80px"
                    />
                  </div>
                  {item.quantity > 1 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full shadow-sm"
                    >
                      {item.quantity}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium line-clamp-2">
                    {item.variant.product.name}
                  </h3>
                  {item.variant.name && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.variant.name}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Price: </span>
                      <Currency value={item.variant.price} />
                    </p>
                    <p className="font-medium">
                      <Currency value={item.variant.price * item.quantity} />
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span><Currency value={subtotal} /></span>
          </div>
          {hasDiscounts && (
            <div className="space-y-1.5">
              {emailDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-600">
                    <Tag className="h-3.5 w-3.5" />
                    Email Signup Discount
                  </span>
                  <span className="text-green-600">-<Currency value={emailDiscount} /></span>
                </div>
              )}
              {customerDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-600">
                    <Tag className="h-3.5 w-3.5" />
                    Member Discount
                  </span>
                  <span className="text-green-600">-<Currency value={customerDiscount} /></span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-green-600">
                    <Tag className="h-3.5 w-3.5" />
                    Coupon Discount
                  </span>
                  <span className="text-green-600">-<Currency value={couponDiscount} /></span>
                </div>
              )}
            </div>
          )}
          {hasDiscounts && (
            <div className="flex justify-between text-sm pt-2">
              <span className="text-muted-foreground">Total Savings</span>
              <span className="text-green-600 font-medium">
                -<Currency value={totalDiscount} />
              </span>
            </div>
          )}
        </div>

        <Separator />
        
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-base font-medium">Total</span>
            {hasDiscounts && (
              <p className="text-sm text-muted-foreground">
                You saved <Currency value={totalDiscount} />
              </p>
            )}
          </div>
          <span className="text-2xl font-semibold">
            <Currency value={finalTotal} />
          </span>
        </div>
      </div>
    </Card>
  );
};
