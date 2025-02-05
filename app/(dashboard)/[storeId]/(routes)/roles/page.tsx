import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { RoleClient } from "./components/client";
import { getUserPermissions } from "@/lib/rbac-middleware";
import { Permissions } from "@/hooks/use-rbac";
import { RoleColumn } from "./components/columns";

export default async function RolesPage({
  params
}: {
  params: { storeId: string }
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/signin');
  }

  // Check if user is store owner
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId: session.userId,
    }
  });

  // If not store owner, check permissions
  const userPermissions = await getUserPermissions(session.userId, params.storeId);
  const canManageRoles = !!store || userPermissions.includes(Permissions.MANAGE_ROLES);

  const roles = await prismadb.role.findMany({
    include: {
      permissions: true
    },
  });

  const formattedRoles: RoleColumn[] = roles.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "No description provided",
    permissions: item.permissions.map(p => p.name),
    createdAt: new Date(item.createdAt).toLocaleDateString()
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RoleClient 
          data={formattedRoles} 
          canManage={canManageRoles}
          description="Manage staff roles and their permissions. Click the eye icon to see detailed access information for each role."
        />
      </div>
    </div>
  );
}
