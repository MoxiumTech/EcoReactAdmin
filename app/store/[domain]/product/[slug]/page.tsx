import { notFound } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { formatProduct, formatProducts } from "@/lib/price-formatter";
import { type Product } from "@/types/models";
import { getBaseUrl } from "@/lib/server-utils";
import { ProductsCarousel } from "../../components/products-carousel";
import { ProductDisplay } from "../../components/product-display";

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

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="md:grid md:grid-cols-2 md:items-start md:gap-x-8">
          <ProductDisplay product={product} />
        </div>
        <hr className="my-10" />
        <ProductsCarousel title="Related Items" items={relatedProducts} />
      </div>
    </div>
  );
};

export default ProductPage;
