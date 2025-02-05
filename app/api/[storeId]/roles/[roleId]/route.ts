import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { getUserPermissions } from "@/lib/rbac-middleware";
import { Permissions } from "@/types/permissions";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; roleId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Check if user is store owner or has permission
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    const userPermissions = await getUserPermissions(session.userId, params.storeId);
    const canManageRoles = !!store || userPermissions.includes(Permissions.MANAGE_ROLES);

    if (!canManageRoles) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const role = await prismadb.role.findUnique({
      where: {
        id: params.roleId,
      },
      include: {
        permissions: true
      }
    });

    return NextResponse.json({
      id: role?.id,
      name: role?.name,
      description: role?.description,
      permissions: role?.permissions.map(p => p.name) || []
    });
  } catch (error) {
    console.error('[ROLE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; roleId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const body = await req.json();
    const { permissions } = body;

    if (!permissions || !Array.isArray(permissions)) {
      return new NextResponse("Invalid permissions", { status: 400 });
    }

    // Check if user is store owner or has permission
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    const userPermissions = await getUserPermissions(session.userId, params.storeId);
    const canManageRoles = !!store || userPermissions.includes(Permissions.MANAGE_ROLES);

    if (!canManageRoles) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Get all valid permission records
    const validPermissions = await prismadb.permission.findMany({
      where: {
        name: {
          in: permissions
        }
      }
    });

    // First disconnect all existing permissions
    await prismadb.role.update({
      where: {
        id: params.roleId,
      },
      data: {
        permissions: {
          disconnect: await prismadb.permission.findMany({
            where: {
              roles: {
                some: {
                  id: params.roleId
                }
              }
            },
            select: {
              id: true
            }
          })
        }
      }
    });

    // Then connect the new permissions
    await prismadb.role.update({
      where: {
        id: params.roleId,
      },
      data: {
        permissions: {
          connect: validPermissions.map(p => ({ id: p.id }))
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ROLE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; roleId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Check if user is store owner or has permission
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    const userPermissions = await getUserPermissions(session.userId, params.storeId);
    const canManageRoles = !!store || userPermissions.includes(Permissions.MANAGE_ROLES);

    if (!canManageRoles) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Check if role has any assignments
    const assignments = await prismadb.roleAssignment.findMany({
      where: {
        roleId: params.roleId
      }
    });

    if (assignments.length > 0) {
      return new NextResponse("Cannot delete role with active assignments", { status: 400 });
    }

    await prismadb.role.delete({
      where: {
        id: params.roleId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ROLE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
