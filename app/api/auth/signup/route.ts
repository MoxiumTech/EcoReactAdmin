import { NextResponse } from "next/server";
import { createUser, generateAdminToken } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { initializeStoreRoles } from "@/lib/init-store-roles";

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create the user
    const user = await createUser(email, password, name);

    console.log('[SIGNUP] Creating store for user:', user.id);
    
    // Create store and initialize roles in a transaction
    let store;
    try {
      store = await prismadb.$transaction(async (tx) => {
        // Create the store
        const newStore = await tx.store.create({
          data: {
            name: `${name}'s Store`,
            userId: user.id,
          }
        });
        console.log('[SIGNUP] Store created successfully:', newStore.id);

        // Initialize roles for the new store
        await initializeStoreRoles(tx, newStore.id);
        console.log('[SIGNUP] Store roles initialized');

        // Get the Store Admin role for this store
        const storeAdminRole = await tx.role.findFirst({
          where: {
            name: 'Store Admin',
            storeId: newStore.id
          }
        });

        if (!storeAdminRole) {
          throw new Error('Failed to initialize store roles');
        }

        // Assign Store Admin role to user
        await tx.roleAssignment.create({
          data: {
            userId: user.id,
            roleId: storeAdminRole.id,
            storeId: newStore.id,
          }
        });
        console.log('[SIGNUP] Role assigned successfully');

        return newStore;
      });
    } catch (error) {
      console.error('[SIGNUP] Store creation/role assignment error:', error);
      return new NextResponse("Failed to initialize store", { status: 500 });
    }

    // Generate admin token
    const token = generateAdminToken(user);

    // Create response with cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return response;
  } catch (error) {
    console.error('[SIGNUP]', error);
    if ((error as any).code === 'P2002') {
      return new NextResponse("Email already exists", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
