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

    // Generate tokens
    const { accessToken } = await generateCustomerTokens({
      id: customer.id,
      email: customer.email,
      storeId: storeId
    });

    console.log('[AUTH_DEBUG] Generated token payload:', {
      customerId: customer.id,
      email: customer.email,
      storeId: storeId
    });

    // Set cookie
    const cookieStore = cookies();
    const cookieConfig = getAuthCookie(accessToken, 'customer');
    cookieStore.set(cookieConfig.name, cookieConfig.value, {
      httpOnly: cookieConfig.httpOnly,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite as 'lax',
      path: cookieConfig.path,
      expires: cookieConfig.expires
    });

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
