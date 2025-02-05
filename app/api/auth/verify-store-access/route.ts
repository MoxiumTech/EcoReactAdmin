import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { userId, storeId } = body;

    if (!userId || !storeId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user has access to this store (either as owner or through role assignment)
    const [store, roleAssignment] = await Promise.all([
      prismadb.store.findFirst({
        where: {
          userId,
          id: storeId
        }
      }),
      prismadb.roleAssignment.findFirst({
        where: {
          userId,
          storeId
        }
      })
    ]);

    if (!store && !roleAssignment) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[VERIFY_STORE_ACCESS]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
