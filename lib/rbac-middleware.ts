import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prismadb from './prismadb';
import { getAdminSession } from './auth';

export async function withRBAC(
  handler: Function,
  requiredPermissions: string[],
) {
  return async (req: NextRequest, context: { params: { storeId: string } }) => {
    try {
      const session = await getAdminSession();
      
      if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      const { storeId } = context.params;
      
      // Get user's role assignments for this store
      const roleAssignments = await prismadb.roleAssignment.findMany({
        where: {
          userId: session.userId,
          storeId: storeId,
        },
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        }
      });

      // Collect all permissions from user's roles
      const userPermissions = new Set<string>();
      roleAssignments.forEach(assignment => {
        assignment.role.permissions.forEach(permission => {
          userPermissions.add(permission.name);
        });
      });

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.has(permission)
      );

      if (!hasAllPermissions) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      // If authorized, proceed with the handler
      return handler(req, context);
    } catch (error) {
      console.error('[RBAC Error]', error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  };
}

// Helper function to check permissions in API routes
export async function checkPermissions(
  userId: string,
  storeId: string,
  requiredPermissions: string[]
): Promise<boolean> {
  try {
    const roleAssignments = await prismadb.roleAssignment.findMany({
      where: {
        userId,
        storeId,
      },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });

    const userPermissions = new Set<string>();
    roleAssignments.forEach(assignment => {
      assignment.role.permissions.forEach(permission => {
        userPermissions.add(permission.name);
      });
    });

    return requiredPermissions.every(permission =>
      userPermissions.has(permission)
    );
  } catch (error) {
    console.error('[Permission Check Error]', error);
    return false;
  }
}

// Helper function to get all permissions for a user in a store
export async function getUserPermissions(
  userId: string,
  storeId: string
): Promise<string[]> {
  try {
    const roleAssignments = await prismadb.roleAssignment.findMany({
      where: {
        userId,
        storeId,
      },
      include: {
        role: {
          include: {
            permissions: true
          }
        }
      }
    });

    const permissions = new Set<string>();
    roleAssignments.forEach(assignment => {
      assignment.role.permissions.forEach(permission => {
        permissions.add(permission.name);
      });
    });

    return Array.from(permissions);
  } catch (error) {
    console.error('[Get Permissions Error]', error);
    return [];
  }
}
