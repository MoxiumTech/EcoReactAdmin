import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { Permissions } from "@/types/permissions";

// Cache store owners in memory to reduce DB queries
const storeOwnerCache: { [key: string]: { userId: string; timestamp: number; } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized access" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check cache first for store owner
    const cachedOwner = storeOwnerCache[params.storeId];
    let isStoreOwner = false;
    
    if (cachedOwner && Date.now() - cachedOwner.timestamp < CACHE_DURATION) {
      isStoreOwner = cachedOwner.userId === session.userId;
    } else {
      // Check if user is store owner
      const store = await prismadb.store.findFirst({
        where: {
          id: params.storeId,
          userId: session.userId,
        },
        select: { userId: true } // Only select needed field
      });
      
      if (store) {
        storeOwnerCache[params.storeId] = {
          userId: store.userId,
          timestamp: Date.now()
        };
        isStoreOwner = true;
      }
    }

    // Collect all unique permissions
    const permissions = new Set<string>();
    
    // If user is store owner, grant all permissions
    if (isStoreOwner) {
      Object.values(Permissions).forEach(permission => {
        permissions.add(permission);
      });
    } else {
      // Get user's roles and permissions through role assignments
      const userRoleAssignments = await prismadb.roleAssignment.findMany({
        where: {
          userId: session.userId,
          storeId: params.storeId
        },
        include: {
          role: {
            include: {
              permissions: true
            }
          }
        }
      });

      console.log('User role assignments found:', userRoleAssignments); // Debug log

      if (userRoleAssignments.length === 0) {
        console.log('No role assignments found for user:', session.userId, 'in store:', params.storeId);
      }

      // Add permissions from each role assignment
      userRoleAssignments.forEach(assignment => {
        if (assignment.role.permissions) {
          console.log(`Processing permissions for role ${assignment.role.name}:`, assignment.role.permissions);
          assignment.role.permissions.forEach(permission => {
            if (permission.name) {
              // Convert permission name to format used in database (lowercase with colon)
              const permName = permission.name.toLowerCase().replace('_', ':');
              console.log('Adding permission:', permName);
              permissions.add(permName);
            }
          });
        }
      });

      // Add default permissions that every staff member should have
      permissions.add('store:view');

      console.log('All permissions after processing:', Array.from(permissions));
    }

    const permissionsArray = Array.from(permissions);
    console.log('Final permissions:', permissionsArray); // Debug log

    return NextResponse.json({ 
      permissions: permissionsArray,
      isStoreOwner 
    });
  } catch (error) {
    console.error('[PERMISSIONS_GET]', error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch permissions" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
