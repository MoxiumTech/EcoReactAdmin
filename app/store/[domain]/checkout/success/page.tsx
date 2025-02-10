"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/ui/currency";
import Image from "next/image";
import { getCurrentCustomer } from "@/lib/get-customer";
import { OrderTimeline } from "../../components/order-timeline";
import { useOrderTimeline } from "@/hooks/use-order-timeline";
import type { Order } from "@/app/(dashboard)/[storeId]/(routes)/orders/[orderId]/types";

export default function CheckoutSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const orderId = searchParams.get("orderId");
  const timeline = useOrderTimeline(order || {} as Order);

  useEffect(() => {
    const handleOrder = async () => {
      try {
        setIsLoading(true);
        const customer = await getCurrentCustomer(params.domain as string);

        if (!customer) {
          toast.error("Please sign in to view order details");
          router.push(`/store/${params.domain}/signin`);
          return;
        }

        const tempId = searchParams.get("temp_id");
        const sessionId = searchParams.get("session_id");
        const existingOrderId = searchParams.get("orderId");

        // For online payments
        if (tempId && sessionId) {
          // Verify payment status
          const paymentResponse = await fetch(
            `/api/storefront/${customer.storeId}/payment?session_id=${sessionId}`
          );

          if (!paymentResponse.ok) {
            throw new Error("Failed to verify payment");
          }

          const paymentData = await paymentResponse.json();
          
          if (!paymentData.success) {
            toast.error("Payment failed. Please try again.");
            router.push(`/store/${params.domain}/checkout?error=payment_failed`);
            return;
          }

          // Get pending order data
          const pendingOrderData = JSON.parse(sessionStorage.getItem('pendingOrderData') || '{}');
          
          // Create the actual order now that payment is confirmed
          const orderResponse = await axios.post(`/api/storefront/${customer.storeId}/checkout`, {
            ...pendingOrderData,
            isPaid: true,
            status: 'processing'
          });

          const orderData = orderResponse.data;
          setOrder(orderData);

          try {
            // Send order confirmation email for online payments
            await axios.post(`/api/storefront/${customer.storeId}/orders/${orderData.id}/send-receipt`);
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't show error to user as order was successful
          }

          sessionStorage.removeItem('pendingOrderData');
          return;
        }

        // For cash on delivery orders or viewing existing orders
        if (existingOrderId) {
          const orderResponse = await fetch(
            `/api/storefront/${customer.storeId}/orders/${existingOrderId}`,
            { credentials: 'include' }
          );

          if (!orderResponse.ok) {
            throw new Error("Failed to fetch order");
          }

          const data = await orderResponse.json();
          setOrder(data);
          return;
        }

          // Final fallback - try to fetch regular order
          const response = await fetch(
            `/api/storefront/${customer.storeId}/orders/${orderId}`,
            { credentials: 'include' }
          );

          if (!response.ok) {
            if (response.status === 401) {
              document.cookie = "customer_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
              router.push(`/store/${params.domain}/signin?redirect=/store/${params.domain}/checkout/success?orderId=${orderId}`);
              return;
            }
            throw new Error("Failed to fetch order");
          }

          const data = await response.json();
          if (!data) {
            throw new Error("No order found");
          }

          setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
        setIsError(true);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    handleOrder();
  }, [orderId, params.domain, router]);

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
          onClick={() => router.push(`/store/${params.domain}`)}
        >
          Return to Store
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">Order Confirmed!</h1>
        <p className="text-muted-foreground mt-2">
          Order #{orderId}
        </p>
      </div>

      <OrderTimeline
        events={timeline.events}
        className="mb-8"
      />

      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div key={item.variant.name} className="flex gap-4">
                <div className="relative h-24 w-24 rounded-md overflow-hidden">
                  <Image
                    fill
                    src={item.variant?.images?.[0]?.url || "/placeholder.png"}
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

      <div className="flex justify-center gap-4">
        <Link href={`/store/${params.domain}`}>
          <Button>
            Continue Shopping
          </Button>
        </Link>
        <Link href={`/store/${params.domain}/orders`}>
          <Button variant="outline">
            View Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}
