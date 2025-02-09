import { NextRequest, NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const orders = await prismadb.order.findMany({
      where: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[ORDERS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
