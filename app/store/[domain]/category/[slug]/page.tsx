import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { formatProducts } from "@/lib/price-formatter";
import { type Product } from "@/types/models";
import { Billboard } from "../../components/billboard";
import { ProductsGrid } from "../../components/products-grid";

interface CategoryPageProps {
  params: {
    domain: string;
    slug: string;
  };
  searchParams: {
    colorId: string;
    sizeId: string;
    brandId: string;
    sort: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  };
}

const CategoryPage = async ({ params, searchParams }: CategoryPageProps) => {
  // Get store and validate
  const store = await prismadb.store.findFirst({
    where: {
      domain: params.domain,
    },
  });

  if (!store) {
    return notFound();
  }

  // Find the taxon with its store context and hierarchical data
  const taxon = await prismadb.taxon.findFirst({
    where: {
      id: params.slug,
      taxonomy: {
        storeId: store.id,
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
    console.error(`Taxon not found for ID: ${params.slug}`);
    return notFound();
  }

  // Include products from both current taxon and child taxons
  const allProductIds = [
    ...taxon.products.map(p => p.id),
    ...taxon.children.flatMap(child => child.products.map(p => p.id))
  ];

  if (!taxon) {
    return notFound();
  }

  // Build filter conditions
  const whereClause: any = {
    storeId: store.id,
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

  if (searchParams.brandId) {
    whereClause.brandId = searchParams.brandId;
  }

  // Build variant filters
  const variantFilters: any = {
    isVisible: true,
    ...(searchParams.colorId && { colorId: searchParams.colorId }),
    ...(searchParams.sizeId && { sizeId: searchParams.sizeId }),
  };

  // Add stock filter if requested
  if (searchParams.inStock === 'true') {
    variantFilters.stockItems = {
      some: {
        count: { gt: 0 }
      }
    };
  }

  // Add price range filter if provided
  if (searchParams.minPrice || searchParams.maxPrice) {
    variantFilters.AND = [
      ...(searchParams.minPrice ? [{ price: { gte: parseFloat(searchParams.minPrice) } }] : []),
      ...(searchParams.maxPrice ? [{ price: { lte: parseFloat(searchParams.maxPrice) } }] : [])
    ];
  }

  // Apply variant filters if any exist
  if (Object.keys(variantFilters).length > 0) {
    whereClause.variants = {
      some: variantFilters
    };
  }

  // Get products with variants and related data
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
      ...(searchParams.sort === "price-asc" && { price: "asc" }),
      ...(searchParams.sort === "price-desc" && { price: "desc" }),
      ...(searchParams.sort === "popularity" && { orderCount: "desc" }),
      ...((!searchParams.sort || searchParams.sort === "newest") && {
        createdAt: "desc",
      }),
    },
  });

  // Format products with proper price handling
  const products = formatProducts(rawProducts);

  // Get available filters
  const sizes = await prismadb.size.findMany({
    where: {
      storeId: store.id,
    },
  });

  const colors = await prismadb.color.findMany({
    where: {
      storeId: store.id,
    },
  });

  const brands = await prismadb.brand.findMany({
    where: {
      storeId: store.id,
      isActive: true,
    },
  });

  return (
    <div>
      {taxon.billboard && (
        <div className="mb-8">
          <Billboard data={taxon.billboard} />
        </div>
      )}
      <div className="pb-24">
        <ProductsGrid
          title={taxon.name}
          items={products}
          sizes={sizes}
          colors={colors}
          brands={brands}
          searchParams={searchParams}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
