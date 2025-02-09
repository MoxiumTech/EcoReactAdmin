import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import OrderClient from "./order-client";
import { Order, OrderStatus } from "./types";

interface OrderPageProps {
  params: {
    storeId: string;
    orderId: string;
  };
}

/**
 * Validates and converts a string status to OrderStatus type
 */
const validateOrderStatus = (status: string): OrderStatus => {
  if (['cart', 'processing', 'completed', 'cancelled'].includes(status)) {
    return status as OrderStatus;
  }
  return 'processing'; // Default fallback
};

/**
 * Server component that fetches initial order data and renders the client component
 */
export default async function OrderPage({ params }: OrderPageProps) {
  const order = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
      storeId: params.storeId
    },
    include: {
      orderItems: {
        include: {
          variant: {
            include: {
              images: true,
              product: true
            }
          }
        }
      },
      statusHistory: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      stockMovements: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  const formattedOrder: Order = {
    id: order.id,
    status: validateOrderStatus(order.status),
    isPaid: order.isPaid,
    phone: order.phone || "",
    address: order.address || "",
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    totalAmount: Number(order.totalAmount),
    finalAmount: Number(order.finalAmount),
    emailDiscount: Number(order.emailDiscount || 0),
    customerDiscount: Number(order.customerDiscount || 0),
    couponDiscount: Number(order.couponDiscount || 0),
    orderItems: order.orderItems.map(item => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price: Number(item.price),
      variant: {
        name: item.variant.name,
        images: item.variant.images,
        product: {
          name: item.variant.product.name
        }
      }
    })),
    statusHistory: order.statusHistory.map(history => ({
      ...history,
      createdAt: history.createdAt.toISOString(),
      updatedAt: history.updatedAt.toISOString()
    })),
    stockMovements: order.stockMovements.map(movement => {
      // Ensure originatorType is one of the valid types
      const originatorType = ['system', 'admin', 'customer'].includes(movement.originatorType || '')
        ? movement.originatorType as 'system' | 'admin' | 'customer'
        : 'system';

      return {
        ...movement,
        type: movement.type as 'reserved' | 'shipped' | 'unreserved',
        originatorType,
        createdAt: movement.createdAt.toISOString(),
        updatedAt: movement.updatedAt.toISOString()
      };
    })
  };

  return <OrderClient initialOrder={formattedOrder} />;
}
