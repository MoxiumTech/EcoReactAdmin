export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, generateAdminToken, getAuthCookie } from "@/lib/auth";
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

    // Generate token using auth utility
    const token = await generateAdminToken(user);

    // Set cookie with proper configuration for root domain only
    const cookieStore = await cookies();
    const cookieConfig = getAuthCookie(token, 'admin');

    // For local development with lvh.me, the cookie needs to be set for .lvh.me
    const rootDomain = process.env.MAIN_DOMAIN?.split(':')[0]; // Remove port
    const baseRootDomain = rootDomain?.startsWith('admin.') ? rootDomain.substring(6) : rootDomain;

    cookieStore.set(cookieConfig.name, cookieConfig.value, {
      ...cookieConfig,
      sameSite: 'lax' as const,
      path: '/',
      domain: `.${baseRootDomain}` // Add dot prefix to make it work for all subdomains
    });

    console.log('[SIGNUP] Setting cookie:', {
      name: cookieConfig.name,
      domain: `.${baseRootDomain}`,
      path: '/',
      sameSite: 'lax'
    });

    // Create response
    const response = NextResponse.json({ success: true });

    return response;
  } catch (error) {
    console.error('[SIGNUP]', error);
    if ((error as any).code === 'P2002') {
      return new NextResponse("Email already exists", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
