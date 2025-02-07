export const Permissions = {
  // Product permissions
  VIEW_PRODUCTS: 'products:view',
  CREATE_PRODUCTS: 'products:create',
  EDIT_PRODUCTS: 'products:edit',
  DELETE_PRODUCTS: 'products:delete',

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
  
  // Store management permissions
  VIEW_STORE: 'store:view',
  MANAGE_STORE: 'store:manage',
  
  // Billboard permissions
  VIEW_BILLBOARDS: 'billboards:view',
  MANAGE_BILLBOARDS: 'billboards:manage',
  
  // Category permissions
  VIEW_CATEGORIES: 'categories:view',
  MANAGE_CATEGORIES: 'categories:manage',
  
  // Brand permissions
  VIEW_BRANDS: 'brands:view',
  MANAGE_BRANDS: 'brands:manage',
  
  // Stock permissions
  VIEW_STOCK: 'stock:view',
  MANAGE_STOCK: 'stock:manage',
} as const;

// Predefined roles with their permissions
export const DefaultRoles = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Full access to all features',
    permissions: Object.values(Permissions),
  },
  STORE_ADMIN: {
    name: 'Store Admin',
    description: 'Manage store settings and operations',
    permissions: [
      Permissions.VIEW_PRODUCTS,
      Permissions.CREATE_PRODUCTS,
      Permissions.EDIT_PRODUCTS,
      Permissions.DELETE_PRODUCTS,
      Permissions.VIEW_ORDERS,
      Permissions.MANAGE_ORDERS,
      Permissions.VIEW_CUSTOMERS,
      Permissions.MANAGE_CUSTOMERS,
      Permissions.VIEW_SETTINGS,
      Permissions.MANAGE_SETTINGS,
      Permissions.VIEW_STORE,
      Permissions.MANAGE_STORE,
    ],
  },
  STORE_MANAGER: {
    name: 'Store Manager',
    description: 'Manage products and orders',
    permissions: [
      Permissions.VIEW_PRODUCTS,
      Permissions.CREATE_PRODUCTS,
      Permissions.EDIT_PRODUCTS,
      Permissions.VIEW_ORDERS,
      Permissions.MANAGE_ORDERS,
      Permissions.VIEW_CUSTOMERS,
      Permissions.VIEW_SETTINGS,
    ],
  },
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    description: 'Manage products and stock',
    permissions: [
      Permissions.VIEW_PRODUCTS,
      Permissions.EDIT_PRODUCTS,
      Permissions.VIEW_STOCK,
      Permissions.MANAGE_STOCK,
    ],
  },
  ORDER_MANAGER: {
    name: 'Order Manager',
    description: 'Manage orders and customers',
    permissions: [
      Permissions.VIEW_ORDERS,
      Permissions.MANAGE_ORDERS,
      Permissions.VIEW_CUSTOMERS,
    ],
  },
  CONTENT_MANAGER: {
    name: 'Content Manager',
    description: 'Manage content and marketing',
    permissions: [
      Permissions.VIEW_BILLBOARDS,
      Permissions.MANAGE_BILLBOARDS,
      Permissions.VIEW_CATEGORIES,
      Permissions.MANAGE_CATEGORIES,
    ],
  },
} as const;
