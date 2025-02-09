import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    // Get store with taxonomies
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      include: {
        taxonomies: true
      }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('[STORE_DETAILS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
