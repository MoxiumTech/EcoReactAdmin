import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";
import { RoleClient } from "./components/client";
import { getUserPermissions } from "@/lib/rbac-middleware";
import { Permissions } from "@/types/permissions";
import { RoleColumn } from "./components/columns";
import { PermissionGate } from "@/components/auth/permission-gate";

export default async function RolesPage({
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
  const canManageRoles = isOwner || userPermissions.includes(Permissions.MANAGE_ROLES);

  type RoleWithPermissions = Prisma.RoleGetPayload<{
    include: { permissions: true }
  }>;

  const roles: RoleWithPermissions[] = await prismadb.role.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      permissions: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Get default role names for better display
  const defaultRoles = new Set(['Store Admin', 'Catalog Manager', 'Order Manager', 'Content Manager', 'Analytics Viewer']);
  
  const formattedRoles: RoleColumn[] = roles.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "No description provided",
    permissions: item.permissions.map((p: { name: string }) => p.name),
    isDefault: defaultRoles.has(item.name),
    createdAt: new Date(item.createdAt).toLocaleDateString()
  }));

  return (
    <PermissionGate permission={Permissions.VIEW_ROLES}>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <RoleClient 
            data={formattedRoles} 
            canManage={canManageRoles}
            isOwner={isOwner}
            description="Manage staff roles and their permissions. Click the eye icon to see detailed access information for each role."
          />
        </div>
      </div>
    </PermissionGate>
  );
}
