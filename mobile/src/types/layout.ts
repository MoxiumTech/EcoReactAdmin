import { Product, Taxonomy } from './api';

export interface HomeLayoutComponent {
  id: string;
  type: string;
  config: LayoutComponentConfig;
  position: number;
  isVisible: boolean;
  layoutId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeLayout {
  id: string;
  name: string;
  isActive: boolean;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
  components: HomeLayoutComponent[];
}

export interface LayoutComponentConfig {
  title?: string;
  subtitle?: string;
  productIds?: string[];
  products?: Product[];
  displayStyle?: 'grid' | 'carousel' | 'featured' | 'horizontal';
  categoryIds?: string[];
  taxonomies?: Taxonomy[];
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
}

export type LayoutComponentType = 
  | 'products-grid'
  | 'products-carousel'
  | 'featured-products'
  | 'categories'
  | 'banner'
  | 'hero';