import { format } from "date-fns";
import { Attribute } from "@prisma/client";
import prismadb from "@/lib/prismadb";
import { AttributesClient } from "./components/client";
import { AttributeColumn } from "./components/columns";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Permissions } from "@/types/permissions";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/rbac-middleware";

const AttributesPage = async ({
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
  const canManageAttributes = isOwner || userPermissions.includes(Permissions.MANAGE_ATTRIBUTES);
  
  const attributes = await prismadb.attribute.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedAttributes: AttributeColumn[] = attributes.map((item: Attribute) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    type: item.type,
    isRequired: item.isRequired,
    isVisible: item.isVisible,
    position: item.position,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <PermissionGate permission={Permissions.VIEW_ATTRIBUTES}>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <AttributesClient 
            data={formattedAttributes}
            canManage={canManageAttributes}
          />
        </div>
      </div>
    </PermissionGate>
  );
};

export default AttributesPage;
