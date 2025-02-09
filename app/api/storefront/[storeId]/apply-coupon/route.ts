import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getCustomerSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { code } = await req.json();
    const storeId = params.storeId;

    if (!code) {
      return new NextResponse("Missing coupon code", { status: 400 });
    }

    // Validate coupon exists and is active
    const coupon = await prismadb.promotion.findFirst({
      where: {
        code,
        type: 'coupon',  // Only get coupon-type promotions
        storeId,
        isActive: true,
        startDate: {
          lte: new Date()
        },
        endDate: {
          gte: new Date()
        }
      }
    });

    if (!coupon) {
      return new NextResponse("Invalid or expired coupon code", { status: 400 });
    }

    // Get customer discounts
    const session = await getCustomerSession();
    let emailDiscount = 0;
    let customerDiscount = 0;

    if (session?.customerId) {
      const customer = await prismadb.customer.findUnique({
        where: { id: session.customerId },
        include: {
          promotions: {
            where: {
              storeId,
              isActive: true,
              startDate: {
                lte: new Date()
              },
              endDate: {
                gte: new Date()
              }
            }
          }
        }
      });

      if (customer?.promotions) {
        // Get email signup discount
        const emailPromotions = customer.promotions.filter(p => p.type === 'email');
        if (emailPromotions.length > 0) {
          emailDiscount = Math.max(...emailPromotions.map(p => Number(p.discount)));
        }

        // Get customer/member discount
        const memberPromotions = customer.promotions.filter(p => p.type === 'customer');
        if (memberPromotions.length > 0) {
          customerDiscount = Math.max(...memberPromotions.map(p => Number(p.discount)));
        }
      }
    }

    // Return all applicable discounts
    return NextResponse.json({
      emailDiscount,
      customerDiscount,
      couponDiscount: Number(coupon.discount)
    });

  } catch (error) {
    console.error('[APPLY_COUPON_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
