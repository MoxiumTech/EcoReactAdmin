interface OrderItem {
  id: string;
  orderId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

export interface RawOrder {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  createdAt: Date;
  orderItems: OrderItem[];
}

export interface OrderWithDetails extends RawOrder {
  orderItems: (OrderItem & { product: Product })[];
}
