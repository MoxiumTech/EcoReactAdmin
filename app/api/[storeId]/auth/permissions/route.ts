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
      // Get user's role assignments with minimal data
      const roleAssignments = await prismadb.roleAssignment.findMany({
        where: {
          userId: session.userId,
          storeId: params.storeId,
        },
        select: {
          role: {
            select: {
              permissions: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      // Add permissions from role assignments
      roleAssignments.forEach(assignment => {
        assignment.role.permissions.forEach(permission => {
          permissions.add(permission.name);
        });
      });
    }

    return NextResponse.json({ 
      permissions: Array.from(permissions),
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
