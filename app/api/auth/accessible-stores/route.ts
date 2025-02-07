import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new NextResponse("Missing user ID", { status: 400 });
    }

    console.log('[ACCESSIBLE_STORES] Finding stores for user:', userId);

    // Get all accessible stores (owned and assigned) with details
    const stores = await prismadb.store.findMany({
      where: {
        OR: [
          { userId },
          {
            roleAssignments: {
              some: {
                userId
              }
            }
          }
        ]
      },
      include: {
        roleAssignments: {
          where: {
            userId
          },
          include: {
            role: true
          }
        }
      }
    });

    console.log('[ACCESSIBLE_STORES] Found stores:', {
      count: stores.length,
      storeIds: stores.map(s => s.id),
      details: stores.map(s => ({
        id: s.id,
        name: s.name,
        isOwner: s.userId === userId,
        roles: s.roleAssignments.map(ra => ra.role.name)
      }))
    });

    if (stores.length === 0) {
      return NextResponse.json({ stores: [], message: "No accessible stores found" }, { status: 404 });
    }

    return NextResponse.json({ 
      stores: stores.map(s => s.id),
      details: stores.map(s => ({
        id: s.id,
        name: s.name,
        isOwner: s.userId === userId,
        roles: s.roleAssignments.map(ra => ra.role.name)
      }))
    });
  } catch (error) {
    console.error('[ACCESSIBLE_STORES]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
