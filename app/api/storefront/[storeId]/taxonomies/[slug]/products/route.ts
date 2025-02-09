import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { formatProducts } from "@/lib/price-formatter";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; slug: string } }
) {
  try {
    const { storeId, slug } = params;
    const { searchParams } = new URL(req.url);
    
    const colorId = searchParams.get('colorId');
    const sizeId = searchParams.get('sizeId');
    const brandId = searchParams.get('brandId');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!slug) {
      return new NextResponse("Taxon slug is required", { status: 400 });
    }

    // Get the taxon and its children's products
    const taxon = await prismadb.taxon.findFirst({
      where: {
        id: slug,
        taxonomy: {
          storeId
        }
      },
      include: {
        children: {
          include: {
            products: true
          }
        },
        products: true
      }
    });

    if (!taxon) {
      return new NextResponse("Taxon not found", { status: 404 });
    }

    // Include products from both current taxon and child taxons
    const allProductIds = [
      ...taxon.products.map(p => p.id),
      ...taxon.children.flatMap(child => child.products.map(p => p.id))
    ];

    // Build filter conditions
    const whereClause: any = {
      storeId,
      isVisible: true,
      OR: [
        {
          id: {
            in: allProductIds
          }
        },
        {
          taxons: {
            some: {
              id: taxon.id
            }
          }
        }
      ]
    };

    if (brandId) {
      whereClause.brandId = brandId;
    }

    // Build variant filters
    const variantFilters: any = {
      isVisible: true,
      ...(colorId && { colorId }),
      ...(sizeId && { sizeId })
    };

    // Add stock filter if requested
    if (inStock === 'true') {
      variantFilters.stockItems = {
        some: {
          count: { gt: 0 }
        }
      };
    }

    // Add price range filter if provided
    if (minPrice || maxPrice) {
      variantFilters.AND = [
        ...(minPrice ? [{ price: { gte: parseFloat(minPrice) } }] : []),
        ...(maxPrice ? [{ price: { lte: parseFloat(maxPrice) } }] : [])
      ];
    }

    // Apply variant filters if any exist
    if (Object.keys(variantFilters).length > 0) {
      whereClause.variants = {
        some: variantFilters
      };
    }

    // Get filtered products with variants and related data
    const rawProducts = await prismadb.product.findMany({
      where: whereClause,
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
        taxons: {
          include: {
            taxonomy: true,
          },
        },
        optionTypes: {
          include: {
            optionValues: true,
          },
        },
      },
      orderBy: {
        ...(sort === "price-asc" && { price: "asc" }),
        ...(sort === "price-desc" && { price: "desc" }),
        ...(sort === "popularity" && { orderCount: "desc" }),
        ...((!sort || sort === "newest") && {
          createdAt: "desc",
        }),
      },
    });

    // Get available filters
    const sizes = await prismadb.size.findMany({
      where: {
        storeId,
      },
    });

    const colors = await prismadb.color.findMany({
      where: {
        storeId,
      },
    });

    const brands = await prismadb.brand.findMany({
      where: {
        storeId,
        isActive: true,
      },
    });

    // Format products
    const products = formatProducts(rawProducts);

    return NextResponse.json({
      products,
      filters: {
        sizes,
        colors,
        brands
      }
    });
  } catch (error) {
    console.error('[CATEGORY_PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
