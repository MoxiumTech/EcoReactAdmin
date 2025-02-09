import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getAuthCookie, 
  generateCustomerTokens, 
  verifyPassword, 
  getCustomerByEmail 
} from "@/lib/auth";

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
      storeId
    });

    // Set cookies
    const cookieStore = cookies();
    
    // Set access token cookie
    const accessConfig = getAuthCookie(accessToken, 'customer', false);
    cookieStore.set(accessConfig.name, accessConfig.value, {
      httpOnly: accessConfig.httpOnly,
      secure: accessConfig.secure,
      sameSite: accessConfig.sameSite as 'lax',
      path: accessConfig.path,
      expires: accessConfig.expires
    });

    // Set refresh token cookie
    const refreshConfig = getAuthCookie(refreshToken, 'customer', true);
    cookieStore.set(refreshConfig.name, refreshConfig.value, {
      httpOnly: refreshConfig.httpOnly,
      secure: refreshConfig.secure,
      sameSite: refreshConfig.sameSite as 'lax',
      path: refreshConfig.path,
      expires: refreshConfig.expires
    });

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
