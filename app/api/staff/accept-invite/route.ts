import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token: inviteToken, name, password } = body;

    if (!inviteToken || !name || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Find the invitation
    const invitation = await prismadb.staffInvitation.findUnique({
      where: { token: inviteToken },
      include: {
        store: true,
        role: true
      }
    });

    if (!invitation) {
      return new NextResponse("Invalid invitation", { status: 404 });
    }

    if (invitation.status !== 'pending') {
      return new NextResponse("Invitation has already been used", { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return new NextResponse("Invitation has expired", { status: 400 });
    }

    // Check if user with this email already exists
    const existingUser = await prismadb.user.findUnique({
      where: { email: invitation.email }
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prismadb.user.create({
      data: {
        email: invitation.email,
        name,
        password: hashedPassword,
      }
    });

    // Create role assignment
    await prismadb.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: invitation.roleId,
        storeId: invitation.storeId
      }
    });

    // Update invitation status
    await prismadb.staffInvitation.update({
      where: { id: invitation.id },
      data: { status: 'accepted' }
    });

    // Generate admin token
    const authToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      store: invitation.store,
      token: authToken
    });

    // Set cookie
    response.cookies.set({
      name: 'admin_token',
      value: authToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return response;
  } catch (error) {
    console.error('[ACCEPT_INVITE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
