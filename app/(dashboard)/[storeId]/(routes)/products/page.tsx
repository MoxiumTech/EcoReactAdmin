import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Permissions } from "@/types/permissions";
import { getUserPermissions } from "@/lib/rbac-middleware";
import prismadb from "@/lib/prismadb";
import { PermissionGate } from "@/components/auth/permission-gate";
import { ProductsContent } from "./components/products-content";

export default async function ProductsPage({
  params
}: {
  params: { storeId: string }
}) {
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
  const canManageProducts = isOwner || userPermissions.includes(Permissions.CREATE_PRODUCTS);

  return (
    <PermissionGate permission={Permissions.VIEW_PRODUCTS}>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <ProductsContent canManage={canManageProducts} />
        </div>
      </div>
    </PermissionGate>
  );
}
