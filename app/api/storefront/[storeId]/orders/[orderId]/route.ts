import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
        storeId: params.storeId,
        customer: {
          id: session.customerId
        },
        NOT: {
          status: "cart"
        }
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                images: true,
                product: {
                  select: {
                    name: true
                  }
                }
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
      return new NextResponse("Order not found", { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[ORDER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
