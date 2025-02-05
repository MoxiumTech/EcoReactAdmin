import { NextResponse } from "next/server";
import { createUser, generateAdminToken } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

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

    // Get super admin role
    const superAdminRole = await prismadb.role.findFirst({
      where: { name: "Super Admin" } // This name matches DefaultRoles.SUPER_ADMIN.name
    });

    if (!superAdminRole) {
      return new NextResponse("System not properly initialized", { status: 500 });
    }

    console.log('[SIGNUP] Creating store for user:', user.id);
    
    // Create a default store for the user
    let store;
    try {
      store = await prismadb.store.create({
        data: {
          name: `${name}'s Store`,
          userId: user.id,
        }
      });
      console.log('[SIGNUP] Store created successfully:', store.id);
    } catch (storeError) {
      console.error('[SIGNUP] Store creation error:', storeError);
      return new NextResponse("Failed to create store", { status: 500 });
    }

    if (!store) {
      return new NextResponse("Failed to create store", { status: 500 });
    }

    console.log('[SIGNUP] Assigning super admin role');
    try {
      // Assign super admin role to user for this store
      await prismadb.roleAssignment.create({
        data: {
          userId: user.id,
          roleId: superAdminRole.id,
          storeId: store.id,
        }
      });
      console.log('[SIGNUP] Role assigned successfully');
    } catch (roleError) {
      console.error('[SIGNUP] Role assignment error:', roleError);
      // Try to clean up the store if role assignment fails
      try {
        await prismadb.store.delete({
          where: { id: store.id }
        });
      } catch (cleanupError) {
        console.error('[SIGNUP] Failed to cleanup store after role assignment error:', cleanupError);
      }
      return new NextResponse("Failed to assign role", { status: 500 });
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
