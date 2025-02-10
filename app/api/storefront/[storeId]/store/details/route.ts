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

    // Get store with taxonomies and their taxons
    const store = await prismadb.store.findUnique({
      where: {
        id: storeId,
      },
      include: {
        taxonomies: {
          include: {
            taxons: {
              include: {
                _count: {
                  select: {
                    products: true,
                    children: true
                  }
                },
                children: {
                  include: {
                    _count: {
                      select: {
                        products: true,
                        children: true
                      }
                    },
                    children: {
                      include: {
                        _count: {
                          select: {
                            products: true
                          }
                        }
                      }
                    }
                  }
                }
              },
              orderBy: {
                position: 'asc'
              }
            }
          }
        }
      }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    // Add debug logging
    console.log('Store Details:', {
      storeId: store.id,
      taxonomiesCount: store.taxonomies.length,
      firstTaxonomyTaxons: store.taxonomies[0]?.taxons.length,
      totalTaxons: store.taxonomies.reduce((acc, tax) => acc + tax.taxons.length, 0)
    });

    // Flatten the taxon hierarchy for each taxonomy
    const formattedStore = {
      ...store,
      taxonomies: store.taxonomies.map(taxonomy => ({
        ...taxonomy,
        taxons: flattenTaxons(taxonomy.taxons)
      }))
    };

    return NextResponse.json(formattedStore);
  } catch (error) {
    console.error('[STORE_DETAILS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Helper function to flatten taxon hierarchy
function flattenTaxons(taxons: any[]): any[] {
  const flattened: any[] = [];
  
  function flatten(taxon: any) {
    const { children, ...taxonWithoutChildren } = taxon;
    flattened.push(taxonWithoutChildren);
    
    if (children?.length) {
      children.forEach((child: any) => flatten(child));
    }
  }

  taxons.forEach(taxon => flatten(taxon));
  return flattened;
}
