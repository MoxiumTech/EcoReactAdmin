"use client";

import { useEffect, useState, useCallback } from 'react';
import { Permission, Role } from '@/types/role';
import { toast } from "react-hot-toast";
import { Permissions } from "@/types/permissions";

// Cache permissions in memory
let permissionsCache: {
  [storeId: string]: {
    permissions: string[];
    timestamp: number;
  }
} = {};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export interface UserPermissions {
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
  error: Error | null;
}

export const useRBAC = (storeId: string): UserPermissions => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const hasPermission = useCallback((permission: string): boolean => {
    console.log('Checking permission:', permission, 'Has permissions:', permissions); // Debug log
    if (!permissions || permissions.length === 0) {
      console.warn('No permissions loaded yet');
      return false;
    }
    return permissions.includes(permission);
  }, [permissions]);

  useEffect(() => {
    const fetchPermissions = async () => {
      // Check cache first
      const cached = permissionsCache[storeId];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('Using cached permissions:', cached.permissions); // Debug log
        setPermissions(cached.permissions);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching permissions for store:', storeId); // Debug log
        const response = await fetch(`/api/${storeId}/auth/permissions`);
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        
        // Ensure data.permissions exists and is an array
        if (!data.permissions || !Array.isArray(data.permissions)) {
          console.error('Invalid permissions data:', data);
          throw new Error('Invalid permissions format received');
        }

        console.log('Fetched permissions:', data.permissions); // Debug log
        
        // Update cache
        permissionsCache[storeId] = {
          permissions: data.permissions,
          timestamp: Date.now()
        };
        
        setPermissions(data.permissions);
      } catch (err) {
        console.error("Failed to load permissions:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        // Clear permissions on error to prevent access with stale permissions
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (storeId) {
      console.log('Initializing permission fetch for store:', storeId); // Debug log
      fetchPermissions();
    } else {
      console.warn('No storeId provided to useRBAC'); // Debug log
      setPermissions([]);
      setIsLoading(false);
    }
  }, [storeId]);

  return {
    hasPermission,
    isLoading,
    error,
  };
};

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
