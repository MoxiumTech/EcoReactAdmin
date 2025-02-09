import { NextResponse } from "next/server";
import { verifyAuth, isAdmin, isCustomer } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { TicketStatus } from "@prisma/client";

// GET /api/[storeId]/support-tickets - List tickets
export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await verifyAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as TicketStatus | null;

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    let whereClause: any = {
      storeId: params.storeId,
    };

    // If logged in as customer, only show their tickets
    if (isCustomer(session)) {
      whereClause.customerId = session.customerId;
    } else if (!isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (status) {
      whereClause.status = status;
    }

    const tickets = await prismadb.supportTicket.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.log('[TICKETS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST /api/[storeId]/support-tickets - Create ticket
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await verifyAuth();
    const body = await req.json();

    const { subject, message } = body;

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!subject) {
      return new NextResponse("Subject is required", { status: 400 });
    }

    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    // Only customers can create tickets
    if (!isCustomer(session)) {
      return new NextResponse("Only customers can create support tickets", { status: 403 });
    }

    const ticket = await prismadb.supportTicket.create({
      data: {
        subject,
        storeId: params.storeId,
        customerId: session.customerId,
        messages: {
          create: {
            message,
            senderId: session.customerId,
            senderType: "CUSTOMER"
          }
        }
      },
      include: {
        messages: true
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.log('[TICKET_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
