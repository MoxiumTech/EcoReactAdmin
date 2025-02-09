import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { randomBytes } from "crypto";

const generateCouponCode = () => {
  return randomBytes(4).toString('hex').toUpperCase();
};

export async function GET(
  req: Request,
  { params }: { params: { promotionId: string, storeId: string } }
) {
  try {
    const promotion = await prismadb.promotion.findUnique({
      include: {
        customers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      where: {
        id: params.promotionId
      }
    });
  
    return NextResponse.json(promotion);
  } catch (error) {
    console.log('[PROMOTION_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { promotionId: string, storeId: string } }
) {
  try {
    const body = await req.json();
    const {
      name,
      type,
      code,
      discount,
      isFixed,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      isActive
    } = body;

    // Basic validation
    if (!name || !type || !discount === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Additional validation for email type
    if (type === "email" && !body.customerId) {
      return new NextResponse("Customer ID is required for email-based promotions", { status: 400 });
    }

    // For coupon type, handle code updates and uniqueness
    let finalCode = code;
    if (type === "coupon") {
      if (code) {
        // Check if provided code is unique (excluding current promotion)
        const existingPromotion = await prismadb.promotion.findFirst({
          where: {
            storeId: params.storeId,
            code: code,
            NOT: {
              id: params.promotionId
            }
          }
        });
        if (existingPromotion) {
          return new NextResponse("Coupon code already exists", { status: 400 });
        }
      } else {
        // Generate a unique code if none provided
        let newCode: string;
        let isUnique = false;
        while (!isUnique) {
          newCode = generateCouponCode();
          const existingPromotion = await prismadb.promotion.findFirst({
            where: {
              storeId: params.storeId,
              code: newCode
            }
          });
          if (!existingPromotion) {
            isUnique = true;
            finalCode = newCode;
          }
        }
      }
    }

    // For email type, verify customer exists and belongs to store
    if (type === "email") {
      const customer = await prismadb.customer.findFirst({
        where: {
          id: body.customerId,
          storeId: params.storeId
        }
      });

      if (!customer) {
        return new NextResponse("Customer not found or doesn't belong to this store", { status: 400 });
      }
    }

    // First, disconnect all existing customer connections
    await prismadb.promotion.update({
      where: {
        id: params.promotionId,
      },
      data: {
        customers: {
          set: [] // Clear existing connections
        }
      }
    });

    // Then update the promotion with new data
    const promotion = await prismadb.promotion.update({
      where: {
        id: params.promotionId
      },
      data: {
        name,
        type,
        code: finalCode,
        discount,
        isFixed,
        minAmount,
        maxAmount,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        customers: type === "email" ? {
          connect: {
            id: body.customerId
          }
        } : undefined
      }
    });
  
    return NextResponse.json(promotion);
  } catch (error) {
    console.log('[PROMOTION_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { promotionId: string, storeId: string } }
) {
  try {
    if (!params.promotionId) {
      return new NextResponse("Promotion id is required", { status: 400 });
    }

    const promotion = await prismadb.promotion.deleteMany({
      where: {
        id: params.promotionId,
        storeId: params.storeId
      }
    });
  
    return NextResponse.json(promotion);
  } catch (error) {
    console.log('[PROMOTION_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
