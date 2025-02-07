import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRequiredPermissionForRoute, withPermissionCheck } from '@/lib/permission-middleware';

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

    // Get configured domains from environment or defaults (matching next.config.js)
    const configuredMainDomain = process.env.MAIN_DOMAIN || 'lvh.me:3000';
    const configuredAdminDomain = process.env.ADMIN_DOMAIN || 'admin.lvh.me:3000';

    // Normalize hostname and configured domains for comparison
    const cleanHostname = hostname.split(':')[0]; // Remove port if present
    const mainDomainBase = configuredMainDomain.split(':')[0];
    const adminDomainBase = configuredAdminDomain.split(':')[0];

    // Check if it's an admin domain - allow both admin.domain and direct admin domain
    const isAdminDomain = 
      // Development patterns
      hostname === 'localhost:3000' ||
      hostname === '127.0.0.1:3000' ||
      hostname === 'admin.lvh.me:3000' ||
      // Production patterns - match both configured admin domain and admin subdomain pattern
      cleanHostname === adminDomainBase ||
      cleanHostname === `admin.${mainDomainBase}`;

    // Handle main domain (non-admin, non-store subdomain)
    const isMainDomain = 
      hostname === configuredMainDomain ||
      hostname === 'lvh.me:3000' ||
      hostname === 'localhost:3000' ||
      hostname === '127.0.0.1:3000';

    // Log every path exclusion check
    const isNextInternal = pathname.startsWith('/_next');
    const isStatic = pathname.startsWith('/static');
    const isApi = pathname.startsWith('/api');
    const isFavicon = pathname.startsWith('/favicon.ico');
    const isFont = pathname.endsWith('.ttf');
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
      isApiAuth ||
      isFont
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
          const permissionCheck = await withPermissionCheck(
            request,
            storeId,
            requiredPermission
          );
          
          if (permissionCheck) {
            return permissionCheck; // Return error response if permission check failed
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
      const customerToken = await request.cookies.get('customer_token')?.value;
      if (!customerToken) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      return NextResponse.next();
    }

    // Handle main domain requests (lvh.me)
    if (isMainDomain) {
      const adminToken = await request.cookies.get('admin_token')?.value;

      // If user is logged in and tries to access any path on main domain
      if (adminToken) {
        // Redirect to admin domain dashboard
        return NextResponse.redirect(new URL(`http://${configuredAdminDomain}${pathname}`, request.url));
      }

      // Allow access to public routes and landing page for non-logged in users
      if (pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
        return NextResponse.next();
      }

      // Redirect auth routes to admin domain
      if (authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL(`http://${configuredAdminDomain}${pathname}`, request.url));
      }
    }

    // Handle admin domain requests (admin.lvh.me)
    if (isAdminDomain) {
      const adminToken = await request.cookies.get('admin_token')?.value;
      const isPublic = publicRoutes.includes(pathname);

      // If accessing auth routes while logged in, redirect to dashboard
      if (authRoutes.includes(pathname) && adminToken) {
        // Will be handled by the page to redirect to correct store
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Allow access to auth pages if not logged in
      if (authRoutes.includes(pathname)) {
        return NextResponse.next();
      }

      // Check admin auth for dashboard routes
      if (!adminToken && !isPublic) {
        return NextResponse.redirect(new URL('/signin', request.url));
      }

      return NextResponse.next();
    }

    // Handle store domain routes
    let storeDomain: string;
    
    if (hostname.includes('lvh.me:3000')) {
      // Handle local development domain
      const subdomain = hostname.split('.lvh.me:3000')[0];
      if (!subdomain || subdomain === 'admin') {
        return NextResponse.redirect(new URL(`http://${configuredAdminDomain}`, request.url));
      }
      storeDomain = subdomain;
    } else {
      // For production, extract subdomain from hostname
      const parts = hostname.split('.');
      // If hostname does not have enough parts or is admin domain, redirect to admin
      if (parts.length < 2 || hostname === configuredAdminDomain) {
        return NextResponse.redirect(new URL(`https://${configuredAdminDomain}`, request.url));
      }
      storeDomain = parts[0];
    }

    // Check store authentication if accessing private store routes
    const isStoreAuthRoute = pathname.startsWith('/profile') || 
                            pathname.startsWith('/orders') ||
                            pathname.startsWith('/checkout');
    if (isStoreAuthRoute) {
      const customerToken = await request.cookies.get('customer_token')?.value;
      if (!customerToken) {
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
    '/((?!_next|static|_vercel|favicon.ico|sitemap.xml|Beatrice-Regular.ttf|Beatrice-Medium.ttf).*)',
  ],
};
