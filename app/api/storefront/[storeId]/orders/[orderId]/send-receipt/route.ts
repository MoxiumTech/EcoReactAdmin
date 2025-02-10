import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { sendOrderConfirmationEmail } from "@/lib/mail";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; orderId: string } }
) {
  try {
    const session = await getCustomerSession();
    const { storeId, orderId } = params;

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get order with all necessary details for the email
    const order = await prismadb.order.findFirst({
      where: {
        id: orderId,
        storeId,
        customerId: session.customerId,
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
        customer: true
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Send the confirmation email
    await sendOrderConfirmationEmail(order);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SEND_RECEIPT_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
