export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  taxRate?: number;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  images: { url: string }[];
  taxons: { name: string }[];
  variants?: ProductVariant[];
  brand?: string;
  sku?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  weight?: number;
  inStock: boolean;
  stockItems?: {
    id: string;
    count: number;
    stockStatus: string;
  }[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  number: string;
  total: number;
  state: string;
  items: CartItem[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  domain?: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  domain?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  domain?: string;
}

export interface StoreDetails {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  currency: string;
  taxonomies: Taxonomy[];
  cart?: Cart;
  user?: User;
  settings?: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
    };
    contact?: {
      email: string;
      phone: string;
      address: string;
    };
  };
}

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  position?: number;
  taxons: Taxon[];
}

export interface Taxon {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  position?: number;
  children?: Taxon[];
  parent?: Taxon;
  products?: Product[];
}

export interface SearchResult {
  products: Product[];
  total: number;
  filters?: {
    price?: {
      min: number;
      max: number;
    };
    categories?: {
      id: string;
      name: string;
      count: number;
    }[];
  };
}

export interface OrderStatus {
  key: string;
  color: string;
  label: string;
}

export type OrderState = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUSES: Record<OrderState, OrderStatus> = {
  pending: { key: 'pending', color: '#FFA500', label: 'Pending' },
  confirmed: { key: 'confirmed', color: '#3498db', label: 'Confirmed' },
  processing: { key: 'processing', color: '#f39c12', label: 'Processing' },
  shipped: { key: 'shipped', color: '#2ecc71', label: 'Shipped' },
  delivered: { key: 'delivered', color: '#27ae60', label: 'Delivered' },
  cancelled: { key: 'cancelled', color: '#e74c3c', label: 'Cancelled' }
};

export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}