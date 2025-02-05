import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import path from 'path';
import jwt from 'jsonwebtoken';

// List of public routes that don't require authentication
const publicRoutes = ['/signin', '/signup'];
const authRoutes = ['/signin', '/signup'];
const apiAuthRoutes = ['/api/auth/signin', '/api/auth/signup'];
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

    // Check if it's the default admin domain
    const isAdminDomain = hostname === process.env.ADMIN_DOMAIN ||
                         hostname === 'localhost:3000' ||
                         hostname === '127.0.0.1:3000' ||
                         hostname === 'admin.lvh.me:3000';

    console.log('[MIDDLEWARE] Processing request:', { pathname, hostname, isAdminDomain });

    // Exclude static files, API routes, and other non-middleware paths
    if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/static') || 
      pathname.startsWith('/api') || 
      pathname.startsWith('/favicon.ico')
    ) {
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
      // Allow access to auth pages
      if (authRoutes.includes(pathname)) {
        return NextResponse.next();
      }

      // Check admin auth for dashboard routes
      const adminToken = await request.cookies.get('admin_token')?.value;
      if (!adminToken && !publicRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/signin', request.url));
      }

    // Extract storeId from URL for dashboard routes
    const storeIdMatch = pathname.match(/\/([^\/]+)\//);
    if (storeIdMatch && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const storeId = storeIdMatch[1];
      if (storeId === 'new') {
        return NextResponse.next();
      }
      
      // For non-API routes requiring auth, just verify the token exists
      if (!adminToken) {
        return NextResponse.redirect(new URL('/signin', request.url));
      }
      
      // Let the API routes handle detailed auth checks
      return NextResponse.next();
    }

      // Allow access to all admin dashboard paths after verification
      return NextResponse.next();
    }

    // Handle store domain routes
    let storeDomain: string;
    console.log('[MIDDLEWARE] Original hostname:', hostname);
    
    if (hostname.includes('lvh.me:3000')) {
      // Handle local development domain
      const subdomain = hostname.split('.lvh.me:3000')[0];
      if (!subdomain || subdomain === 'admin') {
        return NextResponse.redirect(new URL('http://admin.lvh.me:3000', request.url));
      }
      storeDomain = subdomain;
    } else if (hostname.includes('vercel.app')) {
      // Handle store subdomains on vercel.app
      const storePart = hostname.split('.')[0];
      // Remove 'preview-ecoreact' prefix if present
      storeDomain = storePart.replace('preview-ecoreact-', '');
    } else {
      // For any other domains, treat them as potential store domains
      const parts = hostname.split('.');
      if (parts.length < 2) {
        return NextResponse.redirect(new URL('https://preview-ecoreact.vercel.app', request.url));
      }
      storeDomain = parts[0];
    }

    console.log('[MIDDLEWARE] Extracted storeDomain:', storeDomain);

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
    /*
     * Match all request paths except for:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /_vercel (Vercel internals)
     * 4. /favicon.ico, /sitemap.xml (public files)
     */
    '/((?!_next|static|_vercel|favicon.ico|sitemap.xml).*)',
  ],
};
