import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthCookie, generateCustomerTokens, verifyPassword, getCustomerByEmail } from "@/lib/auth";
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

    // Get customer
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
      storeId: storeId
    });

    // Set cookies
    const cookieStore = cookies();
    
    // Set access token cookie
    const accessCookie = getAuthCookie(accessToken, 'customer', false);
    cookieStore.set(accessCookie.name, accessCookie.value, {
      httpOnly: accessCookie.httpOnly,
      secure: accessCookie.secure,
      sameSite: accessCookie.sameSite as 'lax',
      path: accessCookie.path,
      expires: accessCookie.expires
    });

    // Set refresh token cookie
    const refreshCookie = getAuthCookie(refreshToken, 'customer', true);
    cookieStore.set(refreshCookie.name, refreshCookie.value, {
      httpOnly: refreshCookie.httpOnly,
      secure: refreshCookie.secure,
      sameSite: refreshCookie.sameSite as 'lax',
      path: refreshCookie.path,
      expires: refreshCookie.expires
    });

    console.log('[AUTH_DEBUG] Token generation successful');

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    console.error('[CUSTOMER_AUTH] Detailed error:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error)
    });
    return new NextResponse(`Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}
