import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prismadb from "@/lib/prismadb";
import { getAuthCookie } from "@/lib/auth";

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("Missing credentials", { status: 400 });
    }

    // Get user
    const user = await prismadb.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    console.log('[SIGNIN] Finding stores for user:', user.id);

    // Get all accessible stores with full details
    const stores = await prismadb.store.findMany({
      where: {
        OR: [
          { userId: user.id }, // Owned stores
          {
            roleAssignments: {
              some: {
                userId: user.id
              }
            }
          } // Assigned stores
        ]
      },
      include: {
        roleAssignments: {
          where: {
            userId: user.id
          },
          include: {
            role: true
          }
        }
      }
    });

    console.log('[SIGNIN] Found stores:', {
      count: stores.length,
      details: stores.map(store => ({
        id: store.id,
        name: store.name,
        isOwner: store.userId === user.id,
        roles: store.roleAssignments.map(ra => ra.role.name)
      }))
    });

    if (stores.length === 0) {
      console.log('[SIGNIN] No stores found for user');
      return new NextResponse("No accessible stores found", { status: 403 });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set cookie with proper configuration for root domain only
    const cookieStore = await cookies();
    const cookieConfig = getAuthCookie(token, 'admin');

    // For local development with lvh.me, the cookie needs to be set for .lvh.me
    // This will make it accessible from both lvh.me and admin.lvh.me
    const rootDomain = process.env.MAIN_DOMAIN?.split(':')[0]; // Remove port
    const baseRootDomain = rootDomain?.startsWith('admin.') ? rootDomain.substring(6) : rootDomain;

    cookieStore.set(cookieConfig.name, cookieConfig.value, {
      ...cookieConfig,
      sameSite: 'lax',
      path: '/',
      domain: `.${baseRootDomain}` // Add dot prefix to make it work for all subdomains
    });

    console.log('[SIGNIN] Setting cookie:', {
      name: cookieConfig.name,
      domain: `.${baseRootDomain}`,
      path: '/',
      sameSite: 'lax'
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      stores: stores.map(store => ({
        id: store.id,
        name: store.name,
        isOwner: store.userId === user.id,
        roles: store.roleAssignments.map(ra => ra.role.name)
      })),
      defaultStoreId: stores[0].id // First store will be the default redirect target
    });
  } catch (error) {
    console.log('[SIGNIN]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
