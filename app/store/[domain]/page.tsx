import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getBaseUrl } from "@/lib/server-utils";

import { Billboard } from "./components/billboard";
import { ProductsList } from "./components/products-list";
import { BannerComponent } from "./components/banner";
import { CategoriesGrid } from "./components/categories-grid";
import { ProductsCarousel } from "./components/products-carousel";
import { SlidingBanners } from "./components/sliding-banners";

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
}

interface CategoriesConfig {
  categories: any[];
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
  const storeDetailsRes = await fetch(`${baseUrl}/api/storefront/${store.id}/store/details`);
  if (!storeDetailsRes.ok) {
    throw new Error('Failed to fetch store details');
  }
  const storeDetails = await storeDetailsRes.json();

  // Get active layout with components
  const layoutRes = await fetch(`${baseUrl}/api/storefront/${store.id}/store/layout`);
  if (!layoutRes.ok) {
    throw new Error('Failed to fetch layout');
  }
  const activeLayout = await layoutRes.json();
  const components = activeLayout?.components || [];

  return (
    <main className="flex-grow">
      <div className="space-y-10 pb-10">
      {components
        .filter((component: LayoutComponent) => component.isVisible)
        .map((component: LayoutComponent) => {
          const renderComponent = () => {
            switch (component.type) {
              case 'billboard':
                return (
                  <Billboard
                    data={component.config as BillboardConfig}
                  />
                );
              case 'featured-products':
                return (
                  <ProductsList
                    title="Featured Products"
                    items={(component.config as ProductsConfig).products || []}
                  />
                );
              case 'banner':
                return (
                  <BannerComponent
                    data={component.config as BannerConfig}
                  />
                );
              case 'categories':
                return (
                  <CategoriesGrid
                    categories={(component.config as CategoriesConfig).categories || []}
                  />
                );
              case 'products-grid':
                return (
                  <ProductsList
                    title={(component.config as ProductsConfig).title || "Products"}
                    items={(component.config as ProductsConfig).products || []}
                  />
                );
              case 'products-carousel':
                return (
                  <ProductsCarousel
                    title={(component.config as ProductsConfig).title || "Products"}
                    items={(component.config as ProductsConfig).products || []}
                  />
                );
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
