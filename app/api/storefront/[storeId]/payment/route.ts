import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { 
      orderData,
      successUrl,
      cancelUrl
    } = body;

    if (!orderData || !successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: params.storeId,
      }
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Create payment session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [{
        price_data: {
          currency: (store.currency?.toLowerCase() as 'usd' | 'eur' | 'gbp') || 'usd',
          product_data: {
            name: `Order #${orderData.id}`,
          },
          unit_amount: Math.round(orderData.finalAmount * 100),
        },
        quantity: 1,
      }],
      metadata: {
        orderId: orderData.id,
        storeId: params.storeId
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('[PAYMENT_ERROR]', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // If payment was successful, return the order ID from metadata
    if (session.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        orderId: session.metadata?.orderId
      });
    }

    return NextResponse.json({
      success: false,
      message: `Payment status: ${session.payment_status}`
    });

  } catch (error) {
    console.error('[PAYMENT_STATUS_ERROR]', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
