import { NextResponse } from "next/server";
import { getAdminSession } from "./auth";
import prismadb from "./prismadb";
import { Permissions } from "@/types/permissions";

const PROTECTED_ROUTES = [
  {
    pattern: /\/api\/[^/]+\/roles/,
    permission: Permissions.MANAGE_ROLES
  },
  {
    pattern: /\/api\/[^/]+\/billboards/,
    permission: Permissions.MANAGE_BILLBOARDS
  },
  {
    pattern: /\/api\/[^/]+\/products/,
    permission: Permissions.CREATE_PRODUCTS
  },
  {
    pattern: /\/api\/[^/]+\/taxonomies/,
    permission: Permissions.MANAGE_TAXONOMIES
  },
  {
    pattern: /\/api\/[^/]+\/orders/,
    permission: Permissions.MANAGE_ORDERS
  },
  {
    pattern: /\/api\/[^/]+\/customers/,
    permission: Permissions.MANAGE_CUSTOMERS
  },
  {
    pattern: /\/api\/[^/]+\/brands/,
    permission: Permissions.MANAGE_BRANDS
  },
  {
    pattern: /\/api\/[^/]+\/layouts/,
    permission: Permissions.MANAGE_LAYOUTS
  },
  // Add more route patterns and their required permissions
];

export async function checkPermission(
  storeId: string, 
  userId: string, 
  requiredPermission: string
) {
  // First check if user is store owner
  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId: userId,
    },
  });

  if (store) {
    return true; // Store owners have all permissions
  }

  // Otherwise check role assignments
  const roleAssignments = await prismadb.roleAssignment.findMany({
    where: {
      userId: userId,
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

  return roleAssignments.some(assignment =>
    assignment.role.permissions.some(permission => 
      permission.name === requiredPermission
    )
  );
}

export async function withPermissionCheck(
  req: Request,
  storeId: string,
  requiredPermission: string
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hasPermission = await checkPermission(
      storeId,
      session.userId,
      requiredPermission
    );

    if (!hasPermission) {
      return new NextResponse(
        JSON.stringify({ error: "Insufficient permissions" }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return null; // Indicates permission check passed
  } catch (error) {
    console.error('[PERMISSION_CHECK]', error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export function getRequiredPermissionForRoute(path: string) {
  const route = PROTECTED_ROUTES.find(route => route.pattern.test(path));
  return route?.permission;
}
