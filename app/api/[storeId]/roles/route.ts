import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { getUserPermissions } from "@/lib/rbac-middleware";
import { Permissions } from "@/hooks/use-rbac";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const body = await req.json();
    const { name, description, permissionNames } = body;

    if (!name || !description || !Array.isArray(permissionNames)) {
      return new NextResponse("Invalid body", { status: 400 });
    }

    if (permissionNames.length === 0) {
      return new NextResponse("At least one permission is required", { status: 400 });
    }

    // Check if user is store owner or has role management permission
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

    // Check if role name already exists for this store
    const existingRole = await prismadb.role.findFirst({
      where: {
        name,
        storeId: params.storeId
      }
    });

    if (existingRole) {
      return new NextResponse("Role name already exists", { status: 400 });
    }

    // Get valid permissions
    const validPermissions = await prismadb.permission.findMany({
      where: {
        name: {
          in: permissionNames
        }
      }
    });

    if (validPermissions.length !== permissionNames.length) {
      return new NextResponse("Invalid permissions specified", { status: 400 });
    }

    // Create role with permissions in a transaction
    const role = await prismadb.$transaction(async (tx) => {
      const newRole = await tx.role.create({
        data: {
          name,
          description,
          storeId: params.storeId,
          permissions: {
            connect: validPermissions.map(p => ({ id: p.id }))
          }
        },
        include: {
          permissions: true
        }
      });

      return newRole;
    });

    return NextResponse.json({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.name),
      storeId: role.storeId,
      createdAt: role.createdAt
    });
  } catch (error) {
    console.error('[ROLES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    // Check store access
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    const userPermissions = await getUserPermissions(session.userId, params.storeId);
    const canViewRoles = !!store || userPermissions.includes(Permissions.VIEW_ROLES);

    if (!canViewRoles) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const roles = await prismadb.role.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        permissions: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(
      roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(p => p.name),
        storeId: role.storeId,
        createdAt: role.createdAt
      }))
    );
  } catch (error) {
    console.error('[ROLES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
