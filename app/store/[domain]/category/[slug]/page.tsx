import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { formatProducts } from "@/lib/price-formatter";
import { type Product } from "@/types/models";
import { getBaseUrl } from "@/lib/server-utils";
import { Billboard } from "../../components/billboard";
import { ProductsGrid } from "../../components/products-grid";
import { Breadcrumb } from "../../components/breadcrumb";
import { Heading } from "@/components/ui/heading";

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

  const breadcrumbItems = [
    ...(taxon.ancestors || []).map((ancestor: any) => ({
      label: ancestor.name,
      href: `/category/${ancestor.slug}`
    })),
    {
      label: taxon.name,
      href: `/category/${taxon.slug}`
    }
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      {taxon.billboard && (
        <div className="mb-8 rounded-lg overflow-hidden shadow-md">
          <Billboard data={taxon.billboard} />
        </div>
      )}
      
      <div className="space-y-8">
        <ProductsGrid
          items={products}
          sizes={sizes}
          colors={colors}
          brands={brands}
          searchParams={searchParams}
          title={taxon.name}
          description={taxon.description || `Browse our collection of ${taxon.name}`}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
