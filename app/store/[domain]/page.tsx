import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/server-utils";
import { Billboard } from "./components/billboard";
import { ProductsList } from "./components/products-list";
import { BannerComponent } from "./components/banner";
import { CategoriesGrid } from "./components/categories-grid";
import { ProductsCarousel } from "./components/products-carousel";
import { SlidingBanners } from "./components/sliding-banners";

interface Taxon {
  id: string;
  name: string;
  description?: string;
  permalink: string;
  imageUrl?: string;
  position: number;
  _count?: {
    products: number;
    children: number;
  };
}

interface Taxonomy {
  id: string;
  name: string;
  taxons: Taxon[];
}

interface StoreDetails {
  id: string;
  name: string;
  taxonomies: Taxonomy[];
}

interface BillboardConfig {
  label: string;
  imageUrl: string;
}

interface BannerConfig {
  label: string;
  imageUrl: string;
}

interface ProductsConfig {
  title: string;
  products: any[];
  compact?: boolean;
  displayStyle?: "grid" | "carousel";
}

interface CategoriesConfig {
  title?: string;
  categoryIds: string[];
  displayStyle?: "grid" | "list" | "carousel";
  itemsPerRow?: number;
}

interface SlidingBannersConfig {
  banners: Array<{
    id: string;
    label: string;
    imageUrl: string;
    link?: string;
  }>;
  interval?: number;
}

type ComponentConfig = BillboardConfig | BannerConfig | ProductsConfig | CategoriesConfig | SlidingBannersConfig;

interface LayoutComponent {
  id: string;
  type: string;
  config: ComponentConfig;
  position: number;
  isVisible: boolean;
}

const HomePage = async ({
  params
}: {
  params: { domain: string }
}) => {
  // Get the store
  const store = await prismadb.store.findFirst({
    where: {
      domain: params.domain
    }
  });

  if (!store) {
    redirect('/');
  }

  // Get store details with taxonomies
  const baseUrl = getBaseUrl();
  const storeDetailsRes = await fetch(`${baseUrl}/api/storefront/${store.id}/store/details`, {
    next: { revalidate: 60 }
  });
  
  if (!storeDetailsRes.ok) {
    throw new Error('Failed to fetch store details');
  }

  const storeDetails: StoreDetails = await storeDetailsRes.json();

  // Get active layout with components
  const layoutRes = await fetch(`${baseUrl}/api/storefront/${store.id}/store/layout`, {
    next: { revalidate: 60 }
  });
  
  if (!layoutRes.ok) {

    return null;
  }

  const activeLayout = await layoutRes.json();
  const components = activeLayout?.components || [];

  return (
    <main className="flex-grow">
      <div className="space-y-10 pb-10">
      {components
        .filter((component: LayoutComponent) => component.isVisible)
        .map((component: LayoutComponent, index: number) => {
          const shouldUseCompact = (type: string) => {
            // Use compact mode for secondary product sections
            if (type.includes('products') && index > 0) return true;
            return false;
          };

          const renderComponent = () => {
            switch (component.type) {
              case 'billboard':
                return (
                  <Billboard
                    data={component.config as BillboardConfig}
                  />
                );
              case 'featured-products': {
                const config = component.config as ProductsConfig;
                return (
                  <ProductsList
                    title="Featured Products"
                    items={config.products || []}
                    compact={shouldUseCompact(component.type)}
                  />
                );
              }
              case 'banner':
                return (
                  <BannerComponent
                    data={component.config as BannerConfig}
                  />
                );
              case 'categories': {
                const config = component.config as CategoriesConfig;
                const allTaxons = storeDetails.taxonomies?.reduce((acc: Taxon[], taxonomy) => {
                  if (!taxonomy.taxons) return acc;
                  return acc.concat(taxonomy.taxons);
                }, []) || [];

                if (!config.categoryIds?.length) return null;

                const selectedTaxons = (config.categoryIds)
                  .map(id => allTaxons.find(taxon => taxon.id === id))
                  .filter((taxon): taxon is Taxon => taxon !== undefined)
                  .sort((a, b) => {
                    const aIndex = config.categoryIds.indexOf(a.id);
                    const bIndex = config.categoryIds.indexOf(b.id);
                    return aIndex - bIndex;
                  });

                if (selectedTaxons.length === 0) return null;

                return (
                  <CategoriesGrid
                    title={config.title}
                    categories={selectedTaxons}
                    displayStyle={config.displayStyle}
                    itemsPerRow={config.itemsPerRow}
                  />
                );
              }
              case 'products-grid': {
                const config = component.config as ProductsConfig;
                return (
                  <ProductsList
                    title={config.title || "Products"}
                    items={config.products || []}
                    compact={shouldUseCompact(component.type)}
                  />
                );
              }
              case 'products-carousel': {
                const config = component.config as ProductsConfig;
                return (
                  <ProductsCarousel
                    title={config.title || "Products"}
                    items={config.products || []}
                    compact={shouldUseCompact(component.type)}
                  />
                );
              }
              case 'sliding-banners':
                return (
                  <SlidingBanners
                    banners={(component.config as SlidingBannersConfig).banners || []}
                    interval={(component.config as SlidingBannersConfig).interval || 5000}
                  />
                );
              default:
                return null;
            }
          };

          return (
            <div key={component.id}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {renderComponent()}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default HomePage;
