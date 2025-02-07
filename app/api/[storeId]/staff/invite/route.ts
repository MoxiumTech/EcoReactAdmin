import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";
import crypto from "crypto";
import { sendInviteEmail } from "@/lib/mail";
import { error } from "console";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { email, roleId } = body;

    if (!email || !roleId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if store exists and user has access
    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Check if invitation already exists
    const existingInvitation = await prismadb.staffInvitation.findFirst({
      where: {
        email,
        storeId: params.storeId,
      }
    });

    if (existingInvitation) {
      return new NextResponse("Invitation already sent", { status: 400 });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    const invitation = await prismadb.staffInvitation.create({
      data: {
        email,
        storeId: params.storeId,
        roleId,
        token,
        status: 'pending',
        expiresAt,
      }
    });

    // Get the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/accept-invite?token=${token}`;

    let emailSent = false;
    // Try to send invitation email
    try {
      await sendInviteEmail({
        to: email,
        inviteUrl: acceptUrl,
        storeName: store.name
      });
      emailSent = true;
    } catch (error) {
      console.error('[STAFF_INVITE] Email error:', error);
      // Continue with the invitation creation even if email fails
    }

    // Return invitation with the accept URL
    return NextResponse.json({
      ...invitation,
      acceptUrl, // Include the URL in the response so it can be copied manually
      emailSent
    });
  } catch (error) {
    console.error('[STAFF_INVITE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
