export enum Permissions {
  // Catalog Management
  VIEW_PRODUCTS = "products:view",
  CREATE_PRODUCTS = "products:create",
  EDIT_PRODUCTS = "products:edit",
  DELETE_PRODUCTS = "products:delete",

  VIEW_VARIANTS = "variants:view",
  CREATE_VARIANTS = "variants:create",
  EDIT_VARIANTS = "variants:edit",
  DELETE_VARIANTS = "variants:delete",

  VIEW_ATTRIBUTES = "attributes:view",
  MANAGE_ATTRIBUTES = "attributes:manage",

  VIEW_OPTION_TYPES = "option-types:view",
  MANAGE_OPTION_TYPES = "option-types:manage",

  // Categories & Navigation
  VIEW_TAXONOMIES = "taxonomies:view",
  MANAGE_TAXONOMIES = "taxonomies:manage",
  VIEW_TAXONS = "taxons:view",
  MANAGE_TAXONS = "taxons:manage",

  // Content Management
  VIEW_BILLBOARDS = "billboards:view",
  MANAGE_BILLBOARDS = "billboards:manage",

  VIEW_COLORS = "colors:view",
  MANAGE_COLORS = "colors:manage",

  VIEW_SIZES = "sizes:view",
  MANAGE_SIZES = "sizes:manage",

  // Order Management
  VIEW_ORDERS = "orders:view",
  MANAGE_ORDERS = "orders:manage",

  // Inventory Management
  VIEW_STOCK = "stock:view",
  MANAGE_STOCK = "stock:manage",
  VIEW_STOCK_MOVEMENTS = "stock-movements:view",
  MANAGE_STOCK_MOVEMENTS = "stock-movements:manage",

  // Customer Management
  VIEW_CUSTOMERS = "customers:view",
  MANAGE_CUSTOMERS = "customers:manage",

  // Supplier Management
  VIEW_SUPPLIERS = "suppliers:view",
  MANAGE_SUPPLIERS = "suppliers:manage",

  // Analytics & Reviews
  VIEW_ANALYTICS = "analytics:view",
  MANAGE_ANALYTICS = "analytics:manage",
  VIEW_REVIEWS = "reviews:view",
  MANAGE_REVIEWS = "reviews:manage",

  // Store Management
  VIEW_SETTINGS = "settings:view",
  MANAGE_SETTINGS = "settings:manage",
  VIEW_STORE = "store:view",
  MANAGE_STORE = "store:manage",

  // Staff & Roles Management
  VIEW_STAFF = "staff:view",
  MANAGE_STAFF = "staff:manage",
  VIEW_ROLES = "roles:view",
  MANAGE_ROLES = "roles:manage",

  // Brand Management
  VIEW_BRANDS = "brands:view",
  MANAGE_BRANDS = "brands:manage",

  // Layout Management
  VIEW_LAYOUTS = "layouts:view",
  MANAGE_LAYOUTS = "layouts:manage",

  // Documentation Access
  VIEW_DOCUMENTATION = "documentation:view"
}
