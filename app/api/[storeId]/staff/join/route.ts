import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { name, password, invitationId } = body;

    if (!name || !password || !invitationId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get invitation and check if it's valid
    const invitation = await prismadb.staffInvitation.findFirst({
      where: {
        id: invitationId,
        storeId: params.storeId,
        status: "pending",
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!invitation) {
      return new NextResponse("Invalid or expired invitation", { status: 400 });
    }

    // Check if user already exists
    let user = await prismadb.user.findUnique({
      where: { email: invitation.email }
    });

    // Create user if they don't exist
    if (!user) {
      const hashedPassword = await hash(password, 10);
      user = await prismadb.user.create({
        data: {
          email: invitation.email,
          name,
          password: hashedPassword,
        },
      });
    }

    // Create role assignment
    await prismadb.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: invitation.roleId,
        storeId: params.storeId,
      },
    });

    // Update invitation status
    await prismadb.staffInvitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[STAFF_JOIN]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
