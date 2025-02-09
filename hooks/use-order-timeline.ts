import { CreditCard, Package, Ban, CheckCircle, ShoppingCart } from "lucide-react";
import type { 
  Order, 
  OrderStatus, 
  StockMovement, 
  TimelineEvent 
} from "@/app/(dashboard)/[storeId]/(routes)/orders/[orderId]/types";

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'cancelled':
      return Ban;
    case 'processing':
      return Package;
    default:
      return ShoppingCart;
  }
};

const getMovementIcon = (type: StockMovement['type']) => {
  switch (type) {
    case 'reserved':
      return Package;
    case 'shipped':
      return CheckCircle;
    case 'unreserved':
      return Ban;
    default:
      return ShoppingCart;
  }
};

const getStatusDescription = (status: OrderStatus): string => {
  switch (status) {
    case 'completed':
      return 'Order has been completed and delivered';
    case 'cancelled':
      return 'Order has been cancelled';
    case 'processing':
      return 'Order is being processed';
    default:
      return 'Order has been placed';
  }
};

export const useOrderTimeline = (order: Order | null) => {
  if (!order) {
    return { events: [] };
  }

  const events: TimelineEvent[] = [];

  // Add status history events
  if (order.statusHistory) {
    events.push(...order.statusHistory.map(history => ({
      id: `status-${history.id}`,
      date: history.createdAt,
      type: 'status_change' as const,
      title: `Order ${history.status.charAt(0).toUpperCase() + history.status.slice(1)}`,
      description: history.reason || getStatusDescription(history.status as OrderStatus),
      icon: getStatusIcon(history.status as OrderStatus)
    })));
  }

  // Add payment event
  events.push({
    id: `payment-${order.id}`,
    date: order.createdAt,
    type: 'payment' as const,
    title: order.isPaid ? 'Payment Successful' : 'Payment Pending',
    description: order.isPaid 
      ? `Payment of $${order.finalAmount} received`
      : 'Awaiting payment confirmation',
    icon: CreditCard
  });

  // Add stock movement events
  if (order.stockMovements) {
    events.push(...order.stockMovements.map(movement => ({
      id: movement.id,
      date: movement.createdAt,
      type: 'stock_movement' as const,
      title: movement.type === 'reserved' ? 'Stock Reserved' : 
             movement.type === 'shipped' ? 'Items Shipped' : 
             'Stock Released',
      description: movement.reason,
      icon: getMovementIcon(movement.type)
    })));
  }

  // Sort events by date, most recent first
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { events };
};
