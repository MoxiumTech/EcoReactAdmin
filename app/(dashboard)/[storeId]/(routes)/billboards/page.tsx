import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { BillboardClient } from "./components/client";
import { BillboardColumn } from "./components/columns";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Permissions } from "@/types/permissions";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/rbac-middleware";

const BillboardsPage = async ({
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
  const canManageBillboards = isOwner || userPermissions.includes(Permissions.MANAGE_BILLBOARDS);

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedBillboards: BillboardColumn[] = billboards.map((item) => ({
    id: item.id,
    label: item.label,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <PermissionGate permission={Permissions.VIEW_BILLBOARDS}>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <BillboardClient
            data={formattedBillboards}
            canManage={canManageBillboards}
          />
        </div>
      </div>
    </PermissionGate>
  );
};

export default BillboardsPage;
