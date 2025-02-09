import { Decimal } from "@prisma/client/runtime/library";



export interface Store {
  id: string;
  name: string;
  userId: string;
  currency?: string;
  locale?: string;
  domain?: string;
  themeSettings?: any;
  customCss?: string;
  logoUrl?: string;
  faviconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number | Decimal;
  sku?: string;
  barcode?: string;
  isVisible: boolean;
  images: Image[];
  brandId?: string;
  brand?: Brand;
  variants?: Variant[];
  tags?: string[];
  taxRate?: number;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  url: string;
  position?: number;
  alt?: string;
  fileId?: string;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
}

export interface Color {
  id: string;
  name: string;
  value: string;
}

export interface Size {
  id: string;
  name: string;
  value: string;
}

export interface Taxonomy {
  id: string;
  name: string;
  description?: string;
  taxons: Taxon[];
}

export interface Taxon {
  id: string;
  name: string;
  description?: string;
  position: number;
  permalink?: string;
  children?: Taxon[];
}

export interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number | Decimal;
  costPrice?: number | Decimal;
  compareAtPrice?: number | Decimal;
  position: number;
  stockItems?: StockItem[];
}

export interface StockItem {
  id: string;
  count: number;
  reserved: number;
  backorderedQty: number;
  stockStatus: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  images: { url: string }[];
  price: number;
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  taxonomyId?: string;
  sku?: string;
  barcode?: string;
  isVisible: boolean;
  tags: string[];
  taxRate?: number;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  minimumQuantity: number;
  maximumQuantity?: number;
}

export interface ProductFormProps {
  initialData: Product | null;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: Taxonomy[];
  storeCurrency: string;
  storeLocale: string;
}

export interface PageData {
  product: Product | null;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: Taxonomy[];
  store: Store | null;
}