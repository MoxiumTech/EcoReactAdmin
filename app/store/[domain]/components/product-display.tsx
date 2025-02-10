"use client";

import { useState } from "react";
import type { Product, Variant } from "@/types/models";
import { Gallery } from "./gallery";
import { ProductInfo } from "./product-info";

interface ProductDisplayProps {
  product: Product;
}

export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product
}) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );

  return (
    <>
      <div className="md:sticky md:top-24 h-full">
        <div className="relative aspect-square md:aspect-auto md:h-[calc(100vh-200px)] overflow-hidden rounded-l-xl">
          <Gallery 
            images={product.images}
            variantImages={selectedVariant?.images || []}
          />
        </div>
      </div>
      <div className="p-6 md:p-8 lg:p-10">
        <ProductInfo 
          product={product}
          onVariantChange={setSelectedVariant}
        />
      </div>
    </>
  );
};
