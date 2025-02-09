"use client";

import { usePathname, useParams } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRBAC } from "@/hooks/use-rbac";
import { Permissions } from "@/types/permissions";
import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Layers,
  Tags,
  Building2,
  Truck,
  ListChecks,
  ShoppingBag,
  Box,
  FileText,
  Grid,
  Image,
  MessageSquare,
  ArrowLeftRight,
  FolderTree,
  FileQuestion,
  LayoutTemplate,
} from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  active: boolean;
  icon?: React.ReactNode;
};

type RouteItem = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  active?: boolean;
  items?: MenuItem[];
};

interface UseRouteItemsProps {
  isOwner: boolean;
  role?: {
    name: string;
    id: string;
    description?: string | null;
  };
}

// Map routes to required permissions with read/write distinction
const routePermissions: Record<string, {
  view: string;
  manage?: string;
}> = {
  // Catalog
  '/taxonomies': {
    view: 'taxonomies:view',
    manage: 'taxonomies:manage'
  },
  '/taxons': {
    view: 'taxons:view',
    manage: 'taxons:manage'
  },
  '/products': {
    view: 'products:view',
    manage: 'products:create'
  },
  '/variants': {
    view: 'variants:view',
    manage: 'variants:create'
  },
  '/brands': {
    view: 'brands:view',
    manage: 'brands:manage'
  },
  '/suppliers': {
    view: 'suppliers:view',
    manage: 'suppliers:manage'
  },
  
  // Attributes & Properties
  '/attributes': {
    view: 'attributes:view',
    manage: 'attributes:manage'
  },
  '/attribute-values': {
    view: 'attributes:view',
    manage: 'attributes:manage'
  },
  '/option-types': {
    view: 'option-types:view',
    manage: 'option-types:manage'
  },
  
  // Inventory
  '/stock-items': {
    view: 'stock:view',
    manage: 'stock:manage'
  },
  '/stock-movements': {
    view: 'stock-movements:view',
    manage: 'stock-movements:manage'
  },
  
  // Sales
  '/orders': {
    view: 'orders:view',
    manage: 'orders:manage'
  },
  '/customers': {
    view: 'customers:view',
    manage: 'customers:manage'
  },
  
  // Content
  '/layouts': {
    view: 'layouts:view',
    manage: 'layouts:manage'
  },
  '/billboards': {
    view: 'billboards:view',
    manage: 'billboards:manage'
  },
  '/reviews': {
    view: 'reviews:view',
    manage: 'reviews:manage'
  },
  
  // Documentation
  '/documentation': {
    view: 'store:view'
  },
  
  // Settings
  '/settings': {
    view: 'settings:view',
    manage: 'settings:manage'
  },
  '/staff': {
    view: 'staff:view',
    manage: 'staff:manage'
  },
  '/roles': {
    view: 'roles:view',
    manage: 'roles:manage'
  },
  '/promotions': {
    view: 'promotions:view',
    manage: 'promotions:manage'
  }
};

// Helper function to check if a user has access to a route based on permissions
function hasRouteAccess(
  route: string, 
  isOwner: boolean, 
  hasPermission: (permission: string) => boolean,
  requireManage: boolean = false
): boolean {
  if (isOwner) return true;

  // Find matching route permissions
  for (const [routePath, permissions] of Object.entries(routePermissions)) {
    if (route.includes(routePath)) {
      // Get base permission name (e.g., 'products' from '/products')
      const basePermission = routePath.replace('/', '');
      
      if (requireManage) {
        // Check for specific action permissions first
        const hasCreate = hasPermission(`${basePermission}:create`);
        const hasEdit = hasPermission(`${basePermission}:edit`);
        const hasDelete = hasPermission(`${basePermission}:delete`);
        const hasManage = hasPermission(`${basePermission}:manage`);
        
        // For management actions, need either specific permissions or manage permission
        const hasActionPermissions = hasCreate || hasEdit || hasDelete || hasManage;
        
        console.log(`Route ${route} manage check:`, { 
          hasCreate, hasEdit, hasDelete, hasManage,
          hasActionPermissions
        });
        
        return hasPermission(permissions.view) && hasActionPermissions;
      }
      
      // For viewing, check both view permission and any management permissions
      const hasView = hasPermission(permissions.view);
      const hasAnyManagement = hasPermission(`${basePermission}:manage`) || 
                              hasPermission(`${basePermission}:create`) ||
                              hasPermission(`${basePermission}:edit`) ||
                              hasPermission(`${basePermission}:delete`);
      
      console.log(`Route ${route} view check:`, { 
        hasView, 
        hasAnyManagement,
        basePermission
      });
      
      return hasView || hasAnyManagement;
    }
  }

  // If no specific permissions are found and user is not owner
  console.log(`No permissions found for route: ${route}`);
  return false;
}

