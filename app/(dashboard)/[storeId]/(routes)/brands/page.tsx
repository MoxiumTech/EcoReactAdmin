import { format } from "date-fns";
import { Brand } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import { BrandsClient } from "./components/client";
import { BrandColumn } from "./components/columns";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Permissions } from "@/types/permissions";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/rbac-middleware";

const BrandsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const session = await getAdminSession();

  if (!session) {
    redirect('/signin');
  }

  // Check if user is store owner and get their permissions
  const [store, userPermissions] = await Promise.all([
    prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    }),
    getUserPermissions(session.userId, params.storeId)
  ]);

  const isOwner = !!store;
  const canManageBrands = isOwner || userPermissions.includes(Permissions.MANAGE_BRANDS);

  const brands = await prismadb.brand.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedBrands: BrandColumn[] = brands.map((item: Brand) => ({
    id: item.id,
    name: item.name,
    website: item.website,
    isActive: item.isActive,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <PermissionGate permission={Permissions.VIEW_BRANDS}>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <BrandsClient 
            data={formattedBrands} 
            canManage={canManageBrands}
          />
        </div>
      </div>
    </PermissionGate>
  );
};

export default BrandsPage;
