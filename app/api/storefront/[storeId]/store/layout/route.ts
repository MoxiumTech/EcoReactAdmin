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

    // Get active layout with components
    const layout = await prismadb.homeLayout.findFirst({
      where: {
        storeId: storeId,
        isActive: true,
      },
      include: {
        components: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!layout) {
      return new NextResponse("Layout not found", { status: 404 });
    }

    return NextResponse.json(layout);
  } catch (error) {
    console.error('[STORE_LAYOUT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
