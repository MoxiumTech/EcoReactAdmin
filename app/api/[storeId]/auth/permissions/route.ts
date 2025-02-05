import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Permissions } from "@/hooks/use-rbac";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user is store owner
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    // Get user's role assignments for this store
    const roleAssignments = await prismadb.roleAssignment.findMany({
      where: {
        userId: session.userId,
        storeId: params.storeId,
      },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });

    // Collect all unique permissions from all roles
    const permissions = new Set<string>();
    
    // If user is store owner, grant all permissions
    if (store) {
      Object.values(Permissions).forEach(permission => {
        permissions.add(permission);
      });
    } else {
      // Otherwise check role assignments
      roleAssignments.forEach(assignment => {
        assignment.role.permissions.forEach(permission => {
          permissions.add(permission.name);
        });
      });
    }

    return NextResponse.json({ permissions: Array.from(permissions) });
  } catch (error) {
    console.error('[PERMISSIONS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
