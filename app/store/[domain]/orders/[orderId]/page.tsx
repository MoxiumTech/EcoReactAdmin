"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Currency } from "@/components/ui/currency";
import Image from "next/image";
import { getCurrentCustomer } from "@/lib/get-customer";

import type { Order } from "@/app/(dashboard)/[storeId]/(routes)/orders/[orderId]/types";
import { OrderTimeline } from "../../components/order-timeline";
import { useOrderTimeline } from "@/hooks/use-order-timeline";
import { StatusBadge } from "../../components/status-badge";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const timeline = useOrderTimeline(order || {} as Order);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!params.orderId) {
        setIsError(true);
        return;
      }

      try {
        setIsLoading(true);
        const customer = await getCurrentCustomer(params.domain as string);
        
        if (!customer) {
          toast.error("Please sign in to view order details");
          router.push(`/store/${params.domain}/signin?redirect=/store/${params.domain}/orders/${params.orderId}`);
          return;
        }

        const origin = window.location.origin;
        const response = await fetch(
          `${origin}/api/storefront/${customer.storeId}/orders/${params.orderId}`,
          {
            credentials: 'include'
          }
        );

        if (response.status === 401) {
          document.cookie = "customer_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          router.push(`/store/${params.domain}/signin?redirect=/store/${params.domain}/orders/${params.orderId}`);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();
        setOrder(data);
        setIsError(false);
      } catch (error) {
        console.error("Error fetching order:", error);
        setIsError(true);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [params.domain, params.orderId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Loading order details...</div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500">Failed to load order details</div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push(`/store/${params.domain}/orders`)}
        >
          Return to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/store/${params.domain}/orders`}>
          <Button variant="ghost" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.variant.name} className="flex gap-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden">
                  <Image
                    fill
                    src={item.variant.images[0]?.url || "/placeholder.png"}
                    alt={item.variant.product.name}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.variant.product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.variant.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </div>
                </div>
                <div className="font-medium">
                  <Currency value={item.price} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span><Currency value={order.totalAmount} /></span>
            </div>
            {order.emailDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Email Discount</span>
                <span>-<Currency value={order.emailDiscount} /></span>
              </div>
            )}
            {order.customerDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Customer Discount</span>
                <span>-<Currency value={order.customerDiscount} /></span>
              </div>
            )}
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon Discount</span>
                <span>-<Currency value={order.couponDiscount} /></span>
              </div>
            )}
            <div className="flex justify-between font-medium text-lg border-t pt-2">
              <span>Total</span>
              <span><Currency value={order.finalAmount} /></span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>{order.phone}</p>
            <p>{order.address}</p>
          </div>
        </div>
      </Card>

      <OrderTimeline
        events={timeline.events}
        className="mb-8"
      />

      <div className="flex justify-center">
        <Link href={`/store/${params.domain}`}>
          <Button className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
