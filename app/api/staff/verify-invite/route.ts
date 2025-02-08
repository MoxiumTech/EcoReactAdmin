export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    console.log('[VERIFY_INVITE] Verifying token:', token);

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    // Find the invitation
    console.log('[VERIFY_INVITE] Looking up invitation in database...');
    
    const invitation = await prismadb.staffInvitation.findUnique({
      where: { token },
      include: {
        store: true,
        role: true
      }
    });

    console.log('[VERIFY_INVITE] Lookup result:', {
      found: !!invitation,
      status: invitation?.status,
      email: invitation?.email,
      expiresAt: invitation?.expiresAt
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

    const response = {
      storeName: invitation.store.name,
      email: invitation.email,
      roleName: invitation.role.name
    };

    console.log('[VERIFY_INVITE] Returning invitation details:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[VERIFY_INVITE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
