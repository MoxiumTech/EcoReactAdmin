import { PermissionCategories } from "./types";

export const permissionCategories: PermissionCategories = {
  core: {
    label: "Core Features",
    description: "Essential store management features",
    expandedByDefault: true,
    permissions: [
      { id: "store:view", label: "View Store", description: "Access store dashboard" },
      { id: "store:edit", label: "Edit Store", description: "Modify store settings" },
      { id: "store:manage", label: "Manage Store", description: "Full store control" },
    ]
  },
  catalog: {
    label: "Catalog Management",
    description: "Products, variants, categories, and attributes",
    expandedByDefault: true,
    permissions: [
      // Products
      { id: "products:view", label: "View Products", description: "View product details" },
      { id: "products:create", label: "Create Products", description: "Add new products" },
      { id: "products:edit", label: "Edit Products", description: "Modify products" },
      { id: "products:delete", label: "Delete Products", description: "Remove products" },
      { id: "products:manage", label: "Manage Products", description: "Full product control" },
      // Variants
      { id: "variants:view", label: "View Variants", description: "View variants" },
      { id: "variants:create", label: "Create Variants", description: "Add variants" },
      { id: "variants:edit", label: "Edit Variants", description: "Modify variants" },
      { id: "variants:delete", label: "Delete Variants", description: "Remove variants" },
      { id: "variants:manage", label: "Manage Variants", description: "Full variant control" },
      // Categories
      { id: "taxonomies:view", label: "View Categories", description: "View categories" },
      { id: "taxonomies:create", label: "Create Categories", description: "Add categories" },
      { id: "taxonomies:edit", label: "Edit Categories", description: "Modify categories" },
      { id: "taxonomies:delete", label: "Delete Categories", description: "Remove categories" },
      { id: "taxonomies:manage", label: "Manage Categories", description: "Full category control" },
      // Attributes
      { id: "attributes:view", label: "View Attributes", description: "View attributes" },
      { id: "attributes:create", label: "Create Attributes", description: "Add attributes" },
      { id: "attributes:edit", label: "Edit Attributes", description: "Modify attributes" },
      { id: "attributes:delete", label: "Delete Attributes", description: "Remove attributes" },
      { id: "attributes:manage", label: "Manage Attributes", description: "Full attribute control" }
    ]
  },
  properties: {
    label: "Properties & Options",
    description: "Product options and properties",
    permissions: [
      { id: "option-types:view", label: "View Options", description: "View option types" },
      { id: "option-types:create", label: "Create Options", description: "Add option types" },
      { id: "option-types:edit", label: "Edit Options", description: "Modify option types" },
      { id: "option-types:delete", label: "Delete Options", description: "Remove option types" },
      { id: "option-types:manage", label: "Manage Options", description: "Full option control" },
      // Colors
      { id: "colors:view", label: "View Colors", description: "View color options" },
      { id: "colors:create", label: "Create Colors", description: "Add colors" },
      { id: "colors:edit", label: "Edit Colors", description: "Modify colors" },
      { id: "colors:delete", label: "Delete Colors", description: "Remove colors" },
      { id: "colors:manage", label: "Manage Colors", description: "Full color control" },
      // Sizes
      { id: "sizes:view", label: "View Sizes", description: "View size options" },
      { id: "sizes:create", label: "Create Sizes", description: "Add sizes" },
      { id: "sizes:edit", label: "Edit Sizes", description: "Modify sizes" },
      { id: "sizes:delete", label: "Delete Sizes", description: "Remove sizes" },
      { id: "sizes:manage", label: "Manage Sizes", description: "Full size control" }
    ]
  },
  inventory: {
    label: "Inventory Management",
    description: "Stock management and tracking",
    permissions: [
      // Stock
      { id: "stock:view", label: "View Stock", description: "View stock levels" },
      { id: "stock:create", label: "Create Stock", description: "Add stock" },
      { id: "stock:edit", label: "Edit Stock", description: "Modify stock" },
      { id: "stock:delete", label: "Delete Stock", description: "Remove stock" },
      { id: "stock:manage", label: "Manage Stock", description: "Full stock control" },
      // Stock Movements
      { id: "stock-movements:view", label: "View Movements", description: "View movements" },
      { id: "stock-movements:create", label: "Create Movements", description: "Record movements" },
      { id: "stock-movements:edit", label: "Edit Movements", description: "Modify movements" },
      { id: "stock-movements:delete", label: "Delete Movements", description: "Remove movements" },
      { id: "stock-movements:manage", label: "Manage Movements", description: "Full movement control" }
    ]
  },
  sales: {
    label: "Sales Management",
    description: "Orders and customer management",
    permissions: [
      // Orders
      { id: "orders:view", label: "View Orders", description: "View orders" },
      { id: "orders:create", label: "Create Orders", description: "Create orders" },
      { id: "orders:edit", label: "Edit Orders", description: "Modify orders" },
      { id: "orders:delete", label: "Delete Orders", description: "Remove orders" },
      { id: "orders:manage", label: "Manage Orders", description: "Full order control" },
      // Customers
      { id: "customers:view", label: "View Customers", description: "View customers" },
      { id: "customers:create", label: "Create Customers", description: "Add customers" },
      { id: "customers:edit", label: "Edit Customers", description: "Modify customers" },
      { id: "customers:delete", label: "Delete Customers", description: "Remove customers" },
      { id: "customers:manage", label: "Manage Customers", description: "Full customer control" }
    ]
  },
  content: {
    label: "Content Management",
    description: "Store content and layouts",
    permissions: [
      // Layouts
      { id: "layouts:view", label: "View Layouts", description: "View layouts" },
      { id: "layouts:create", label: "Create Layouts", description: "Add layouts" },
      { id: "layouts:edit", label: "Edit Layouts", description: "Modify layouts" },
      { id: "layouts:delete", label: "Delete Layouts", description: "Remove layouts" },
      { id: "layouts:manage", label: "Manage Layouts", description: "Full layout control" },
      // Billboards
      { id: "billboards:view", label: "View Billboards", description: "View billboards" },
      { id: "billboards:create", label: "Create Billboards", description: "Add billboards" },
      { id: "billboards:edit", label: "Edit Billboards", description: "Modify billboards" },
      { id: "billboards:delete", label: "Delete Billboards", description: "Remove billboards" },
      { id: "billboards:manage", label: "Manage Billboards", description: "Full billboard control" }
    ]
  },
  marketing: {
    label: "Marketing & Promotions",
    description: "Marketing and promotional features",
    permissions: [
      // Promotions
      { id: "promotions:view", label: "View Promotions", description: "View promotions" },
      { id: "promotions:create", label: "Create Promotions", description: "Add promotions" },
      { id: "promotions:edit", label: "Edit Promotions", description: "Modify promotions" },
      { id: "promotions:delete", label: "Delete Promotions", description: "Remove promotions" },
      { id: "promotions:manage", label: "Manage Promotions", description: "Full promotion control" },
      // Discounts
      { id: "discounts:view", label: "View Discounts", description: "View discounts" },
      { id: "discounts:create", label: "Create Discounts", description: "Add discounts" },
      { id: "discounts:edit", label: "Edit Discounts", description: "Modify discounts" },
      { id: "discounts:delete", label: "Delete Discounts", description: "Remove discounts" },
      { id: "discounts:manage", label: "Manage Discounts", description: "Full discount control" }
    ]
  },
  staff: {
    label: "Staff & Access",
    description: "Staff and role management",
    permissions: [
      // Staff
      { id: "staff:view", label: "View Staff", description: "View staff members" },
      { id: "staff:create", label: "Add Staff", description: "Invite staff" },
      { id: "staff:edit", label: "Edit Staff", description: "Modify staff" },
      { id: "staff:delete", label: "Remove Staff", description: "Remove staff" },
      { id: "staff:manage", label: "Manage Staff", description: "Full staff control" },
      // Roles
      { id: "roles:view", label: "View Roles", description: "View roles" },
      { id: "roles:create", label: "Create Roles", description: "Create roles" },
      { id: "roles:edit", label: "Edit Roles", description: "Modify roles" },
      { id: "roles:delete", label: "Delete Roles", description: "Remove roles" },
      { id: "roles:manage", label: "Manage Roles", description: "Full role control" }
    ]
  },
  settings: {
    label: "Settings & Configuration",
    description: "System settings and configuration",
    permissions: [
      { id: "settings:view", label: "View Settings", description: "View settings" },
      { id: "settings:edit", label: "Edit Settings", description: "Modify settings" },
      { id: "settings:manage", label: "Manage Settings", description: "Full settings control" }
    ]
  },
  analytics: {
    label: "Analytics & Reports",
    description: "Analytics and reporting tools",
    permissions: [
      { id: "analytics:view", label: "View Analytics", description: "View analytics" },
      { id: "analytics:export", label: "Export Analytics", description: "Export data" },
      { id: "analytics:manage", label: "Manage Analytics", description: "Full analytics access" },
      { id: "reports:view", label: "View Reports", description: "View reports" },
      { id: "reports:create", label: "Create Reports", description: "Generate reports" },
      { id: "reports:export", label: "Export Reports", description: "Export reports" },
      { id: "reports:manage", label: "Manage Reports", description: "Full report access" }
    ]
  }
};
