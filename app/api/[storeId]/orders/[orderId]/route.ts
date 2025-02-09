import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { storeId, orderId } = params;

    const order = await prismadb.order.findUnique({
      where: {
        id: orderId,
        storeId,
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: true,
                images: true
              }
            }
          }
        },
        customer: {
          select: {
            name: true,
            email: true
          }
        },
        promotions: true,
        orderPromotions: true,
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
    console.log('[ORDER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
