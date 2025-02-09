import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; slug: string } }
) {
  try {
    const { storeId, slug } = params;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!slug) {
      return new NextResponse("Taxon slug is required", { status: 400 });
    }

    // Find the taxon with its store context and hierarchical data
    const taxon = await prismadb.taxon.findFirst({
      where: {
        id: slug,
        taxonomy: {
          storeId: storeId,
        },
      },
      include: {
        billboard: true,
        children: {
          include: {
            products: true
          }
        },
        products: true
      },
    });

    if (!taxon) {
      return new NextResponse("Taxon not found", { status: 404 });
    }

    return NextResponse.json(taxon);
  } catch (error) {
    console.error('[TAXON_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
