export const Permissions = {
  // Catalog Structure permissions
  VIEW_TAXONOMIES: 'taxonomies:view',
  MANAGE_TAXONOMIES: 'taxonomies:manage',
  VIEW_TAXONS: 'taxons:view',
  MANAGE_TAXONS: 'taxons:manage',

  // Product permissions
  VIEW_PRODUCTS: 'products:view',
  CREATE_PRODUCTS: 'products:create',
  EDIT_PRODUCTS: 'products:edit',
  DELETE_PRODUCTS: 'products:delete',

  // Variant permissions
  VIEW_VARIANTS: 'variants:view',
  CREATE_VARIANTS: 'variants:create',
  EDIT_VARIANTS: 'variants:edit',
  DELETE_VARIANTS: 'variants:delete',

  // Order permissions
  VIEW_ORDERS: 'orders:view',
  MANAGE_ORDERS: 'orders:manage',
  
  // Customer permissions
  VIEW_CUSTOMERS: 'customers:view',
  MANAGE_CUSTOMERS: 'customers:manage',
  
  // Settings permissions
  VIEW_SETTINGS: 'settings:view',
  MANAGE_SETTINGS: 'settings:manage',
  
  // Role management permissions
  VIEW_ROLES: 'roles:view',
  MANAGE_ROLES: 'roles:manage',
  
  // Attribute permissions
  VIEW_ATTRIBUTES: 'attributes:view',
  MANAGE_ATTRIBUTES: 'attributes:manage',
  VIEW_OPTION_TYPES: 'option-types:view',
  MANAGE_OPTION_TYPES: 'option-types:manage',

  // Supplier permissions
  VIEW_SUPPLIERS: 'suppliers:view',
  MANAGE_SUPPLIERS: 'suppliers:manage',

  // Store management permissions
  VIEW_STORE: 'store:view',
  MANAGE_STORE: 'store:manage',
  
  // Content permissions
  VIEW_LAYOUTS: 'layouts:view',
  MANAGE_LAYOUTS: 'layouts:manage',
  VIEW_BILLBOARDS: 'billboards:view',
  MANAGE_BILLBOARDS: 'billboards:manage',
  VIEW_REVIEWS: 'reviews:view',
  MANAGE_REVIEWS: 'reviews:manage',
  
  // Category permissions
  VIEW_CATEGORIES: 'categories:view',
  MANAGE_CATEGORIES: 'categories:manage',
  
  // Brand permissions
  VIEW_BRANDS: 'brands:view',
  MANAGE_BRANDS: 'brands:manage',
  
  // Stock permissions
  VIEW_STOCK: 'stock:view',
  MANAGE_STOCK: 'stock:manage',
  VIEW_STOCK_MOVEMENTS: 'stock-movements:view',
  MANAGE_STOCK_MOVEMENTS: 'stock-movements:manage',

  // Analytics permissions
  VIEW_ANALYTICS: 'analytics:view',
  MANAGE_ANALYTICS: 'analytics:manage',
} as const;

export type PermissionValue = typeof Permissions[keyof typeof Permissions];
