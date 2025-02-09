import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get("variantId");
    const orderId = searchParams.get("orderId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    type WhereClause = {
      stockItem: {
        storeId: string;
      };
      variantId?: string | { in: string[] };
      reason?: { contains: string };
    };

    let whereClause: WhereClause = {
      stockItem: {
        storeId: params.storeId
      }
    };

    if (variantId) {
      whereClause.variantId = variantId;
    }

    if (orderId) {
      // First get the order's items to know which variants to look for
      const order = await prismadb.order.findUnique({
        where: {
          id: orderId,
          storeId: params.storeId
        },
        include: {
          orderItems: true
        }
      });

      if (!order) {
        return new NextResponse("Order not found", { status: 404 });
      }

      whereClause = {
        ...whereClause,
        variantId: {
          in: order.orderItems.map(item => item.variantId)
        },
        reason: {
          contains: `Order ${orderId}`
        }
      };
    }

    // Get total count for pagination
    const totalCount = await prismadb.stockMovement.count({
      where: whereClause
    });

    const stockMovements = await prismadb.stockMovement.findMany({
      where: whereClause,
      include: {
        variant: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        },
        stockItem: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    return NextResponse.json({
      items: stockMovements,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    console.log('[STOCK_MOVEMENTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      variantId, 
      quantity, 
      type, 
      reason 
    } = body;

    if (!variantId || !quantity || !type || !reason) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const stockItem = await prismadb.stockItem.findUnique({
      where: {
        variantId_storeId: {
          variantId,
          storeId: params.storeId
        }
      }
    });

    if (!stockItem) {
      return new NextResponse("Stock item not found", { status: 404 });
    }

    // Start transaction to ensure data consistency
    const result = await prismadb.$transaction(async (tx) => {
      // Create stock movement
      const movement = await tx.stockMovement.create({
        data: {
          variantId,
          stockItemId: stockItem.id,
          quantity,
          type,
          reason,
          originatorType: "admin",
          originatorId: session.userId
        }
      });

      // Update stock counts based on movement type
      let updateData: any = {};
      
      switch (type) {
        case "adjustment":
        case "purchase":
          updateData.count = {
            increment: quantity
          };
          break;
        case "sale":
        case "loss":
          updateData.count = {
            decrement: quantity
          };
          break;
        case "reserved":
          updateData.reserved = {
            increment: quantity
          };
          break;
        case "unreserved":
          updateData.reserved = {
            decrement: quantity
          };
          break;
      }

      // Update stock item
      const updatedStockItem = await tx.stockItem.update({
        where: {
          id: stockItem.id
        },
        data: updateData
      });

      return {
        movement,
        stockItem: updatedStockItem
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.log('[STOCK_MOVEMENTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
