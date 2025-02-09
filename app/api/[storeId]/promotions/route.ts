import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { randomBytes } from "crypto";

const generateCouponCode = () => {
  return randomBytes(4).toString('hex').toUpperCase();
};

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
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

    // For coupon type, handle code generation and uniqueness
    if (type === "coupon") {
      if (!body.code) {
        // Generate a unique code
        let code: string;
        let isUnique = false;
        while (!isUnique) {
          code = generateCouponCode();
          const existingPromotion = await prismadb.promotion.findFirst({
            where: {
              storeId: params.storeId,
              code: code
            }
          });
          if (!existingPromotion) {
            isUnique = true;
            body.code = code;
          }
        }
      } else {
        // Check if provided code is unique
        const existingPromotion = await prismadb.promotion.findFirst({
          where: {
            storeId: params.storeId,
            code: body.code
          }
        });
        if (existingPromotion) {
          return new NextResponse("Coupon code already exists", { status: 400 });
        }
      }
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: params.storeId
      }
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
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

    const promotion = await prismadb.promotion.create({
      data: {
        name,
        type,
        code,
        discount,
        isFixed,
        minAmount,
        maxAmount,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        storeId: params.storeId,
        customers: type === "email" ? {
          connect: {
            id: body.customerId
          }
        } : undefined
      }
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.log('[PROMOTIONS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const promotions = await prismadb.promotion.findMany({
      where: {
        storeId: params.storeId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.log('[PROMOTIONS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
