import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { formatProduct } from "@/lib/price-formatter";

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

    // Get the product with its variants and related data
    const rawProduct = await prismadb.product.findFirst({
      where: {
        slug,
        storeId,
        isVisible: true,
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
    });

    if (!rawProduct) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Format product prices and data types
    const product = formatProduct(rawProduct);

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
