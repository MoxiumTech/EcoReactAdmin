import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return new NextResponse("CustomerId is required", { status: 400 });
    }

    const tickets = await prismadb.supportTicket.findMany({
      where: {
        storeId: params.storeId,
        customerId
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('[STOREFRONT_SUPPORT_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const body = await req.json();
    const { subject, customerId } = body;

    if (!storeId || !subject || !customerId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if customer exists
    const customer = await prismadb.customer.findUnique({
      where: {
        id: customerId
      }
    });

    if (!customer) {
      return new NextResponse("Customer not found", { status: 404 });
    }

    // Create support ticket
    const ticket = await prismadb.supportTicket.create({
      data: {
        storeId,
        customerId,
        subject,
        status: "OPEN",
        priority: "MEDIUM"
      },
      include: {
        messages: true
      }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('[STOREFRONT_SUPPORT_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
