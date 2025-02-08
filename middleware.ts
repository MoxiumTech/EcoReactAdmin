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

    const MAIN_DOMAIN = process.env.MAIN_DOMAIN || 'lvh.me:3000';
    
    // Normalize domains for comparison (remove port in production)
    const normalizedMainDomain = MAIN_DOMAIN.split(':')[0];
    const normalizedHostname = hostname.split(':')[0];
    
    // Check if it's the default admin domain
    const isAdminDomain = normalizedHostname === `admin.${normalizedMainDomain}`;

    // Log every path exclusion check
    const isNextInternal = pathname.startsWith('/_next');
    const isStatic = pathname.startsWith('/static');
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

    // Handle admin domain requests
    if (isAdminDomain) {
      // Allow access to auth pages and accept invite
      if (authRoutes.includes(pathname)) {
        return NextResponse.next();
      }

      // Check admin auth for dashboard routes
      const adminToken = await request.cookies.get('admin_token')?.value;
      const isPublic = publicRoutes.includes(pathname);

      if (!adminToken && !isPublic) {
        return NextResponse.redirect(new URL('/signin', request.url));
      }

      return NextResponse.next();
    }

    // Check if on root domain
    const isRootDomain = normalizedHostname === normalizedMainDomain;
    console.log('[MIDDLEWARE] Domain Check:', {
      hostname,
      MAIN_DOMAIN,
      isRootDomain,
      pathname
    });

    if (isRootDomain) {
      const adminToken = await request.cookies.get('admin_token')?.value;
      console.log('[MIDDLEWARE] Cookie Debug:', {
        allCookies: request.cookies.getAll(),
        adminTokenValue: adminToken,
        cookieKeys: request.cookies.getAll().map(c => c.name),
        domain: process.env.MAIN_DOMAIN,
        host: request.headers.get('host')
      });

      if (adminToken) {
        // Token verification will happen in admin domain
        const redirectUrl = new URL(`http://${process.env.ADMIN_DOMAIN}/overview`);
        console.log('[MIDDLEWARE] Redirecting to:', redirectUrl.toString());
        return NextResponse.redirect(redirectUrl);
      }
      console.log('[MIDDLEWARE] No admin token, showing landing page');
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
    '/((?!_next|static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
};
