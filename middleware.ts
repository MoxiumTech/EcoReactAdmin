import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequiredPermissionForRoute } from '@/lib/permission-middleware';
import { verifyJWT } from '@/lib/auth-edge';

// List of public routes that don't require authentication
const publicRoutes = ['/signin', '/signup', '/accept-invite'];
const authRoutes = ['/signin', '/signup', '/accept-invite'];
const apiAuthRoutes = [
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/staff/verify-invite',
  '/api/staff/accept-invite',
  '/api/staff/debug-invite',
  '/api/[storeId]/auth/permissions'  // Allow permissions check endpoint
];
const storefrontPublicRoutes = ['/api/storefront/[storeId]/auth', '/api/storefront/[storeId]/register'];

// Check if a route is an admin dashboard route
const isAdminDashboardRoute = (pathname: string): boolean => {
  return pathname.includes('[storeId]') || 
         ['/billboards', '/categories', '/products', '/orders', '/settings', '/layouts']
           .some(route => pathname.includes(route));
};

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const hostname = request.headers.get('host')!;

    const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'lvh.me:3000';
    
    // Normalize domains for comparison (remove port in production)
    const normalizedMainDomain = MAIN_DOMAIN.split(':')[0];
    const normalizedHostname = hostname.split(':')[0];
    
    // Check if it's the default admin domain
    const isAdminDomain = normalizedHostname === `admin.${normalizedMainDomain}`;

    // Log every path exclusion check
    const isNextInternal = pathname.startsWith('/_next');
    const isStatic = pathname.startsWith('/static') || pathname.startsWith('/dist');
    const isApi = pathname.startsWith('/api');
    const isFavicon = pathname.startsWith('/favicon.ico');
    const isAcceptInvite = pathname.startsWith('/accept-invite');
    const isApiAuth = apiAuthRoutes.some(route => {
      const pattern = route.replace('[storeId]', '[^/]+');
      return new RegExp(`^${pattern}`).test(pathname);
    });

    // Always allow these paths
    if (
      isNextInternal || 
      isStatic || 
      isFavicon ||
      isAcceptInvite ||
      isApiAuth
    ) {
      return NextResponse.next();
    }

    // Handle API routes with permission checks
    if (isApi) {
      // Extract storeId from API path
      const storeIdMatch = pathname.match(/\/api\/([^\/]+)/);
      if (storeIdMatch) {
        const storeId = storeIdMatch[1];
        
        // Check if route requires permissions
        const requiredPermission = getRequiredPermissionForRoute(pathname);
        if (requiredPermission) {
          // Get admin token
          const adminToken = request.cookies.get('admin_token')?.value;
          if (!adminToken) {
            return new NextResponse("Unauthorized", { status: 401 });
          }

          try {
            // Verify token using Edge-compatible verification
            const session = await verifyJWT(adminToken);
            if (!session || session.role !== 'admin') {
              return new NextResponse("Unauthorized", { status: 401 });
            }
          } catch (error) {
            return new NextResponse("Invalid token", { status: 401 });
          }
        }
      }
      
      return NextResponse.next();
    }

    // Handle storefront routes
    if (pathname.startsWith('/api/storefront')) {
      // Allow public storefront routes
      if (storefrontPublicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
      }

      // Check customer auth for protected storefront routes
      const customerToken = request.cookies.get('customer_token')?.value;
      if (!customerToken) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      try {
        const session = await verifyJWT(customerToken);
        if (!session || session.role !== 'customer') {
          return new NextResponse("Unauthorized", { status: 401 });
        }
      } catch (error) {
        return new NextResponse("Invalid token", { status: 401 });
      }

      return NextResponse.next();
    }

    // Handle admin domain requests
    if (isAdminDomain) {
      const adminToken = request.cookies.get('admin_token')?.value;
      const isPublic = publicRoutes.includes(pathname);
      const isRoot = pathname === '/';

      // If user is already logged in and trying to access root or auth pages
      if (adminToken && (isRoot || authRoutes.includes(pathname))) {
        try {
          const session = await verifyJWT(adminToken);
          if (session && session.role === 'admin') {
            // Redirect to overview page if token is valid
            return NextResponse.redirect(new URL('/overview', request.url));
          }
        } catch (error) {
          // Invalid token, continue with normal flow
        }
      }

      // Handle non-authenticated access
      if (!adminToken && !isPublic) {
        return NextResponse.redirect(new URL('/signin', request.url));
      }

      // Verify token for protected routes
      if (adminToken && !isPublic) {
        try {
          const session = await verifyJWT(adminToken);
          if (!session || session.role !== 'admin') {
            return NextResponse.redirect(new URL('/signin', request.url));
          }
        } catch (error) {
          return NextResponse.redirect(new URL('/signin', request.url));
        }
      }

      return NextResponse.next();
    }

    // Check if on root domain
    const isRootDomain = normalizedHostname === normalizedMainDomain;

    if (isRootDomain) {
      const adminToken = request.cookies.get('admin_token')?.value;

      // If on root domain and has valid admin token, redirect to admin overview
      if (adminToken) {
        try {
          const session = await verifyJWT(adminToken);
          if (session && session.role === 'admin') {
            // Token verification successful, redirect to admin domain overview
            const adminUrl = new URL(`http://${process.env.ADMIN_DOMAIN}/overview`);
            return NextResponse.redirect(adminUrl);
          }
        } catch (error) {
          // Clear invalid token
          const response = NextResponse.next();
          response.cookies.delete('admin_token');
          return response;
        }
      }

      // If no token or invalid token, show landing page
      return NextResponse.next();
    }

    // Handle store domain routes
    let storeDomain: string;
    
    if (hostname.includes(normalizedMainDomain)) {
      // Handle domain
      const subdomain = hostname.split(`.${normalizedMainDomain}`)[0];
      if (subdomain === 'admin') {
        return NextResponse.next();
      }
      storeDomain = subdomain;
    } else if (hostname.includes('vercel.app')) {
      // Handle store subdomains on vercel.app
      const storePart = hostname.split('.')[0];
      storeDomain = storePart.replace('preview-ecoreact-', '');
    } else {
      // For any other domains, treat them as potential store domains
      const parts = hostname.split('.');
      if (parts.length < 2) {
        return NextResponse.redirect(new URL('https://preview-ecoreact.vercel.app', request.url));
      }
      storeDomain = parts[0];
    }

    // Check store authentication if accessing private store routes
    const isStoreAuthRoute = pathname.startsWith('/profile') || 
                            pathname.startsWith('/orders') ||
                            pathname.startsWith('/checkout');
    if (isStoreAuthRoute) {
      const customerToken = request.cookies.get('customer_token')?.value;
      if (!customerToken) {
        return NextResponse.redirect(new URL(`/store/${storeDomain}/signin`, request.url));
      }

      try {
        const session = await verifyJWT(customerToken);
        if (!session || session.role !== 'customer') {
          return NextResponse.redirect(new URL(`/store/${storeDomain}/signin`, request.url));
        }
      } catch (error) {
        return NextResponse.redirect(new URL(`/store/${storeDomain}/signin`, request.url));
      }
    }

    // Rewrite store paths
    if (!pathname.startsWith('/store')) {
      return NextResponse.rewrite(new URL(`/store/${storeDomain}${pathname}`, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[MIDDLEWARE] Error:', error);
    return NextResponse.redirect(new URL('/signin', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|static|dist|_vercel|favicon.ico|sitemap.xml).*)',
  ],
};
