import { PrismaClient } from '@prisma/client';
import { initializeStoreRoles } from '../../lib/init-store-roles';

const prisma = new PrismaClient();

const allPermissions = [
  // Catalog Structure
  'taxonomies:view', 'taxonomies:create', 'taxonomies:edit', 'taxonomies:delete', 'taxonomies:manage',
  'taxons:view', 'taxons:create', 'taxons:edit', 'taxons:delete', 'taxons:manage',
  
  // Products
  'products:view', 'products:create', 'products:edit', 'products:delete', 'products:manage',
  'variants:view', 'variants:create', 'variants:edit', 'variants:delete', 'variants:manage',
  
  // Orders & Customers
  'orders:view', 'orders:create', 'orders:edit', 'orders:delete', 'orders:manage',
  'customers:view', 'customers:create', 'customers:edit', 'customers:delete', 'customers:manage',
  
  // Settings & Roles
  'settings:view', 'settings:edit', 'settings:manage',
  'staff:view', 'staff:create', 'staff:edit', 'staff:delete', 'staff:manage',
  'roles:view', 'roles:create', 'roles:edit', 'roles:delete', 'roles:manage',
  
  // Attributes & Options
  'attributes:view', 'attributes:create', 'attributes:edit', 'attributes:delete', 'attributes:manage',
  'option-types:view', 'option-types:create', 'option-types:edit', 'option-types:delete', 'option-types:manage',
  
  // Suppliers
  'suppliers:view', 'suppliers:create', 'suppliers:edit', 'suppliers:delete', 'suppliers:manage',
  
  // Store Management
  'store:view', 'store:edit', 'store:manage',
  
  // Content
  'layouts:view', 'layouts:create', 'layouts:edit', 'layouts:delete', 'layouts:manage',
  'billboards:view', 'billboards:create', 'billboards:edit', 'billboards:delete', 'billboards:manage',
  'reviews:view', 'reviews:create', 'reviews:edit', 'reviews:delete', 'reviews:manage',
  
  // Brands
  'brands:view', 'brands:create', 'brands:edit', 'brands:delete', 'brands:manage',
  
  // Stock
  'stock:view', 'stock:create', 'stock:edit', 'stock:delete', 'stock:manage',
  'stock-movements:view', 'stock-movements:create', 'stock-movements:edit', 'stock-movements:delete', 'stock-movements:manage',
  
  // Analytics
  'analytics:view', 'analytics:export', 'analytics:manage',
  
  // Additional Features
  'colors:view', 'colors:create', 'colors:edit', 'colors:delete', 'colors:manage',
  'sizes:view', 'sizes:create', 'sizes:edit', 'sizes:delete', 'sizes:manage',
  'documentation:view',
  
  // Inventory
  'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete', 'inventory:manage',
  'inventory-locations:view', 'inventory-locations:create', 'inventory-locations:edit', 'inventory-locations:delete',
  
  // Marketing
  'promotions:view', 'promotions:create', 'promotions:edit', 'promotions:delete', 'promotions:manage',
  'discounts:view', 'discounts:create', 'discounts:edit', 'discounts:delete', 'discounts:manage',
  
  // Reports
  'reports:view', 'reports:create', 'reports:export', 'reports:manage',
  
  // API & Integration
  'api:view', 'api:manage',
  'webhooks:view', 'webhooks:create', 'webhooks:edit', 'webhooks:delete', 'webhooks:manage',
  
  // Advanced Settings
  'configurations:view', 'configurations:edit', 'configurations:manage',
  'integrations:view', 'integrations:manage'
];

async function main() {
  console.log('Seeding default permissions...');

  // Create all permissions first
  for (const name of allPermissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: {
        name,
        description: name.split(':').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }
    });
  }
  console.log('Created permissions');

  // Initialize roles for any existing stores
  const stores = await prisma.store.findMany();
  for (const store of stores) {
    console.log(`Initializing roles for store ${store.name}...`);
    await initializeStoreRoles(prisma, store.id);
  }
  console.log('Finished initializing roles for all stores');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
