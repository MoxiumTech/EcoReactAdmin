import { NextResponse } from "next/server";
import { refreshCustomerToken } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return new NextResponse("Refresh token required", { status: 400 });
    }

    const result = await refreshCustomerToken(refreshToken);
    
    if (!result) {
      return new NextResponse("Invalid refresh token", { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.log('[REFRESH_TOKEN]', error);
    return new NextResponse("Invalid refresh token", { status: 401 });
  }
}
