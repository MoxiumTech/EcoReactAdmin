import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validateCategoriesConfig } from "./validate";

// Matches Prisma model structure
interface HomeLayoutComponent {
  id: string;
  type: string;
  config: string | Record<string, any>;
  position: number;
  isVisible: boolean;
  layoutId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FormattedComponent {
  id: string;
  type: string;
  config: Record<string, any>;
  position: number;
  isVisible: boolean;
  layoutId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface HomeLayout {
  id: string;
  name: string;
  isActive: boolean;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
  components: HomeLayoutComponent[];
}

interface FormattedLayout extends Omit<HomeLayout, 'components'> {
  components: FormattedComponent[];
}

async function getProductsByIds(productIds: string[]) {
  if (!productIds.length) return [];
  
  const products = await prismadb.product.findMany({
    where: {
      id: { in: productIds },
      isVisible: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: {
        select: {
          id: true,
          url: true,
          alt: true,
          position: true
        }
      },
      brand: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      variants: {
        select: {
          id: true,
          name: true,
          price: true,
          compareAtPrice: true,
          stockItems: {
            select: {
              id: true,
              count: true,
              stockStatus: true
            }
          }
        }
      }
    }
  });

  return products;
}

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

    // Parse and validate component configs
    const formattedComponents = await Promise.all(layout.components.map(async (component): Promise<FormattedComponent | null> => {
      try {
        const parsedConfig = typeof component.config === 'string' 
          ? JSON.parse(component.config)
          : component.config;

        // Handle product-related components
        if (['products-grid', 'products-carousel', 'featured-products'].includes(component.type)) {
          const productIds = parsedConfig.productIds || [];
          const products = await getProductsByIds(productIds);
          
          return {
            ...component,
            config: {
              ...parsedConfig,
              products: products.map(product => ({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                images: product.images,
                brand: product.brand,
                variants: product.variants.map(variant => ({
                  id: variant.id,
                  name: variant.name,
                  price: variant.price,
                  compareAtPrice: variant.compareAtPrice,
                  stockItems: variant.stockItems,
                })),
              }))
            }
          };
        }

        // Validate categories config
        if (component.type === 'categories') {
          if (!validateCategoriesConfig(parsedConfig)) {
            console.error(`Invalid categories config for component ${component.id}`);
            return null;
          }
        }

        return {
          ...component,
          config: parsedConfig
        };
      } catch (error) {
        console.error(`Error parsing config for component ${component.id}:`, error);
        return null;
      }
    }));

    const validComponents = formattedComponents.filter((component): component is FormattedComponent => component !== null);

    const formattedLayout: FormattedLayout = {
      ...layout,
      components: validComponents
    };

    // Add debug logging
    console.log('Formatted Layout:', {
      layoutId: formattedLayout.id,
      componentsCount: formattedLayout.components.length,
      components: formattedLayout.components.map(c => ({
        type: c.type,
        productCount: c.config.products?.length,
        categoryIds: c.config.categoryIds,
        productExample: c.config.products?.[0]
      }))
    });

    return NextResponse.json(formattedLayout);
  } catch (error) {
    console.error('[STORE_LAYOUT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
