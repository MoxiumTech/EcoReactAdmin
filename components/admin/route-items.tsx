"use client";

import { usePathname, useParams } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRBAC, Permissions } from "@/hooks/use-rbac";
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

// Helper function to check if a user has access to a route based on permissions
function hasRouteAccess(route: string, isOwner: boolean, hasPermission: (permission: string) => boolean): boolean {
  if (isOwner) return true;

  // Map routes to required permissions
  const routePermissions: Record<string, string> = {
    // Catalog
    '/taxonomies': Permissions.VIEW_TAXONOMIES,
    '/taxons': Permissions.VIEW_TAXONS,
    '/products': Permissions.VIEW_PRODUCTS,
    '/variants': Permissions.VIEW_VARIANTS,
    '/brands': Permissions.VIEW_BRANDS,
    '/suppliers': Permissions.VIEW_SUPPLIERS,
    
    // Attributes & Properties
    '/attributes': Permissions.VIEW_ATTRIBUTES,
    '/attribute-values': Permissions.VIEW_ATTRIBUTES,
    '/option-types': Permissions.VIEW_OPTION_TYPES,
    
    // Inventory
    '/stock-items': Permissions.VIEW_STOCK,
    '/stock-movements': Permissions.VIEW_STOCK_MOVEMENTS,
    
    // Sales
    '/orders': Permissions.VIEW_ORDERS,
    '/customers': Permissions.VIEW_CUSTOMERS,
    
    // Content
    '/layouts': Permissions.VIEW_LAYOUTS,
    '/billboards': Permissions.VIEW_BILLBOARDS,
    '/reviews': Permissions.VIEW_REVIEWS,
    
    // Documentation
    '/documentation': Permissions.VIEW_STORE,
    
    // Settings
    '/settings': Permissions.VIEW_SETTINGS,
    '/staff': Permissions.MANAGE_ROLES,
    '/roles': Permissions.MANAGE_ROLES,
    
    // Analytics (for future use)
    '/analytics': Permissions.VIEW_ANALYTICS
  };

  // Find matching route permission
  for (const [routePath, permission] of Object.entries(routePermissions)) {
    if (route.includes(routePath)) {
      return hasPermission(permission);
    }
  }

  return false;
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
  const { hasPermission } = useRBAC(params.storeId);

  // Filter routes based on permissions
  const filteredRoutes = routes.reduce<RouteItem[]>((acc, route) => {
    // Always allow overview for everyone
    if (route.href?.endsWith(`/${params.storeId}`)) {
      acc.push(route);
      return acc;
    }

    // If it's a single route
    if (route.href) {
      if (hasRouteAccess(route.href, isOwner, hasPermission)) {
        acc.push(route);
      }
      return acc;
    }
    
    // If it has subitems, filter those
    if (route.items) {
      const accessibleItems = route.items.filter(item => 
        hasRouteAccess(item.href, isOwner, hasPermission)
      );
      
      // Only include the category if it has accessible items
      if (accessibleItems.length > 0) {
        acc.push({
          ...route,
          items: accessibleItems
        });
      }
    }
    
    return acc;
  }, []);

  return filteredRoutes;
}

export type { MenuItem, RouteItem };
