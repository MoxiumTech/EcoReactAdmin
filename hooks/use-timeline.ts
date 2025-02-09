import { useState, useCallback, useEffect, useRef } from 'react';
import { CreditCard, Package, Ban, CheckCircle, ShoppingCart, HistoryIcon } from 'lucide-react';
import type { 
  Order, 
  TimelineEvent, 
  StockMovement, 
  OrderStatus 
} from '@/app/(dashboard)/[storeId]/(routes)/orders/[orderId]/types';

interface UseTimelineProps {
  orderId: string;
  storeId: string;
  pollingInterval?: number;
}

export const useTimeline = ({ orderId, storeId, pollingInterval = 30000 }: UseTimelineProps) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout>();

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

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'reserved':
        return Package;
      case 'shipped':
        return CheckCircle;
      case 'unreserved':
        return Ban;
      default:
        return HistoryIcon;
    }
  };

  const fetchTimeline = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/${storeId}/orders/${orderId}`);

      if (!response.ok) {
        let errorMessage = 'Failed to fetch timeline data';
        try {
          const errorData = await response.json();
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse error JSON, use the generic message
        }
        throw new Error(errorMessage);
      }

      const order: Order = await response.json();
      console.log('Timeline Order Data:', {
        statusHistory: order.statusHistory,
        stockMovements: order.stockMovements
      });

      // Create timeline events from status history
      const timelineEvents: TimelineEvent[] = [];

      // Add status history events
      if (order.statusHistory) {
        timelineEvents.push(...order.statusHistory.map(history => ({
          id: `status-${history.id}`,
          date: history.createdAt,
          type: 'status_change' as const,
          title: `Order ${history.status.charAt(0).toUpperCase() + history.status.slice(1)}`,
          description: history.reason || getStatusDescription(history.status as OrderStatus),
          icon: getStatusIcon(history.status as OrderStatus)
        })));
      }

      // Add payment event
      timelineEvents.push({
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
        timelineEvents.push(...order.stockMovements.map(movement => {
          // Ensure originatorType is one of the valid types
          const originatorType = ['system', 'admin', 'customer'].includes(movement.originatorType || '')
            ? movement.originatorType as 'system' | 'admin' | 'customer'
            : 'system';

          return {
            id: movement.id,
            date: movement.createdAt,
            type: 'stock_movement' as const,
            title: movement.type === 'reserved' ? 'Stock Reserved' : 
                  movement.type === 'shipped' ? 'Items Shipped' : 
                  'Stock Released',
            description: movement.reason || null,
            icon: getMovementIcon(movement.type)
          };
        }));
      }

      timelineEvents.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setEvents(timelineEvents);
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message
        : 'Failed to fetch timeline data. Please try again.';
      setError(errorMessage);
      console.error('[TIMELINE_FETCH_ERROR]', error);
      setLoading(false);
    }
  }, [orderId, storeId]);

  useEffect(() => {
    fetchTimeline();
    
    if (pollingInterval) {
      pollingTimeoutRef.current = setInterval(fetchTimeline, pollingInterval);
      return () => {
        if (pollingTimeoutRef.current) {
          clearInterval(pollingTimeoutRef.current);
        }
      };
    }
  }, [fetchTimeline, pollingInterval]);

  return { events, loading, error, refresh: fetchTimeline };
};
