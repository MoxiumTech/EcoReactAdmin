import { PrismaClient } from '@prisma/client';

const DefaultRoles = {
  STORE_ADMIN: {
    name: 'Store Admin',
    description: 'Full access to manage store operations',
    permissions: [
      // Catalog Structure
      'taxonomies:view', 'taxonomies:create', 'taxonomies:edit', 'taxonomies:delete', 'taxonomies:manage',
      'taxons:view', 'taxons:create', 'taxons:edit', 'taxons:delete', 'taxons:manage',
      
      // Products
      'products:view', 'products:create', 'products:edit', 'products:delete', 'products:manage',
      'variants:view', 'variants:create', 'variants:edit', 'variants:delete', 'variants:manage',
      
      // Orders & Customers
      'orders:view', 'orders:create', 'orders:edit', 'orders:delete', 'orders:manage',
      'customers:view', 'customers:create', 'customers:edit', 'customers:delete', 'customers:manage',
      
      // Settings & Staff
      'settings:view', 'settings:edit', 'settings:manage',
      'staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:manage',
      'roles:view', 'roles:create', 'roles:edit', 'roles:delete', 'roles:manage',
      
      // Store Management
      'store:view', 'store:edit', 'store:manage',
      
      // Content
      'layouts:view', 'layouts:create', 'layouts:edit', 'layouts:delete', 'layouts:manage',
      'billboards:view', 'billboards:create', 'billboards:edit', 'billboards:delete', 'billboards:manage',
      'reviews:view', 'reviews:create', 'reviews:edit', 'reviews:delete', 'reviews:manage',

      // Attributes & Properties
      'attributes:view', 'attributes:create', 'attributes:edit', 'attributes:delete', 'attributes:manage',
      'option-types:view', 'option-types:create', 'option-types:edit', 'option-types:delete', 'option-types:manage',
      
      // Inventory & Stock
      'stock:view', 'stock:create', 'stock:edit', 'stock:delete', 'stock:manage',
      'stock-movements:view', 'stock-movements:create', 'stock-movements:edit', 'stock-movements:delete', 'stock-movements:manage',
      'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete', 'inventory:manage',
      
      // Suppliers & Brands
      'suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete', 'suppliers:manage',
      'brands:view', 'brands:create', 'brands:edit', 'brands:delete', 'brands:manage',
      
      // Marketing & Analytics
      'promotions:view', 'promotions:create', 'promotions:edit', 'promotions:delete', 'promotions:manage',
      'discounts:view', 'discounts:create', 'discounts:edit', 'discounts:delete', 'discounts:manage',
      'analytics:view', 'analytics:export', 'analytics:manage',
      
      // Advanced Features
      'colors:view', 'colors:create', 'colors:edit', 'colors:delete', 'colors:manage',
      'sizes:view', 'sizes:create', 'sizes:edit', 'sizes:delete', 'sizes:manage',
      'configurations:view', 'configurations:edit', 'configurations:manage',
      'integrations:view', 'integrations:manage',
      'api:view', 'api:manage',
      'webhooks:view', 'webhooks:create', 'webhooks:edit', 'webhooks:delete', 'webhooks:manage',
      'documentation:view'
    ]
  },
  
  CATALOG_MANAGER: {
    name: 'Catalog Manager',
    description: 'Manage product catalog and inventory',
    permissions: [
      // Catalog Structure
      'taxonomies:view', 'taxonomies:create', 'taxonomies:edit', 'taxonomies:delete', 'taxonomies:manage',
      'taxons:view', 'taxons:create', 'taxons:edit', 'taxons:delete', 'taxons:manage',
      
      // Products & Variants
      'products:view', 'products:create', 'products:edit', 'products:delete', 'products:manage',
      'variants:view', 'variants:create', 'variants:edit', 'variants:delete', 'variants:manage',
      
      // Attributes & Properties
      'attributes:view', 'attributes:create', 'attributes:edit', 'attributes:delete', 'attributes:manage',
      'option-types:view', 'option-types:create', 'option-types:edit', 'option-types:delete', 'option-types:manage',
      'colors:view', 'colors:create', 'colors:edit', 'colors:delete', 'colors:manage',
      'sizes:view', 'sizes:create', 'sizes:edit', 'sizes:delete', 'sizes:manage',
      
      // Suppliers & Brands
      'suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete', 'suppliers:manage',
      'brands:view', 'brands:create', 'brands:edit', 'brands:delete', 'brands:manage'
    ]
  },
  
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    description: 'Manage product stock and inventory',
    permissions: [
      // Read-only Product Access
      'products:view',
      'variants:view',
      
      // Full Stock Management
      'stock:view', 'stock:create', 'stock:edit', 'stock:delete', 'stock:manage',
      'stock-movements:view', 'stock-movements:create', 'stock-movements:edit', 'stock-movements:delete', 'stock-movements:manage',
      'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete', 'inventory:manage',
      'inventory-locations:view', 'inventory-locations:create', 'inventory-locations:edit', 'inventory-locations:delete',
      
      // Supplier View
      'suppliers:view'
    ]
  },
  
  ORDER_MANAGER: {
    name: 'Order Manager',
    description: 'Process orders and manage customer service',
    permissions: [
      // Orders & Customers
      'orders:view', 'orders:create', 'orders:edit', 'orders:delete', 'orders:manage',
      'customers:view', 'customers:create', 'customers:edit', 'customers:delete', 'customers:manage',
      
      // Read-only Access
      'products:view',
      'variants:view',
      'stock:view',
      'stock-movements:view',
      
      // Reviews
      'reviews:view', 'reviews:manage'
    ]
  },
  
  CONTENT_MANAGER: {
    name: 'Content Manager',
    description: 'Manage store layouts, marketing content, and customer reviews',
    permissions: [
      // Content Management
      'layouts:view', 'layouts:create', 'layouts:edit', 'layouts:delete', 'layouts:manage',
      'billboards:view', 'billboards:create', 'billboards:edit', 'billboards:delete', 'billboards:manage',
      'reviews:view', 'reviews:create', 'reviews:edit', 'reviews:delete', 'reviews:manage',
      
      // Marketing
      'promotions:view', 'promotions:create', 'promotions:edit', 'promotions:delete', 'promotions:manage',
      'discounts:view', 'discounts:create', 'discounts:edit', 'discounts:delete', 'discounts:manage',
      
      // Read-only Access
      'taxonomies:view',
      'products:view'
    ]
  },
  
  ANALYTICS_VIEWER: {
    name: 'Analytics Viewer',
    description: 'View store analytics and reports',
    permissions: [
      // Analytics & Reports
      'analytics:view', 'analytics:export',
      'reports:view', 'reports:export',
      
      // Read-only Access
      'orders:view',
      'products:view',
      'customers:view',
      'stock:view',
      'stock-movements:view'
    ]
  }
};

export async function initializeStoreRoles(
  prisma: Pick<PrismaClient, 'permission' | 'role'>, 
  storeId: string
) {
  try {
    // Get all existing permissions
    const permissions = await prisma.permission.findMany();
    const permissionMap = new Map(permissions.map(p => [p.name, p]));

    // Create default roles for the store
    for (const [key, role] of Object.entries(DefaultRoles)) {
      const validPermissions = role.permissions
        .map(name => permissionMap.get(name))
        .filter(p => p !== undefined);

      await prisma.role.upsert({
        where: {
          name_storeId: {
            name: role.name,
            storeId: storeId
          }
        },
        update: {
          description: role.description,
          permissions: {
            connect: validPermissions.map(p => ({ id: p!.id }))
          }
        },
        create: {
          name: role.name,
          description: role.description,
          storeId: storeId,
          permissions: {
            connect: validPermissions.map(p => ({ id: p!.id }))
          }
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing store roles:', error);
    return false;
  }
}
