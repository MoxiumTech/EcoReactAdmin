import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getAuthCookie, 
  generateCustomerTokens, 
  getCustomerByEmail, 
  createCustomer 
} from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { email, password, name } = await req.json();
    const storeId = params.storeId;

    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify store exists
    const store = await prismadb.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    // Check if customer already exists
    const existingCustomer = await getCustomerByEmail(email, storeId);

    if (existingCustomer) {
      return new NextResponse("Email already in use", { status: 400 });
    }

    // Create new customer
    const customer = await createCustomer(email, password, storeId, name);

    // Generate tokens
    const { accessToken, refreshToken } = await generateCustomerTokens({
      id: customer.id,
      email: customer.email,
      storeId: customer.storeId
    });

    // Set cookies
    const cookieStore = cookies();
    
    // Set access token cookie
    const accessTokenConfig = getAuthCookie(accessToken, 'customer');
    cookieStore.set(accessTokenConfig.name, accessTokenConfig.value, {
      httpOnly: accessTokenConfig.httpOnly,
      secure: accessTokenConfig.secure,
      sameSite: accessTokenConfig.sameSite as 'lax',
      path: accessTokenConfig.path,
      expires: accessTokenConfig.expires
    });

    // Set refresh token cookie
    const refreshTokenConfig = getAuthCookie(refreshToken, 'customer', true);
    cookieStore.set(refreshTokenConfig.name, refreshTokenConfig.value, {
      httpOnly: refreshTokenConfig.httpOnly,
      secure: refreshTokenConfig.secure,
      sameSite: refreshTokenConfig.sameSite as 'lax',
      path: refreshTokenConfig.path,
      expires: refreshTokenConfig.expires
    });

    // Create initial cart for customer
    await prismadb.order.create({
      data: {
        customerId: customer.id,
        storeId: storeId,
        status: "cart"
      }
    });

    const { password: _, ...safeCustomer } = customer;

    return NextResponse.json({
      customer: safeCustomer
    });
  } catch (error) {
    console.log('[CUSTOMER_REGISTER]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
