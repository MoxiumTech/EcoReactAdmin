import { LucideIcon } from "lucide-react";

export type OrderStatus = 'cart' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export type StockMovementType = 'reserved' | 'shipped' | 'unreserved';

export interface StockMovement {
  id: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  originatorType: 'system' | 'admin' | 'customer' | null;
  originatorId: string | null;
  orderId: string | null;
  stockItemId: string;
  variantId: string;
}

export interface OrderItem {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  variant: {
    name: string;
    images: Array<{ url: string }>;
    product: {
      name: string;
    };
  };
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: 'status_change' | 'stock_movement' | 'payment';
  title: string;
  description: string | null;
  icon: LucideIcon;
}

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discountPercentage: number;
}

export interface OrderPromotion {
  id: string;
  orderId: string;
  promotionId: string;
  promotion: Promotion;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
  originatorId?: string | null;
  originatorType: string;
}

export interface Order {
  id: string;
  status: OrderStatus;
  isPaid: boolean;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  finalAmount: number;
  emailDiscount: number;
  customerDiscount: number;
  couponDiscount: number;
  orderItems: OrderItem[];
  customer?: {
    name: string;
    email: string;
  };
  promotions?: Promotion[];
  orderPromotions?: OrderPromotion[];
  statusHistory?: OrderStatusHistory[];
  stockMovements?: StockMovement[];
}
