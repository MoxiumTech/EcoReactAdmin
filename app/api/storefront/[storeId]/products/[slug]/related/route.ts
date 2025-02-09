import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { formatProducts } from "@/lib/price-formatter";

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
      return new NextResponse("Product slug is required", { status: 400 });
    }

    // Get the original product's taxons
    const product = await prismadb.product.findFirst({
      where: {
        slug,
        storeId,
        isVisible: true,
      },
      include: {
        taxons: true
      }
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Get related products from the same categories
    const rawRelatedProducts = await prismadb.product.findMany({
      where: {
        storeId,
        isVisible: true,
        taxons: {
          some: {
            id: {
              in: product.taxons.map((t) => t.id),
            },
          },
        },
        NOT: {
          id: product.id,
        },
      },
      include: {
        images: true,
        variants: {
          where: { isVisible: true },
          include: {
            images: true,
            size: true,
            color: true,
            stockItems: true,
            optionValues: {
              include: {
                optionValue: {
                  include: {
                    optionType: true,
                  },
                },
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        brand: true,
        optionTypes: {
          include: {
            optionValues: true,
          },
        },
        taxons: {
          include: {
            taxonomy: true,
          },
        },
      },
      take: 4,
    });

    // Format related products
    const relatedProducts = formatProducts(rawRelatedProducts);

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error('[RELATED_PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
