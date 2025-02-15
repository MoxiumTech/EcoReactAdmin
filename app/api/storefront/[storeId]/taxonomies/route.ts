import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    // Get taxonomies with nested taxons
    const taxonomies = await prismadb.taxonomy.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        taxons: {
          where: {
            parentId: null
          },
          orderBy: {
            position: 'asc'
          },
          include: {
            children: {
              orderBy: {
                position: 'asc'
              },
              include: {
                children: {
                  orderBy: {
                    position: 'asc'
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(taxonomies);
  } catch (error) {
    console.error('[TAXONOMIES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
