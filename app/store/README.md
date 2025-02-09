# Storefront Module Documentation

## Overview

The Storefront Module is a dynamic, multi-tenant e-commerce solution that automatically creates a customized storefront for each store created in the admin dashboard. This documentation provides a comprehensive guide to the architecture, components, and functionality of the storefront system.

## Table of Contents

1. [Architecture](#architecture)
2. [Store Creation & Management](#store-creation--management)
3. [Data Flow](#data-flow)
4. [Components](#components)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Integration](#api-integration)
7. [URL Handling](#url-handling)

## Architecture

### Directory Structure

```
app/store/[domain]/
├── components/         # Shared components specific to storefront
├── hooks/             # Custom hooks for state management
├── lib/              # Utility functions and helpers
└── pages/            # Route pages
    ├── cart/
    ├── category/
    ├── checkout/
    ├── orders/
    ├── product/
    ├── profile/
    └── index.tsx
```

### Technical Stack

- **Framework**: Next.js with App Router
- **State Management**: React Hooks + Context
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom JWT implementation

## Store Creation & Management

### Automatic Store Creation

When a new store is created in the admin dashboard, the system automatically:

1. Creates necessary database records:
   ```typescript
   // Example store creation in Prisma
   const store = await prismadb.store.create({
     data: {
       name: storeName,
       domain: generateUniqueDomain(storeName),
       userId: currentUser.id,
       // Other store configurations
     }
   });
   ```

2. Sets up default configurations:
   - Default theme settings
   - Payment gateway integrations
   - Email templates
   - Shipping zones

3. Creates necessary storage buckets for:
   - Product images
   - Store assets
   - Customer data

### Domain Handling

Each store gets a unique subdomain based on the store name:
- Development: `store-name.localhost:3000`
- Production: `store-name.yourdomain.com`

## Data Flow

### Store Data Fetching

1. **Initial Store Resolution**:
   ```typescript
   // app/store/[domain]/layout.tsx
   const store = await prismadb.store.findFirst({
     where: {
       domain: params.domain
     },
     include: {
       settings: true,
       theme: true
     }
   });
   ```

2. **Dynamic Data Loading**:
   - Server Components fetch data directly using Prisma
   - Client Components use API routes with proper authentication

### State Management

1. **Global Store State**:
   ```typescript
   // hooks/use-store.ts
   export const useStore = () => {
     const [store, setStore] = useState<Store | null>(null);
     // State management implementation
   };
   ```

2. **Cart Management**:
   ```typescript
   // hooks/use-cart.ts
   export const useCart = () => {
     const [items, setItems] = useState<CartItem[]>([]);
     // Cart management implementation
   };
   ```

## Components

### Core Components

1. **Navbar Component**
   ```typescript
   // components/navbar.tsx
   export const Navbar: React.FC<NavbarProps> = ({
     taxonomies,
     store
   }) => {
     // Navigation implementation with categories
   };
   ```

2. **Product Display**
   ```typescript
   // components/product-display.tsx
   export const ProductDisplay: React.FC<ProductProps> = ({
     product
   }) => {
     // Product display implementation
   };
   ```

### Page Components

1. **HomePage**
   - Displays store-specific layout
   - Handles dynamic component rendering
   - Manages SEO and metadata

2. **CategoryPage**
   - Handles product filtering
   - Manages pagination
   - Implements sorting functionality

### Component Communication and Data Flow

#### 1. Parent-Child Communication
```typescript
// Parent component passing data and callbacks
<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
  onQuickView={handleQuickView}
/>

// Child component receiving props
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onQuickView: (product: Product) => void;
}
```

#### 2. Global State Management
```typescript
// Store context
export const StoreContext = createContext<{
  store: Store | null;
  settings: StoreSettings | null;
  updateStore: (store: Store) => void;
}>({
  store: null,
  settings: null,
  updateStore: () => {}
});

// Usage in components
const { store, settings } = useContext(StoreContext);
```

#### 3. Custom Hooks for Shared Logic
```typescript
// Cart hook example
const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { store } = useContext(StoreContext);

  const addToCart = async (productId: string, quantity: number) => {
    // Cart logic implementation
  };

  const removeFromCart = async (itemId: string) => {
    // Remove item logic
  };

  return { items, addToCart, removeFromCart };
};
```

#### 4. Server-Client Data Flow
```typescript
// Server component (HomePage)
const HomePage = async ({ params }: { params: { domain: string } }) => {
  // Direct database access
  const store = await prismadb.store.findFirst({
    where: { domain: params.domain }
  });

  // Pass data to client components
  return (
    <ClientComponent 
      initialData={store}
      storeId={store.id}
    />
  );
};

// Client component
const ClientComponent: React.FC<{ 
  initialData: any;
  storeId: string;
}> = ({ initialData, storeId }) => {
  // Use data and make API calls if needed
  const [data, setData] = useState(initialData);
  
  // Additional client-side data fetching
  useEffect(() => {
    const fetchData = async () => {
      const origin = window.location.origin;
      const response = await fetch(`${origin}/api/...`);
      // Update state
    };
  }, []);
};
```

#### 5. Event Handling and State Updates
```typescript
// Example of coordinated state updates
const ProductPage = () => {
  const cart = useCart();
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await cart.addToCart(product.id);
      showNotification('Product added to cart');
    } catch (error) {
      showNotification('Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };
};
```

## Authentication & Authorization

### Authentication Flow

1. **Middleware Implementation**:
   ```typescript
   // middleware.ts
   export async function middleware(req: NextRequest) {
     // Check if the request is for the storefront
     if (req.nextUrl.pathname.startsWith('/store')) {
       // Get store domain from URL
       const domain = req.nextUrl.pathname.split('/')[2];
       
       // Verify customer session
       const customerToken = req.cookies.get('customer_token');
       
       // Protected routes handling
       if (isProtectedRoute(req.nextUrl.pathname)) {
         if (!customerToken) {
           return redirectToLogin(domain);
         }
         
         try {
           // Verify and decode token
           const decoded = verifyToken(customerToken);
           // Check if token is for correct store
           if (decoded.domain !== domain) {
             return redirectToLogin(domain);
           }
         } catch (error) {
           return redirectToLogin(domain);
         }
       }
     }
   }
   ```

2. **Sign In Process**:
   ```typescript
   // Implementation of customer sign-in
   const signIn = async (credentials) => {
     const response = await fetch(`${baseUrl}/api/auth/signin`, {
       method: 'POST',
       credentials: 'include',
       body: JSON.stringify(credentials)
     });
     
     if (response.ok) {
       const { token } = await response.json();
       // Token is automatically stored as HTTP-only cookie
       return true;
     }
     
     throw new Error('Authentication failed');
   };
   ```

3. **Session Management**:
   - JWT tokens stored in HTTP-only cookies
   - Automatic token refresh mechanism
   - Secure session handling with token rotation
   - Cross-site request forgery (CSRF) protection

### Authorization & Data Isolation

1. **Customer Permissions**:
   ```typescript
   // Example permission check in API route
   export async function GET(req: Request) {
     // Get customer from session
     const customer = await getCurrentCustomer(req);
     
     // Verify store access
     if (customer.storeId !== params.storeId) {
       return new Response("Unauthorized", { status: 403 });
     }
     
     // Continue with authorized operation
   }
   ```

2. **Store-Specific Access**:
   - Each customer's data is isolated to specific stores
   - Database queries include store-specific filters
   - Cross-store data protection through middleware
   - Role-based access control within stores

3. **Data Access Patterns**:
   ```typescript
   // Example of store-specific data access
   const getCustomerOrders = async (customerId: string, storeId: string) => {
     return await prismadb.order.findMany({
       where: {
         customerId,
         storeId,  // Ensures data isolation
       },
       include: {
         items: true,
         customer: true,
       },
     });
   };
   ```

## API Integration

### API Routes

1. **Store API**:
   ```typescript
   // Example store details endpoint
   export async function GET(
     req: Request,
     { params }: { params: { storeId: string } }
   ) {
     try {
       const store = await prismadb.store.findUnique({
         where: { id: params.storeId }
       });
       return NextResponse.json(store);
     } catch (error) {
       return new NextResponse("Internal error", { status: 500 });
     }
   }
   ```

2. **Product API**:
   - Product listing
   - Product details
   - Search and filtering

3. **Order API**:
   - Order creation
   - Order status updates
   - Order history

### API Security

1. **Rate Limiting**:
   - Implementation of request limits
   - DDoS protection

2. **Data Validation**:
   - Input sanitization
   - Type checking
   - Error handling

## URL Handling

### Base URL Management

The system uses different URL handling approaches for server and client components to ensure proper API communication:

1. **Server Components**:
   ```typescript
   // lib/server-utils.ts
   export const getBaseUrl = () => {
     const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
     const host = headers().get("host");
     return `${protocol}://${host}`;
   };
   ```

   Used in server components like:
   - HomePage: Fetches store details and layout
   - CategoryPage: Retrieves category products and filters
   - ProductPage: Gets product details and related items

2. **Client Components**:
   ```typescript
   // Client-side URL handling
   const origin = window.location.origin;
   const apiUrl = `${origin}/api/...`;
   ```

   Implemented in components like:
   - OrdersPage: Fetches customer orders
   - ProfilePage: Manages customer profile data
   - Navbar: Handles authentication state
   - SignOutPage: Manages sign-out process

### API URL Structure

1. **Store-Specific Endpoints**:
   ```
   /api/storefront/[storeId]/store/details    # Store details
   /api/storefront/[storeId]/products         # Product listing
   /api/storefront/[storeId]/orders           # Customer orders
   ```

2. **Authentication Endpoints**:
   ```
   /api/auth/customer/profile      # Customer profile
   /api/storefront/[domain]/auth/* # Auth operations
   ```

3. **Data Fetching**:
   ```typescript
   // Server component example (using server-utils)
   const baseUrl = getBaseUrl();
   const response = await fetch(`${baseUrl}/api/storefront/${store.id}/products`);

   // Client component example
   const origin = window.location.origin;
   const response = await fetch(`${origin}/api/storefront/${storeId}/profile`);
   ```

### Dynamic Routing

1. **Store-specific Routes**:
   - Domain-based routing
   - Category routing
   - Product routing

2. **SEO-friendly URLs**:
   - Clean URL structure
   - Proper meta tags
   - Sitemap generation

## Best Practices

1. **Performance Optimization**:
   - Image optimization
   - Code splitting
   - Lazy loading

2. **Error Handling**:
   - Graceful degradation
   - User-friendly error messages
   - Error logging and monitoring

3. **Security**:
   - CSRF protection
   - XSS prevention
   - Input validation

## Development Guidelines

1. **Code Structure**:
   - Follow component-based architecture
   - Maintain separation of concerns
   - Use TypeScript for type safety

2. **State Management**:
   - Use React Query for server state
   - Context API for global state
   - Local state for component-specific data

3. **Testing**:
   - Unit tests for utilities
   - Integration tests for components
   - E2E tests for critical flows

## Deployment

1. **Environment Setup**:
   - Development configuration
   - Production optimization
   - Environment variables

2. **Monitoring**:
   - Performance metrics
   - Error tracking
   - Analytics integration

## File Structure and Relationships

### Core Files and Dependencies

#### Authentication System
```
lib/
├── auth.ts                 # Core authentication utilities
├── auth-edge.ts           # Edge runtime authentication
├── auth-utils.ts          # Auth helper functions
├── client-auth.ts         # Client-side auth helpers
├── session.ts             # Session management
└── get-customer.ts        # Customer data retrieval

app/store/[domain]/
├── signin/
│   ├── page.tsx           # Sign in page
│   └── components/        # Sign in form components
├── signout/
│   └── page.tsx          # Sign out handler
└── middleware.ts         # Auth middleware
```

#### Store Management
```
app/store/[domain]/
├── page.tsx              # Store homepage
├── layout.tsx            # Store layout with navigation
├── components/
│   ├── navbar.tsx        # Store navigation
│   ├── footer.tsx        # Store footer
│   └── store-header.tsx  # Store header with branding
└── hooks/
    ├── use-store.ts      # Store state management
    └── use-origin.ts     # URL origin handling

lib/
├── prismadb.ts           # Database connection
├── utils.ts              # General utilities
├── server-utils.ts       # Server-side utilities
└── price-formatter.ts    # Price formatting utilities
```

#### Product Management
```
app/store/[domain]/
├── product/
│   ├── [slug]/
│   │   ├── page.tsx           # Product detail page
│   │   └── components/        # Product components
│   └── components/
│       ├── product-card.tsx   # Product display card
│       ├── product-grid.tsx   # Products grid layout
│       └── product-filters.tsx # Product filtering
├── category/
│   ├── [slug]/
│   │   ├── page.tsx          # Category page
│   │   └── components/       # Category components
│   └── components/
│       ├── category-card.tsx  # Category display
│       └── category-tree.tsx  # Category navigation
└── components/
    └── search/
        ├── search-bar.tsx     # Product search
        └── search-results.tsx # Search results
```

#### Cart and Checkout
```
app/store/[domain]/
├── cart/
│   ├── page.tsx              # Cart page
│   └── components/
│       ├── cart-item.tsx     # Cart item display
│       └── cart-summary.tsx  # Cart totals
├── checkout/
│   ├── page.tsx             # Checkout page
│   └── components/
│       ├── checkout-form.tsx # Checkout form
│       └── payment.tsx      # Payment integration
└── hooks/
    └── use-cart.ts          # Cart state management
```

#### Order Management
```
app/store/[domain]/
├── orders/
│   ├── page.tsx             # Orders list page
│   ├── [orderId]/
│   │   ├── page.tsx        # Order detail page
│   │   └── components/     # Order components
│   └── components/
│       ├── order-card.tsx   # Order summary card
│       └── order-timeline.tsx # Order status
└── hooks/
    └── use-orders.ts       # Order data management
```

#### Profile Management
```
app/store/[domain]/
├── profile/
│   ├── page.tsx            # Profile page
│   └── components/
│       ├── profile-form.tsx # Profile editing
│       └── addresses.tsx   # Address management
└── components/
    └── user-nav.tsx       # User navigation menu
```

#### API Routes
```
app/api/
├── storefront/
│   ├── [storeId]/
│   │   ├── store/
│   │   │   └── details/     # Store details API
│   │   ├── products/        # Products API
│   │   ├── orders/          # Orders API
│   │   └── profile/         # Profile API
│   └── [domain]/
│       └── auth/            # Auth API routes
└── upload/                  # Media upload API
```

### File Relationships and Data Flow

1. **Store Initialization**:
   - `app/store/[domain]/layout.tsx` loads store data
   - Uses `lib/prismadb.ts` for database access
   - Passes store data through `StoreContext` provider

2. **Product Display Flow**:
   - Category listing in `category/[slug]/page.tsx`
   - Products grid in `components/product-grid.tsx`
   - Individual products in `product/[slug]/page.tsx`
   - All using `lib/server-utils.ts` for API calls

3. **Cart System Flow**:
   - Cart state managed by `hooks/use-cart.ts`
   - UI components in `cart/components/`
   - Checkout process in `checkout/page.tsx`
   - Payment integration in `checkout/components/payment.tsx`

4. **Authentication Flow**:
   - Sign in form in `signin/page.tsx`
   - Auth middleware in `middleware.ts`
   - Session management in `lib/session.ts`
   - Protected routes check auth in `lib/auth-utils.ts`

5. **Data Management**:
   - Database queries through `lib/prismadb.ts`
   - API routes in `app/api/storefront/`
   - Server utilities in `lib/server-utils.ts`
   - Client utilities in `lib/utils.ts`

## Conclusion

This storefront module provides a robust, scalable solution for multi-tenant e-commerce applications. The file structure and relationships detailed above show how different components work together to create a complete e-commerce system. By following the patterns and practices outlined in this documentation, developers can effectively maintain and extend the functionality of the system.
