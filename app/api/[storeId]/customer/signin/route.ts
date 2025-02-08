import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { verifyPassword, generateCustomerTokens } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const customer = await prismadb.customer.findFirst({
      where: {
        email,
        storeId: params.storeId
      }
    });

    if (!customer) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, customer.password);

    if (!isPasswordValid) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    const { accessToken, refreshToken } = await generateCustomerTokens({
      id: customer.id,
      email: customer.email,
      storeId: params.storeId
    });

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.log('[CUSTOMER_SIGNIN]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
