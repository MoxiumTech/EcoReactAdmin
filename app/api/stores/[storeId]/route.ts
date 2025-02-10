import { NextResponse } from "next/server";
import { getAdminSession, isAdmin } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session || !isAdmin(session)) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    const body = await req.json();
    
    const { 
      name,
      domain,
      customCss,
      logoUrl,
      faviconUrl,
      themeSettings,
      currency 
    } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        message: "Name is required"
      }, { status: 400 });
    }

    if (!params.storeId) {
      return NextResponse.json({
        success: false,
        message: "Store ID is required"
      }, { status: 400 });
    }

    // Check if domain is unique if provided
    if (domain) {
      const existingStore = await prismadb.store.findFirst({
        where: {
          domain,
          NOT: {
            id: params.storeId
          }
        }
      });

      if (existingStore) {
        return NextResponse.json({
          success: false,
          message: "Domain is already in use"
        }, { status: 400 });
      }
    }

    // Use update instead of updateMany to get the updated store data
    const store = await prismadb.store.update({
      where: {
        id: params.storeId
      },
      data: {
        name: String(name),
        domain: domain ? String(domain) : null,
        customCss: customCss ? String(customCss) : null,
        logoUrl: logoUrl ? String(logoUrl) : null,
        faviconUrl: faviconUrl ? String(faviconUrl) : null,
        themeSettings: themeSettings || null,
        currency: currency || 'USD',
      }
    });

    return NextResponse.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('[STORE_PATCH]', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Internal error"
    }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session || !isAdmin(session)) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    if (!params.storeId) {
      return NextResponse.json({
        success: false,
        message: "Store ID is required"
      }, { status: 400 });
    }

    // Use delete instead of deleteMany since we're deleting by unique ID
    const store = await prismadb.store.delete({
      where: {
        id: params.storeId
      }
    });

    return NextResponse.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('[STORE_DELETE]', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Internal error"
    }, { status: 500 });
  }
}
