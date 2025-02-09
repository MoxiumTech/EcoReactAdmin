import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; ticketId: string } }
) {
  try {
    const body = await req.json();
    const { message, customerId } = body;

    if (!message || !customerId) {
      return new NextResponse("Message and customerId are required", { status: 400 });
    }

    const ticket = await prismadb.supportTicket.findUnique({
      where: {
        id: params.ticketId,
        storeId: params.storeId,
        customerId: customerId // Ensure customer owns this ticket
      }
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Create message
    const ticketMessage = await prismadb.ticketMessage.create({
      data: {
        message,
        ticketId: params.ticketId,
        senderId: customerId,
        senderType: "CUSTOMER"
      }
    });

    return NextResponse.json(ticketMessage);
  } catch (error) {
    console.error('[STOREFRONT_TICKET_MESSAGE_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; ticketId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return new NextResponse("CustomerId is required", { status: 400 });
    }

    const ticket = await prismadb.supportTicket.findUnique({
      where: {
        id: params.ticketId,
        storeId: params.storeId,
        customerId: customerId // Ensure customer owns this ticket
      }
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    const messages = await prismadb.ticketMessage.findMany({
      where: {
        ticketId: params.ticketId
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[STOREFRONT_TICKET_MESSAGES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
