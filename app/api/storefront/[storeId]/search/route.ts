import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return new NextResponse("Query is required", { status: 400 });
    }

    // Search products that belong to this store
    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            sku: {
              contains: query,
              mode: "insensitive"
            }
          },
          {
            tags: {
              has: query
            }
          }
        ],
        AND: [
          { isVisible: true },
          { status: "active" },
          { 
            OR: [
              { discontinueOn: null },
              { discontinueOn: { gt: new Date() } }
            ]
          },
          {
            OR: [
              { availableOn: null },
              { availableOn: { lte: new Date() } }
            ]
          }
        ]
      },
      include: {
        images: {
          orderBy: {
            position: 'asc'
          }
        },
        brand: {
          select: {
            name: true,
            slug: true
          }
        },
        variants: {
          where: {
            isVisible: true
          },
          take: 1,
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      take: 8,
    });

    // Transform the data for the frontend
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      images: product.images,
      brand: product.brand,
      sku: product.sku,
      inStock: product.variants.length > 0,
      tags: product.tags
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.log('[SEARCH_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
