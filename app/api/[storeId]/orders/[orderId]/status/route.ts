import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

type OrderStatus = 'cart' | 'processing' | 'shipped' | 'completed' | 'cancelled';

const validStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  cart: ['processing'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
} as const;

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status, reason } = await req.json();
    const { storeId, orderId } = params;

    if (!['processing', 'shipped', 'completed', 'cancelled'].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const order = await prismadb.order.findUnique({
      where: {
        id: orderId,
        storeId
      },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Validate status transition
    const currentStatus = order.status as OrderStatus;
    const allowedTransitions = validStatusTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(status as OrderStatus)) {
      return new NextResponse(`Invalid status transition from ${order.status} to ${status}`, { status: 400 });
    }

    const result = await prismadb.$transaction(async (tx) => {
      // Handle stock movements based on status change
      for (const item of order.orderItems) {
        const stockItem = await tx.stockItem.findUnique({
          where: {
            variantId_storeId: {
              variantId: item.variantId,
              storeId
            }
          }
        });

        if (!stockItem) {
          throw new Error(`Stock item not found for variant ${item.variantId}`);
        }

        // Handle stock movements based on status change
        if (status === "shipped") {
          // When shipping, just record the movement but keep stock reserved
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              stockItemId: stockItem.id,
              orderId,
              quantity: -item.quantity,
              type: "shipped",
              reason: `Order ${orderId} - Items shipped to customer`,
              originatorType: "admin",
              originatorId: session.userId
            }
          });
        } else if (status === "completed") {
          // On completion, remove from reserved and actual stock
          await tx.stockItem.update({
            where: { id: stockItem.id },
            data: {
              reserved: {
                decrement: item.quantity
              },
              count: {
                decrement: item.quantity
              }
            }
          });
        } else if (status === "cancelled") {
          // On cancellation, remove reservation and return to available stock
          await tx.stockItem.update({
            where: { id: stockItem.id },
            data: {
              reserved: {
                decrement: item.quantity
              }
            }
          });

          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              stockItemId: stockItem.id,
              orderId,
              quantity: item.quantity,
              type: "unreserved",
              reason: `Order ${orderId} - Cancelled and stock returned`,
              originatorType: "admin",
              originatorId: session.userId
            }
          });
        }
      }

      // Create status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          originatorId: session.userId,
          originatorType: 'admin',
          reason: reason || `Order status updated to ${status}`
        }
      });

      // Update order status
      const updatedOrder = await tx.order.update({
        where: {
          id: orderId
        },
        data: {
          status
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
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

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log('[ORDER_STATUS_UPDATE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
