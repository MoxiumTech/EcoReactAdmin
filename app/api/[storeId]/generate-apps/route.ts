import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";
import { generateMobileApp } from "@/lib/generate-mobile-app";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const result = await generateMobileApp(store);

    return NextResponse.json({
      success: true,
      message: "Mobile apps generated successfully",
      appDir: result.appDir
    });

  } catch (error) {
    console.error('[GENERATE_APPS]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}