import { NextResponse } from "next/server";
import { verifyAuth, isAdmin } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

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
      },
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
            createdAt: 'asc'
          }
        }
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.log('[TICKET_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH - Update ticket status or assign to staff
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; ticketId: string } }
) {
  try {
    const session = await verifyAuth();
    const body = await req.json();

    const { status, assignedTo } = body;

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Only admin can update ticket status
    if (!isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === "CLOSED") {
        updateData.closedAt = new Date();
      }
    }

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    const ticket = await prismadb.supportTicket.update({
      where: {
        id: params.ticketId,
      },
      data: updateData,
      include: {
        messages: true
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.log('[TICKET_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
