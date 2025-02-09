import { NextResponse } from "next/server";
import { verifyAuth, isAdmin, isCustomer } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; ticketId: string } }
) {
  try {
    const session = await verifyAuth();
    const body = await req.json();

    const { message } = body;

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    const ticket = await prismadb.supportTicket.findUnique({
      where: {
        id: params.ticketId,
        storeId: params.storeId,
      }
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Check if user is authorized to send message
    if (isCustomer(session)) {
      // Customers can only send messages to their own tickets
      if (ticket.customerId !== session.customerId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
    } else if (!isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Create message
    const ticketMessage = await prismadb.ticketMessage.create({
      data: {
        message,
        ticketId: params.ticketId,
        senderId: isCustomer(session) ? session.customerId : session.userId,
        senderType: isCustomer(session) ? "CUSTOMER" : "STAFF"
      }
    });

    // If ticket is not in progress and staff replies, update status
    if (!isCustomer(session) && ticket.status === "OPEN") {
      await prismadb.supportTicket.update({
        where: {
          id: params.ticketId
        },
        data: {
          status: "IN_PROGRESS",
          assignedTo: session.userId
        }
      });
    }

    return NextResponse.json(ticketMessage);
  } catch (error) {
    console.log('[TICKET_MESSAGE_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; ticketId: string } }
) {
  try {
    const session = await verifyAuth();

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const ticket = await prismadb.supportTicket.findUnique({
      where: {
        id: params.ticketId,
        storeId: params.storeId,
      }
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Check if user is authorized to view messages
    if (isCustomer(session)) {
      if (ticket.customerId !== session.customerId) {
        return new NextResponse("Unauthorized", { status: 403 });
      }
    } else if (!isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 403 });
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
    console.log('[TICKET_MESSAGES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
