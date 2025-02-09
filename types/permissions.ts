export enum Permissions {
  // Catalog Structure
  VIEW_TAXONOMIES = "taxonomies:view",
  CREATE_TAXONOMIES = "taxonomies:create",
  EDIT_TAXONOMIES = "taxonomies:edit",
  DELETE_TAXONOMIES = "taxonomies:delete",
  MANAGE_TAXONOMIES = "taxonomies:manage",

  VIEW_TAXONS = "taxons:view",
  CREATE_TAXONS = "taxons:create",
  EDIT_TAXONS = "taxons:edit",
  DELETE_TAXONS = "taxons:delete",
  MANAGE_TAXONS = "taxons:manage",

  // Products
  VIEW_PRODUCTS = "products:view",
  CREATE_PRODUCTS = "products:create",
  EDIT_PRODUCTS = "products:edit",
  DELETE_PRODUCTS = "products:delete",
  MANAGE_PRODUCTS = "products:manage",

  VIEW_VARIANTS = "variants:view",
  CREATE_VARIANTS = "variants:create",
  EDIT_VARIANTS = "variants:edit",
  DELETE_VARIANTS = "variants:delete",
  MANAGE_VARIANTS = "variants:manage",

  // Orders & Customers
  VIEW_ORDERS = "orders:view",
  CREATE_ORDERS = "orders:create",
  EDIT_ORDERS = "orders:edit",
  DELETE_ORDERS = "orders:delete",
  MANAGE_ORDERS = "orders:manage",

  VIEW_CUSTOMERS = "customers:view",
  CREATE_CUSTOMERS = "customers:create",
  EDIT_CUSTOMERS = "customers:edit",
  DELETE_CUSTOMERS = "customers:delete",
  MANAGE_CUSTOMERS = "customers:manage",

  // Settings & Roles
  VIEW_SETTINGS = "settings:view",
  EDIT_SETTINGS = "settings:edit",
  MANAGE_SETTINGS = "settings:manage",

  VIEW_STAFF = "staff:view",
  CREATE_STAFF = "staff:create",
  EDIT_STAFF = "staff:edit",
  DELETE_STAFF = "staff:delete",
  MANAGE_STAFF = "staff:manage",

  VIEW_ROLES = "roles:view",
  CREATE_ROLES = "roles:create",
  EDIT_ROLES = "roles:edit",
  DELETE_ROLES = "roles:delete",
  MANAGE_ROLES = "roles:manage",

  // Attributes & Options
  VIEW_ATTRIBUTES = "attributes:view",
  CREATE_ATTRIBUTES = "attributes:create",
  EDIT_ATTRIBUTES = "attributes:edit",
  DELETE_ATTRIBUTES = "attributes:delete",
  MANAGE_ATTRIBUTES = "attributes:manage",

  VIEW_OPTION_TYPES = "option-types:view",
  CREATE_OPTION_TYPES = "option-types:create",
  EDIT_OPTION_TYPES = "option-types:edit",
  DELETE_OPTION_TYPES = "option-types:delete",
  MANAGE_OPTION_TYPES = "option-types:manage",

  // Suppliers
  VIEW_SUPPLIERS = "suppliers:view",
  CREATE_SUPPLIERS = "suppliers:create",
  EDIT_SUPPLIERS = "suppliers:edit",
  DELETE_SUPPLIERS = "suppliers:delete",
  MANAGE_SUPPLIERS = "suppliers:manage",

  // Store Management
  VIEW_STORE = "store:view",
  EDIT_STORE = "store:edit",
  MANAGE_STORE = "store:manage",

  // Content
  VIEW_LAYOUTS = "layouts:view",
  CREATE_LAYOUTS = "layouts:create",
  EDIT_LAYOUTS = "layouts:edit",
  DELETE_LAYOUTS = "layouts:delete",
  MANAGE_LAYOUTS = "layouts:manage",

  VIEW_BILLBOARDS = "billboards:view",
  CREATE_BILLBOARDS = "billboards:create",
  EDIT_BILLBOARDS = "billboards:edit",
  DELETE_BILLBOARDS = "billboards:delete",
  MANAGE_BILLBOARDS = "billboards:manage",

  VIEW_REVIEWS = "reviews:view",
  CREATE_REVIEWS = "reviews:create",
  EDIT_REVIEWS = "reviews:edit",
  DELETE_REVIEWS = "reviews:delete",
  MANAGE_REVIEWS = "reviews:manage",

  // Brands
  VIEW_BRANDS = "brands:view",
  CREATE_BRANDS = "brands:create",
  EDIT_BRANDS = "brands:edit",
  DELETE_BRANDS = "brands:delete",
  MANAGE_BRANDS = "brands:manage",

  // Stock
  VIEW_STOCK = "stock:view",
  CREATE_STOCK = "stock:create",
  EDIT_STOCK = "stock:edit",
  DELETE_STOCK = "stock:delete",
  MANAGE_STOCK = "stock:manage",

  VIEW_STOCK_MOVEMENTS = "stock-movements:view",
  CREATE_STOCK_MOVEMENTS = "stock-movements:create",
  EDIT_STOCK_MOVEMENTS = "stock-movements:edit",
  DELETE_STOCK_MOVEMENTS = "stock-movements:delete",
  MANAGE_STOCK_MOVEMENTS = "stock-movements:manage",

  // Analytics
  VIEW_ANALYTICS = "analytics:view",
  EXPORT_ANALYTICS = "analytics:export",
  MANAGE_ANALYTICS = "analytics:manage",

  // Colors and Sizes
  VIEW_COLORS = "colors:view",
  CREATE_COLORS = "colors:create",
  EDIT_COLORS = "colors:edit",
  DELETE_COLORS = "colors:delete",
  MANAGE_COLORS = "colors:manage",

  VIEW_SIZES = "sizes:view",
  CREATE_SIZES = "sizes:create",
  EDIT_SIZES = "sizes:edit",
  DELETE_SIZES = "sizes:delete",
  MANAGE_SIZES = "sizes:manage",

  // Documentation
  VIEW_DOCUMENTATION = "documentation:view",

  // Inventory
  VIEW_INVENTORY = "inventory:view",
  CREATE_INVENTORY = "inventory:create",
  EDIT_INVENTORY = "inventory:edit",
  DELETE_INVENTORY = "inventory:delete",
  MANAGE_INVENTORY = "inventory:manage",

  VIEW_INVENTORY_LOCATIONS = "inventory-locations:view",
  CREATE_INVENTORY_LOCATIONS = "inventory-locations:create",
  EDIT_INVENTORY_LOCATIONS = "inventory-locations:edit",
  DELETE_INVENTORY_LOCATIONS = "inventory-locations:delete",

  // Marketing
  VIEW_PROMOTIONS = "promotions:view",
  CREATE_PROMOTIONS = "promotions:create",
  EDIT_PROMOTIONS = "promotions:edit",
  DELETE_PROMOTIONS = "promotions:delete",
  MANAGE_PROMOTIONS = "promotions:manage",

  VIEW_DISCOUNTS = "discounts:view",
  CREATE_DISCOUNTS = "discounts:create",
  EDIT_DISCOUNTS = "discounts:edit",
  DELETE_DISCOUNTS = "discounts:delete",
  MANAGE_DISCOUNTS = "discounts:manage",

  // Reports
  VIEW_REPORTS = "reports:view",
  CREATE_REPORTS = "reports:create",
  EXPORT_REPORTS = "reports:export",
  MANAGE_REPORTS = "reports:manage",

  // API & Integration
  VIEW_API = "api:view",
  MANAGE_API = "api:manage",

  VIEW_WEBHOOKS = "webhooks:view",
  CREATE_WEBHOOKS = "webhooks:create",
  EDIT_WEBHOOKS = "webhooks:edit",
  DELETE_WEBHOOKS = "webhooks:delete",
  MANAGE_WEBHOOKS = "webhooks:manage",

  // Advanced Settings
  VIEW_CONFIGURATIONS = "configurations:view",
  EDIT_CONFIGURATIONS = "configurations:edit",
  MANAGE_CONFIGURATIONS = "configurations:manage",

  VIEW_INTEGRATIONS = "integrations:view",
  MANAGE_INTEGRATIONS = "integrations:manage"
}
