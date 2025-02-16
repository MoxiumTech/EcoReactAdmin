export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getAuthCookie, 
  generateCustomerTokens, 
  verifyPassword, 
  getCustomerByEmail 
} from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { email, password } = await req.json();
    const storeId = params.storeId;

    if (!email || !password) {
      return new NextResponse("Missing credentials", { status: 400 });
    }

    const customer = await getCustomerByEmail(email, storeId);

    if (!customer) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, customer.password);

    if (!isPasswordValid) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Generate both access and refresh tokens
    const { accessToken, refreshToken } = await generateCustomerTokens({
      id: customer.id,
      email: customer.email,
      storeId
    });

    // Check if request is from mobile app
    const userAgent = req.headers.get('user-agent') || '';
    const isMobileApp = userAgent.includes('Expo') || req.headers.get('x-mobile-app') === 'true';

    if (isMobileApp) {
      // For mobile app, return tokens in response
      return NextResponse.json({
        user: {
          id: customer.id,
          name: customer.name,
          email: customer.email
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });
    }

    // For web app, set tokens as cookies
    const cookieStore = cookies();
    const host = req.headers.get('host');
    
    // Set access token cookie
    const accessCookie = getAuthCookie(accessToken, 'customer', false, host || undefined);
    const accessCookieOptions: any = {
      httpOnly: accessCookie.httpOnly,
      secure: accessCookie.secure,
      sameSite: accessCookie.sameSite as 'lax',
      path: accessCookie.path,
      expires: accessCookie.expires
    };
    if ('domain' in accessCookie) {
      accessCookieOptions.domain = accessCookie.domain;
    }
    cookieStore.set(accessCookie.name, accessCookie.value, accessCookieOptions);

    // Set refresh token cookie
    const refreshCookie = getAuthCookie(refreshToken, 'customer', true, host || undefined);
    const refreshCookieOptions: any = {
      httpOnly: refreshCookie.httpOnly,
      secure: refreshCookie.secure,
      sameSite: refreshCookie.sameSite as 'lax',
      path: refreshCookie.path,
      expires: refreshCookie.expires
    };
    if ('domain' in refreshCookie) {
      refreshCookieOptions.domain = refreshCookie.domain;
    }
    cookieStore.set(refreshCookie.name, refreshCookie.value, refreshCookieOptions);

    // Return customer data only for web app
    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('[CUSTOMER_SIGNIN]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
