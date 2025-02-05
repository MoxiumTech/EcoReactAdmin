"use client";

import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const PermissionCategories = {
  catalog: {
    title: "Catalog Structure",
    permissions: ['taxonomies:view', 'taxonomies:manage', 'taxons:view', 'taxons:manage'],
    description: "Access to manage store's category structure and organization"
  },
  products: {
    title: "Product Management",
    permissions: ['products:view', 'products:create', 'products:edit', 'products:delete'],
    description: "Access to manage products and their details"
  },
  variants: {
    title: "Variant Management",
    permissions: ['variants:view', 'variants:create', 'variants:edit', 'variants:delete'],
    description: "Access to manage product variants and options"
  },
  orders: {
    title: "Order Management",
    permissions: ['orders:view', 'orders:manage'],
    description: "Access to view and manage customer orders"
  },
  customers: {
    title: "Customer Management",
    permissions: ['customers:view', 'customers:manage'],
    description: "Access to customer information and management"
  },
  settings: {
    title: "Settings",
    permissions: ['settings:view', 'settings:manage'],
    description: "Access to store settings and configuration"
  },
  roles: {
    title: "Role Management",
    permissions: ['roles:view', 'roles:manage'],
    description: "Access to manage staff roles and permissions"
  },
  attributes: {
    title: "Attribute Management",
    permissions: ['attributes:view', 'attributes:manage', 'option-types:view', 'option-types:manage'],
    description: "Access to manage product attributes and option types"
  },
  suppliers: {
    title: "Supplier Management",
    permissions: ['suppliers:view', 'suppliers:manage'],
    description: "Access to manage product suppliers"
  },
  store: {
    title: "Store Management",
    permissions: ['store:view', 'store:manage'],
    description: "Access to overall store management"
  },
  content: {
    title: "Content Management",
    permissions: [
      'layouts:view', 'layouts:manage',
      'billboards:view', 'billboards:manage',
      'reviews:view', 'reviews:manage'
    ],
    description: "Access to manage store content, layouts, and marketing"
  },
  categories: {
    title: "Category Management",
    permissions: ['categories:view', 'categories:manage'],
    description: "Access to manage store categories and taxonomy"
  },
  brands: {
    title: "Brand Management",
    permissions: ['brands:view', 'brands:manage'],
    description: "Access to manage product brands"
  },
  stock: {
    title: "Inventory Management",
    permissions: [
      'stock:view', 'stock:manage', 
      'stock-movements:view', 'stock-movements:manage'
    ],
    description: "Access to manage product stock levels and movements"
  },
  analytics: {
    title: "Analytics & Reports",
    permissions: ['analytics:view', 'analytics:manage'],
    description: "Access to view and manage store analytics and reports"
  }
};

interface PermissionDisplayProps {
  permissions: string[];
  showDetails?: boolean;
}

export const PermissionDisplay: React.FC<PermissionDisplayProps> = ({
  permissions,
  showDetails = false
}) => {
  // Group permissions by category
  const groupedPermissions = Object.entries(PermissionCategories).map(([key, category]) => {
    const categoryPermissions = permissions.filter(p => category.permissions.includes(p));
    return {
      key,
      title: category.title,
      description: category.description,
      permissions: categoryPermissions,
      hasView: categoryPermissions.some(p => p.endsWith(':view')),
      hasManage: categoryPermissions.some(p => p.endsWith(':manage'))
    };
  }).filter(category => category.permissions.length > 0);

  if (!showDetails) {
    return (
      <div className="flex flex-wrap gap-1">
        {groupedPermissions.map(category => (
          <TooltipProvider key={category.key}>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant={category.hasManage ? "default" : "secondary"}>
                  {category.title}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{category.description}</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  {category.hasManage ? "Full access" : "View only"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groupedPermissions.map(category => (
        <div key={category.key} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{category.title}</h3>
            <Badge variant={category.hasManage ? "default" : "secondary"}>
              {category.hasManage ? "Full Access" : "View Only"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
          <div className="mt-2">
            <h4 className="text-sm font-medium">Available Actions:</h4>
            <ul className="mt-1 text-sm text-muted-foreground">
              {category.permissions.map(permission => (
                <li key={permission} className="flex items-center gap-2">
                  • {permission.split(':')[1].charAt(0).toUpperCase() + permission.split(':')[1].slice(1)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};
