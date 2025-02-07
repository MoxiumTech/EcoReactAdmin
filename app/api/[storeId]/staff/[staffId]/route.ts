import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { checkPermissions } from "@/lib/rbac-middleware";
import { Permissions } from "@/types/permissions";

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; staffId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has permission to manage roles
    const hasPermission = await checkPermissions(
      session.userId,
      params.storeId,
      [Permissions.MANAGE_ROLES]
    );

    if (!hasPermission) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get the role assignment to see if it exists and get user details
    const roleAssignment = await prismadb.roleAssignment.findUnique({
      where: {
        id: params.staffId
      },
      include: {
        user: true,
      }
    });

    if (!roleAssignment) {
      return new NextResponse("Staff member not found", { status: 404 });
    }

    // Check if user is trying to remove themselves
    if (roleAssignment.userId === session.userId) {
      return new NextResponse("Cannot remove yourself from staff", { status: 400 });
    }

    // Delete the role assignment
    await prismadb.roleAssignment.delete({
      where: {
        id: params.staffId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[STAFF_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; staffId: string } }
) {
  try {
    const session = await getAdminSession();
    const body = await req.json();
    const { roleId } = body;

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!roleId) {
      return new NextResponse("Role ID is required", { status: 400 });
    }

    // Check if user has permission to manage roles
    const hasPermission = await checkPermissions(
      session.userId,
      params.storeId,
      [Permissions.MANAGE_ROLES]
    );

    if (!hasPermission) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the role assignment
    const updatedAssignment = await prismadb.roleAssignment.update({
      where: {
        id: params.staffId,
      },
      data: {
        roleId
      },
      include: {
        user: true,
        role: true
      }
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error('[STAFF_UPDATE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