// Helper to determine if route requires management permissions
function isManagementRoute(pathname: string): boolean {
  const managementPatterns = [
    '/create',
    '/edit',
    '/delete',
    '/manage',
    '/new',
    '/update'
  ];
  
  return managementPatterns.some(pattern => pathname.includes(pattern));
}

export function useRouteItems({ isOwner }: UseRouteItemsProps) {
  const pathname = usePathname();
  const params = useParams() as { storeId: string };
  const [routes] = useState<RouteItem[]>(() => [
    {
      label: "Overview",
      icon: LayoutDashboard,
      href: `/${params.storeId}`,
      active: pathname === `/${params.storeId}`,
    },
    {
      label: "Catalog",
      icon: Package,
      items: [
        {
          label: "Products",
          href: `/${params.storeId}/products`,
          active: pathname === `/${params.storeId}/products`,
          icon: <ShoppingBag className="h-4 w-4" />
        },
        {
          label: "Variants",
          href: `/${params.storeId}/variants`,
          active: pathname === `/${params.storeId}/variants`,
          icon: <Box className="h-4 w-4" />
        },
        {
          label: "Taxonomies",
          href: `/${params.storeId}/taxonomies`,
          active: pathname === `/${params.storeId}/taxonomies`,
          icon: <Layers className="h-4 w-4" />
        },
        {
          label: "Taxons",
          href: `/${params.storeId}/taxons`,
          active: pathname === `/${params.storeId}/taxons`,
          icon: <FolderTree className="h-4 w-4" />
        },
        {
          label: "Brands",
          href: `/${params.storeId}/brands`,
          active: pathname === `/${params.storeId}/brands`,
          icon: <Building2 className="h-4 w-4" />
        },
        {
          label: "Suppliers",
          href: `/${params.storeId}/suppliers`,
          active: pathname === `/${params.storeId}/suppliers`,
          icon: <Truck className="h-4 w-4" />
        },
      ],
    },
    {
      label: "Attributes & Properties",
      icon: Tags,
      items: [
        {
          label: "Attributes",
          href: `/${params.storeId}/attributes`,
          active: pathname === `/${params.storeId}/attributes`,
          icon: <ListChecks className="h-4 w-4" />
        },
        {
          label: "Attribute Values",
          href: `/${params.storeId}/attribute-values`,
          active: pathname === `/${params.storeId}/attribute-values`,
          icon: <Tags className="h-4 w-4" />
        },
        {
          label: "Option Types",
          href: `/${params.storeId}/option-types`,
          active: pathname === `/${params.storeId}/option-types`,
          icon: <Grid className="h-4 w-4" />
        },
      ]
    },
    {
      label: "Inventory",
      icon: Package,
      items: [
        {
          label: "Stock Items",
          href: `/${params.storeId}/stock-items`,
          active: pathname === `/${params.storeId}/stock-items`,
          icon: <Package className="h-4 w-4" />
        },
        {
          label: "Stock Movements",
          href: `/${params.storeId}/stock-movements`,
          active: pathname === `/${params.storeId}/stock-movements`,
          icon: <ArrowLeftRight className="h-4 w-4" />
        },
      ]
    },
    {
      label: "Sales",
      icon: ShoppingCart,
      items: [
        {
          label: "Orders",
          href: `/${params.storeId}/orders`,
          active: pathname === `/${params.storeId}/orders`,
          icon: <ShoppingCart className="h-4 w-4" />
        },
        {
          label: "Customers",
          href: `/${params.storeId}/customers`,
          active: pathname === `/${params.storeId}/customers`,
          icon: <Users className="h-4 w-4" />
        },
        {
          label: "Promotions",
          href: `/${params.storeId}/promotions`,
          active: pathname === `/${params.storeId}/promotions`,
          icon: <Tags className="h-4 w-4" />
        },
      ]
    },
    {
      label: "Content",
      icon: FileText,
      items: [
        {
          label: "Home Layouts",
          href: `/${params.storeId}/layouts`,
          active: pathname === `/${params.storeId}/layouts`,
          icon: <LayoutTemplate className="h-4 w-4" />
        },
        {
          label: "Billboards",
          href: `/${params.storeId}/billboards`,
          active: pathname === `/${params.storeId}/billboards`,
          icon: <Image className="h-4 w-4" />
        },
        {
          label: "Reviews",
          href: `/${params.storeId}/reviews`,
          active: pathname === `/${params.storeId}/reviews`,
          icon: <MessageSquare className="h-4 w-4" />
        },
      ]
    },
    {
      label: "Documentation",
      icon: FileQuestion,
      items: [
        {
          label: "API Reference",
          href: `/${params.storeId}/documentation`,
          active: pathname === `/${params.storeId}/documentation`,
          icon: <FileQuestion className="h-4 w-4" />
        }
      ]
    },
    {
      label: "Settings",
      icon: Settings,
      items: [
        {
          label: "General Settings",
          href: `/${params.storeId}/settings`,
          active: pathname === `/${params.storeId}/settings`,
          icon: <Settings className="h-4 w-4" />
        },
        {
          label: "Staff Management",
          href: `/${params.storeId}/staff`,
          active: pathname === `/${params.storeId}/staff`,
          icon: <Users className="h-4 w-4" />
        },
        {
          label: "Roles & Permissions",
          href: `/${params.storeId}/roles`,
          active: pathname === `/${params.storeId}/roles`,
          icon: <Users className="h-4 w-4" />
        }
      ]
    },
  ]);

  // Get permission check function from RBAC hook
  const { hasPermission, isLoading, error } = useRBAC(params.storeId);

  // Filter routes based on permissions
  const filteredRoutes = routes.reduce<RouteItem[]>((acc, route) => {
    try {
      // Always allow overview for everyone
      if (route.href?.endsWith(`/${params.storeId}`)) {
        acc.push(route);
        return acc;
      }

      // Skip route processing if RBAC is still loading or has error
      if (isLoading || error) {
        console.log('RBAC state:', { isLoading, error }); // Debug log
        return acc;
      }

      // Debug logging for user status
      console.log('Processing route access:', {
        route: route.label,
        isOwner,
        href: route.href
      });

      // If it's a single route
      if (route.href) {
        const requiresManage = isManagementRoute(pathname);
        if (hasRouteAccess(route.href, isOwner, hasPermission, requiresManage)) {
          acc.push(route);
        }
        return acc;
      }
      
      // If it has subitems, filter those
      if (route.items) {
        const accessibleItems = route.items.filter(item => {
          const requiresManage = isManagementRoute(item.href);
          const hasAccess = hasRouteAccess(item.href, isOwner, hasPermission, requiresManage);
          console.log(`Subitem ${item.label} access:`, { hasAccess, requiresManage }); // Debug log
          return hasAccess;
        });
        
        // Only include the category if it has accessible items
        if (accessibleItems.length > 0) {
          acc.push({
            ...route,
            items: accessibleItems
          });
        }
      }
      
      return acc;
    } catch (err) {
      console.error('Error processing route permissions:', err);
      return acc;
    }
  }, []);

  // Debug log final routes
  console.log('Final filtered routes:', filteredRoutes.map(r => ({
    label: r.label,
    items: r.items?.length || 0
  })));

  // If RBAC is loading, return only the overview route
  if (isLoading) {
    console.log('RBAC is loading, showing only overview'); // Debug log
    return routes.filter(route => route.href?.endsWith(`/${params.storeId}`));
  }

  // If there's an RBAC error, return only the overview route
  if (error) {
    console.error('RBAC Error:', error);
    return routes.filter(route => route.href?.endsWith(`/${params.storeId}`));
  }

  return filteredRoutes;
}

export type { MenuItem, RouteItem };
