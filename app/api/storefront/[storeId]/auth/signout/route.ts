import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const cookieStore = cookies();
    const host = req.headers.get('host');

    if (!host) {
      return new NextResponse("Missing host header", { status: 400 });
    }

    // Clear cookies with specific domain
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      domain: host.split(':')[0], // Use exact hostname for customer cookies
      expires: new Date(0) // Set expiry to past date to clear cookie
    };

    // Clear customer token cookies
    cookieStore.set('customer_token', '', cookieOptions);
    cookieStore.set('customer_refresh_token', '', cookieOptions);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[CUSTOMER_SIGNOUT]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
