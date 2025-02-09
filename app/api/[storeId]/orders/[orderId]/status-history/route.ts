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

    // Check if order exists and belongs to store
    const order = await prismadb.order.findUnique({
      where: {
        id: orderId,
        storeId
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const statusHistory = await prismadb.orderStatusHistory.findMany({
      where: {
        orderId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(statusHistory);
  } catch (error) {
    console.log('[ORDER_STATUS_HISTORY]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
