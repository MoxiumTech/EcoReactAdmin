import { PrismaClient } from '@prisma/client';
import { initializeStoreRoles } from '../../lib/init-store-roles';

const prisma = new PrismaClient();

const allPermissions = [
  // Catalog Structure
  'taxonomies:view', 'taxonomies:manage',
  'taxons:view', 'taxons:manage',
  
  // Products
  'products:view', 'products:create', 'products:edit', 'products:delete',
  'variants:view', 'variants:create', 'variants:edit', 'variants:delete',
  
  // Orders & Customers
  'orders:view', 'orders:manage',
  'customers:view', 'customers:manage',
  
  // Settings & Roles
  'settings:view', 'settings:manage',
  'roles:view', 'roles:manage',
  
  // Attributes & Options
  'attributes:view', 'attributes:manage',
  'option-types:view', 'option-types:manage',
  
  // Suppliers
  'suppliers:view', 'suppliers:manage',
  
  // Store Management
  'store:view', 'store:manage',
  
  // Content
  'layouts:view', 'layouts:manage',
  'billboards:view', 'billboards:manage',
  'reviews:view', 'reviews:manage',
  
  // Brands
  'brands:view', 'brands:manage',
  
  // Stock
  'stock:view', 'stock:manage',
  'stock-movements:view', 'stock-movements:manage',
  
  // Analytics
  'analytics:view', 'analytics:manage'
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
