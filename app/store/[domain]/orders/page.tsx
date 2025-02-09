"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Currency } from "@/components/ui/currency";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getCurrentCustomer } from "@/lib/get-customer";

interface Order {
  id: string;
  status: string;
  createdAt: string;
  phone: string;
  address: string;
  totalAmount: number;
  finalAmount: number;
  emailDiscount: number;
  customerDiscount: number;
  couponDiscount: number;
  orderItems: Array<{
    quantity: number;
    variant: {
      name: string;
      price: number;
      images: Array<{ url: string }>;
      product: {
        name: string;
      };
    };
  }>;
}

export default function OrdersPage() {
  const params = useParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        const customer = await getCurrentCustomer(params.domain as string);
        
        if (!customer) {
          toast.error("Please sign in to view your orders");
          router.push(`/store/${params.domain}/signin?redirect=/store/${params.domain}/orders`);
          return;
        }

        const origin = window.location.origin;
        const response = await fetch(`${origin}/api/storefront/${customer.storeId}/orders`, {
          credentials: 'include'
        });

        if (response.status === 401) {
          document.cookie = "customer_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
          router.push(`/store/${params.domain}/signin?redirect=/store/${params.domain}/orders`);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
        setIsError(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setIsError(true);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [params.domain, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">Loading orders...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500">Failed to load orders</div>
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

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground mb-4">You haven&apos;t placed any orders yet</p>
        <Link href={`/store/${params.domain}`}>
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Order #{order.id}</h3>
                <p className="text-sm text-muted-foreground">
                  Placed on {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">Status: {order.status}</p>
              </div>
              <Link href={`/store/${params.domain}/orders/${order.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {order.orderItems.map((item) => (
                <div key={`${order.id}-${item.variant.name}`} className="flex gap-4">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden">
                    <Image
                      fill
                      src={item.variant.images[0]?.url || "/placeholder.png"}
                      alt={item.variant.product.name}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.variant.product.name}</p>
                    <p className="text-sm text-muted-foreground">{item.variant.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {order.orderItems.reduce((total, item) => total + item.quantity, 0)} items
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg font-semibold">
                  <Currency value={order.finalAmount} />
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
