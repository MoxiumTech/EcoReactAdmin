import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Create store
    const store = await prismadb.store.create({
      data: {
        name,
        userId: session.userId,
      }
    });

    // Get super admin role
    const superAdminRole = await prismadb.role.findFirst({
      where: { name: "Super Admin" }
    });

    if (!superAdminRole) {
      return new NextResponse("System not properly initialized", { status: 500 });
    }

    // Assign super admin role to user in this store
    await prismadb.roleAssignment.create({
      data: {
        userId: session.userId,
        roleId: superAdminRole.id,
        storeId: store.id,
      }
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error('[STORES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
