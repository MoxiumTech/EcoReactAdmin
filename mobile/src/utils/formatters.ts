export const formatNumericField = (value: number | string | null | undefined): number => {
  if (typeof value === 'string') {
    return parseFloat(value) || 0;
  }
  return value || 0;
};

export const formatPrice = (price: number | string | null | undefined): number => {
  return formatNumericField(price);
};

export const formatMoney = (amount: number): string => {
  return amount;
};

export const formatProduct = (product: any) => {
  return {
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
      compareAtPrice: variant.compareAtPrice ? formatNumericField(variant.compareAtPrice) : null,
      weight: formatNumericField(variant.weight)
    }))
  };
};

export const formatProducts = (products: any[]) => {
  return products.map(product => formatProduct(product));
};