export const formatPrice = (price: number | string): number => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return Number(numericPrice.toFixed(2));
};

export const formatPriceWithCurrency = (price: number | string, currency: string = 'USD'): string => {
  const formattedPrice = formatPrice(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(formattedPrice);
};

export const formatNumericField = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object' && value.toString) {
    return Number(value.toString());
  }
  return typeof value === 'string' ? parseFloat(value) : Number(value);
};

export const formatProduct = (product: any) => {
  const formattedProduct = {
    ...product,
    price: formatPrice(product.price),
    costPrice: product.costPrice ? formatNumericField(product.costPrice) : null,
    compareAtPrice: product.compareAtPrice ? formatNumericField(product.compareAtPrice) : null,
    taxRate: formatNumericField(product.taxRate),
    weight: formatNumericField(product.weight),
    height: formatNumericField(product.height),
    width: formatNumericField(product.width),
    depth: formatNumericField(product.depth),
    variants: product.variants?.map((variant: any) => ({
      ...variant,
      price: formatPrice(variant.price),
      costPrice: variant.costPrice ? formatNumericField(variant.costPrice) : null,
      compareAtPrice: variant.compareAtPrice ? formatNumericField(variant.compareAtPrice) : null,
      taxRate: formatNumericField(variant.taxRate),
      weight: formatNumericField(variant.weight),
      height: formatNumericField(variant.height),
      width: formatNumericField(variant.width),
      depth: formatNumericField(variant.depth)
    }))
  };

  return formattedProduct;
};

export const formatProducts = (products: any[]) => {
  return products.map(product => formatProduct(product));
};
