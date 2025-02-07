import { PrismaClient } from '@prisma/client';

const DefaultRoles = {
  STORE_ADMIN: {
    name: 'Store Admin',
    description: 'Full access to manage store operations',
    permissions: [
      'taxonomies:view', 'taxonomies:manage',
      'taxons:view', 'taxons:manage',
      'products:view', 'products:create',
      'products:edit', 'products:delete',
      'variants:view', 'variants:create',
      'variants:edit', 'variants:delete',
      'orders:view', 'orders:manage',
      'customers:view', 'customers:manage',
      'settings:view', 'settings:manage',
      'store:view', 'store:manage',
      'layouts:view', 'layouts:manage',
      'billboards:view', 'billboards:manage',
      'analytics:view', 'analytics:manage'
    ]
  },
  CATALOG_MANAGER: {
    name: 'Catalog Manager',
    description: 'Manage product catalog and inventory',
    permissions: [
      'taxonomies:view', 'taxonomies:manage',
      'taxons:view', 'taxons:manage',
      'products:view', 'products:create',
      'products:edit', 'products:delete',
      'variants:view', 'variants:create',
      'variants:edit', 'variants:delete',
      'attributes:view', 'attributes:manage',
      'option-types:view', 'option-types:manage',
      'brands:view', 'brands:manage',
      'suppliers:view', 'suppliers:manage'
    ]
  },
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    description: 'Manage product stock and inventory',
    permissions: [
      'products:view',
      'variants:view',
      'stock:view', 'stock:manage',
      'stock-movements:view', 'stock-movements:manage',
      'suppliers:view'
    ]
  },
  ORDER_MANAGER: {
    name: 'Order Manager',
    description: 'Process orders and manage customer service',
    permissions: [
      'orders:view', 'orders:manage',
      'customers:view', 'customers:manage',
      'products:view', 'stock:view',
      'stock-movements:view'
    ]
  },
  CONTENT_MANAGER: {
    name: 'Content Manager',
    description: 'Manage store layouts, marketing content, and customer reviews',
    permissions: [
      'layouts:view', 'layouts:manage',
      'billboards:view', 'billboards:manage',
      'reviews:view', 'reviews:manage',
      'taxonomies:view',
      'products:view'
    ]
  },
  ANALYTICS_VIEWER: {
    name: 'Analytics Viewer',
    description: 'View store analytics and reports',
    permissions: [
      'analytics:view',
      'orders:view',
      'products:view',
      'customers:view',
      'stock:view'
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
