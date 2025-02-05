import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    // Get invitation and related data
    const invitation = await prismadb.staffInvitation.findUnique({
      where: { token },
      include: {
        store: true,
        role: true
      }
    });

    // Get user assignment if any
    const roleAssignment = invitation ? await prismadb.roleAssignment.findFirst({
      where: {
        storeId: invitation.storeId,
        roleId: invitation.roleId,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    }) : null;

    const debugInfo = {
      token,
      invitation: invitation ? {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        store: {
          id: invitation.store.id,
          name: invitation.store.name
        },
        role: {
          id: invitation.role.id,
          name: invitation.role.name
        }
      } : null,
      roleAssignment: roleAssignment ? {
        id: roleAssignment.id,
        user: roleAssignment.user,
        createdAt: roleAssignment.createdAt
      } : null,
      currentTime: new Date(),
      isExpired: invitation ? new Date() > invitation.expiresAt : null,
      tokenValidity: {
        exists: !!invitation,
        isPending: invitation?.status === 'pending',
        isAccepted: invitation?.status === 'accepted',
        isExpired: invitation ? new Date() > invitation.expiresAt : null
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('[DEBUG_INVITE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
