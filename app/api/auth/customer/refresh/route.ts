import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { refreshCustomerToken, getAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('customer_refresh_token')?.value;

    if (!refreshToken) {
      return new NextResponse("No refresh token", { status: 401 });
    }

    // Attempt to refresh the access token
    const result = await refreshCustomerToken(refreshToken);
    
    if (!result) {
      // Clear all auth cookies if refresh fails
      cookieStore.delete('customer_token');
      cookieStore.delete('customer_refresh_token');
      return new NextResponse("Invalid refresh token", { status: 401 });
    }

    // Set new access token cookie
    const accessCookie = getAuthCookie(result.accessToken, 'customer', false);
    cookieStore.set(accessCookie.name, accessCookie.value, {
      httpOnly: accessCookie.httpOnly,
      secure: accessCookie.secure,
      sameSite: accessCookie.sameSite as 'lax',
      path: accessCookie.path,
      expires: accessCookie.expires
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REFRESH_TOKEN_ERROR]', error);
    return new NextResponse("Error refreshing token", { status: 500 });
  }
}
