"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Check, X, Package } from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertModal } from "@/components/modals/alert-modal";
import { Timeline } from "./components/timeline";
import { ErrorState } from "./components/error-state";
import { SectionLoading } from "./components/section-loading";
import { Order, OrderStatus } from "./types";

interface OrderClientProps {
  initialOrder: Order;
}

/**
 * OrderClient component displays detailed information about a specific order
 * including order items, status, timeline, and allows for status updates.
 */
export default function OrderClient({ initialOrder }: OrderClientProps) {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [order, setOrder] = useState<Order>(initialOrder);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  /**
   * Updates the order status and handles associated stock movements
   */
  const onUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      setLoading(true);
      setStatusUpdateError(null);
      const response = await fetch(
        `/api/${params.storeId}/orders/${params.orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update status');
      }

      await fetchOrder();
      setShowCancelAlert(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update order status';
      setStatusUpdateError(message);
      console.error('[ORDER_STATUS_UPDATE_ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the current order data including items and stock movements
   */
  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/${params.storeId}/orders/${params.orderId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load order details';
      setError(message);
      console.error('[ORDER_FETCH_ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load order"
        description={error}
        onRetry={fetchOrder}
      />
    );
  }

  return (
    <>
      <AlertModal
        isOpen={showCancelAlert}
        onClose={() => setShowCancelAlert(false)}
        onConfirm={() => onUpdateStatus('cancelled')}
        loading={loading}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This will return items to stock and cannot be undone."
      />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={`Order #${order.id}`}
            description={`Placed on ${format(new Date(order.createdAt), 'MMMM d, yyyy')}`}
          />
          {(order.status === 'processing' || order.status === 'shipped') && (
            <div className="flex gap-4">
              {order.status === 'processing' && (
                <Button 
                  onClick={() => onUpdateStatus('shipped')}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mark as Shipped
                </Button>
              )}
              {order.status === 'shipped' && (
                <Button 
                  onClick={() => onUpdateStatus('completed')}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Complete Order
                </Button>
              )}
              <Button 
                variant="destructive"
                onClick={() => setShowCancelAlert(true)}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            </div>
          )}
        </div>
        {statusUpdateError && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
            {statusUpdateError}
          </div>
        )}
        <Separator />
        
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <SectionLoading loading={loading}>
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Order Details</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={order.status === 'cancelled' ? 'destructive' : 'default'}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment</span>
                      <Badge variant={order.isPaid ? "default" : "destructive"}>
                        {order.isPaid ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Shipping Details</h4>
                  <div className="mt-2 text-muted-foreground">
                    <p>{order.phone}</p>
                    <p>{order.address}</p>
                  </div>
                </div>
              </div>
            </Card>
          </SectionLoading>

          <SectionLoading loading={loading}>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.variant.images?.[0] && (
                      <div className="relative h-20 w-20">
                        <Image
                          src={item.variant.images[0].url}
                          alt={item.variant.product.name}
                          className="object-cover rounded-md"
                          fill
                          sizes="80px"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.variant.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.variant.name} x {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${order.totalAmount}</span>
                  </div>
                  {order.emailDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Email Discount</span>
                      <span>-${order.emailDiscount}</span>
                    </div>
                  )}
                  {order.customerDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Customer Discount</span>
                      <span>-${order.customerDiscount}</span>
                    </div>
                  )}
                  {order.couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount</span>
                      <span>-${order.couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>${order.finalAmount}</span>
                  </div>
                </div>
              </div>
            </Card>
          </SectionLoading>
        </div>

        <SectionLoading loading={loading}>
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Order Timeline</h3>
            <Timeline orderId={order.id} />
          </Card>
        </SectionLoading>
      </div>
    </>
  );
}
