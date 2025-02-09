import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getCustomerSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId;
    const session = await getCustomerSession();

    if (!session?.customerId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

    if (!customer) {
      return new NextResponse("Customer not found", { status: 404 });
    }

    // Group promotions by type
    const promotions = {
      email: customer.promotions.filter(p => p.type === 'email'),
      coupon: customer.promotions.filter(p => p.type === 'coupon'),
      customer: customer.promotions.filter(p => p.type === 'customer')
    };

    // Calculate discounts
    const emailDiscount = promotions.email.length > 0
      ? Math.max(...promotions.email.map(p => Number(p.discount)))
      : 0;

    const customerDiscount = promotions.customer.length > 0
      ? Math.max(...promotions.customer.map(p => Number(p.discount)))
      : 0;

    return NextResponse.json({
      promotions,
      discounts: {
        email: emailDiscount,
        customer: customerDiscount
      }
    });

  } catch (error) {
    console.error('[GET_PROMOTIONS_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
