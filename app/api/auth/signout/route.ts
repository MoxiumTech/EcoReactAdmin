import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
) {
  try {
    const cookieStore = await cookies();
    
    // Get root domain for cookie deletion
    const rootDomain = process.env.MAIN_DOMAIN?.split(':')[0]; // Remove port
    const baseRootDomain = rootDomain?.startsWith('admin.') ? rootDomain.substring(6) : rootDomain;
    
    // Clear tokens from root domain
    cookieStore.set('admin_token', '', {
      expires: new Date(0),
      path: '/',
      domain: `.${baseRootDomain}`
    });
    cookieStore.set('customer_token', '', {
      expires: new Date(0),
      path: '/',
      domain: `.${baseRootDomain}`
    });

    console.log('[SIGNOUT] Clearing cookies for domain:', `.${baseRootDomain}`);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.log('[SIGNOUT]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
