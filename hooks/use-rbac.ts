"use client";

import { useEffect, useState } from 'react';
import { Permission, Role } from '@/types/role';

export interface UserPermissions {
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useRBAC = (storeId: string): UserPermissions => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`/api/${storeId}/auth/permissions`);
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        setPermissions(data.permissions);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [storeId]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  return {
    hasPermission,
    isLoading,
    error,
  };
};

// Predefined permission constants
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

// Helper type for permission values
export type PermissionValue = typeof Permissions[keyof typeof Permissions];

// Predefined roles with their permissions
export const DefaultRoles = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Complete access to all store features and settings',
    permissions: Object.values(Permissions),
  },
  STORE_ADMIN: {
    name: 'Store Admin',
    description: 'Full access to manage store operations, excluding staff and role management',
    permissions: [
      // Catalog
      Permissions.VIEW_TAXONOMIES, Permissions.MANAGE_TAXONOMIES,
      Permissions.VIEW_TAXONS, Permissions.MANAGE_TAXONS,
      Permissions.VIEW_PRODUCTS, Permissions.CREATE_PRODUCTS,
      Permissions.EDIT_PRODUCTS, Permissions.DELETE_PRODUCTS,
      Permissions.VIEW_VARIANTS, Permissions.CREATE_VARIANTS,
      Permissions.EDIT_VARIANTS, Permissions.DELETE_VARIANTS,
      // Orders & Customers
      Permissions.VIEW_ORDERS, Permissions.MANAGE_ORDERS,
      Permissions.VIEW_CUSTOMERS, Permissions.MANAGE_CUSTOMERS,
      // Settings & Store
      Permissions.VIEW_SETTINGS, Permissions.MANAGE_SETTINGS,
      Permissions.VIEW_STORE, Permissions.MANAGE_STORE,
      // Content
      Permissions.VIEW_LAYOUTS, Permissions.MANAGE_LAYOUTS,
      Permissions.VIEW_BILLBOARDS, Permissions.MANAGE_BILLBOARDS,
      // Analytics
      Permissions.VIEW_ANALYTICS, Permissions.MANAGE_ANALYTICS,
    ],
  },
  CATALOG_MANAGER: {
    name: 'Catalog Manager',
    description: 'Manage product catalog, categories, and attributes',
    permissions: [
      Permissions.VIEW_TAXONOMIES, Permissions.MANAGE_TAXONOMIES,
      Permissions.VIEW_TAXONS, Permissions.MANAGE_TAXONS,
      Permissions.VIEW_PRODUCTS, Permissions.CREATE_PRODUCTS,
      Permissions.EDIT_PRODUCTS, Permissions.DELETE_PRODUCTS,
      Permissions.VIEW_VARIANTS, Permissions.CREATE_VARIANTS,
      Permissions.EDIT_VARIANTS, Permissions.DELETE_VARIANTS,
      Permissions.VIEW_ATTRIBUTES, Permissions.MANAGE_ATTRIBUTES,
      Permissions.VIEW_OPTION_TYPES, Permissions.MANAGE_OPTION_TYPES,
      Permissions.VIEW_BRANDS, Permissions.MANAGE_BRANDS,
      Permissions.VIEW_SUPPLIERS, Permissions.MANAGE_SUPPLIERS,
    ],
  },
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    description: 'Manage product stock and inventory movements',
    permissions: [
      Permissions.VIEW_PRODUCTS,
      Permissions.VIEW_VARIANTS,
      Permissions.VIEW_STOCK, Permissions.MANAGE_STOCK,
      Permissions.VIEW_STOCK_MOVEMENTS, Permissions.MANAGE_STOCK_MOVEMENTS,
      Permissions.VIEW_SUPPLIERS,
    ],
  },
  ORDER_MANAGER: {
    name: 'Order Manager',
    description: 'Process orders and manage customer service',
    permissions: [
      Permissions.VIEW_ORDERS, Permissions.MANAGE_ORDERS,
      Permissions.VIEW_CUSTOMERS, Permissions.MANAGE_CUSTOMERS,
      Permissions.VIEW_PRODUCTS, Permissions.VIEW_STOCK,
      Permissions.VIEW_STOCK_MOVEMENTS,
    ],
  },
  CONTENT_MANAGER: {
    name: 'Content Manager',
    description: 'Manage store layouts, marketing content, and customer reviews',
    permissions: [
      Permissions.VIEW_LAYOUTS, Permissions.MANAGE_LAYOUTS,
      Permissions.VIEW_BILLBOARDS, Permissions.MANAGE_BILLBOARDS,
      Permissions.VIEW_REVIEWS, Permissions.MANAGE_REVIEWS,
      Permissions.VIEW_TAXONOMIES,
      Permissions.VIEW_PRODUCTS,
    ],
  },
  ANALYTICS_VIEWER: {
    name: 'Analytics Viewer',
    description: 'View store analytics and reports',
    permissions: [
      Permissions.VIEW_ANALYTICS,
      Permissions.VIEW_ORDERS,
      Permissions.VIEW_PRODUCTS,
      Permissions.VIEW_CUSTOMERS,
      Permissions.VIEW_STOCK,
    ],
  },
};
