import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { formatProducts } from "@/lib/price-formatter";
import { type Product } from "@/types/models";
import { getBaseUrl } from "@/lib/server-utils";
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
  // Get store
  const store = await prismadb.store.findFirst({
    where: {
      domain: params.domain,
    },
  });

  if (!store) {
    return notFound();
  }

  // Get taxon details
  const baseUrl = getBaseUrl();
  const taxonRes = await fetch(`${baseUrl}/api/storefront/${store.id}/taxonomies/${params.slug}`);
  if (!taxonRes.ok) {
    if (taxonRes.status === 404) {
      return notFound();
    }
    throw new Error('Failed to fetch taxon');
  }
  const taxon = await taxonRes.json();

  // Get filtered products and available filters
  const searchParamsString = new URLSearchParams(searchParams as any).toString();
  const productsRes = await fetch(`${baseUrl}/api/storefront/${store.id}/taxonomies/${params.slug}/products?${searchParamsString}`);
  if (!productsRes.ok) {
    throw new Error('Failed to fetch products');
  }
  const { products, filters } = await productsRes.json();
  const { sizes, colors, brands } = filters;

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
