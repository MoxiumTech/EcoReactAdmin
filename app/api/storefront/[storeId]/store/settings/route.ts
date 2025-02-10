import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: params.storeId,
      },
      select: {
        id: true,
        name: true,
        domain: true,
        logoUrl: true,
        currency: true,
      },
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    return NextResponse.json({
      ...store,
      currency: store.currency || "USD", // Default to USD if not set
    });
  } catch (error) {
    console.error('[STORE_SETTINGS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
