import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { formatProduct, formatProducts } from "@/lib/price-formatter";
import { type Product } from "@/types/models";
import { getBaseUrl } from "@/lib/server-utils";
import { ProductsCarousel } from "../../components/products-carousel";
import { ProductDisplay } from "../../components/product-display";
import { Breadcrumb } from "../../components/breadcrumb";

interface ProductPageProps {
  params: {
    domain: string;
    slug: string;
  };
}

const ProductPage = async ({ params }: ProductPageProps) => {
  // Get store
  const store = await prismadb.store.findFirst({
    where: {
      domain: params.domain,
    },
  });

  if (!store) {
    return notFound();
  }

  // Get product details
  const baseUrl = getBaseUrl();
  const productRes = await fetch(`${baseUrl}/api/storefront/${store.id}/products/${params.slug}`);
  if (!productRes.ok) {
    if (productRes.status === 404) {
      return notFound();
    }
    throw new Error('Failed to fetch product');
  }
  const product = await productRes.json();

  // Get related products
  const relatedRes = await fetch(`${baseUrl}/api/storefront/${store.id}/products/${params.slug}/related`);
  if (!relatedRes.ok) {
    throw new Error('Failed to fetch related products');
  }
  const relatedProducts = await relatedRes.json();

  // Create breadcrumb items from product categories
  const breadcrumbItems = product.categories?.[0] ? [
    ...(product.categories[0].ancestors || []).map((ancestor: any) => ({
      label: ancestor.name,
      href: `/category/${ancestor.slug}`
    })),
    {
      label: product.categories[0].name,
      href: `/category/${product.categories[0].slug}`
    },
    {
      label: product.name,
      href: `/product/${product.slug}`
    }
  ] : [
    {
      label: product.name,
      href: `/product/${product.slug}`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mt-6 lg:mt-8 bg-white rounded-xl shadow-sm border">
          <div className="md:grid md:grid-cols-2 md:items-start">
            <ProductDisplay product={product} />
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <ProductsCarousel 
              title="You May Also Like" 
              items={relatedProducts}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
