import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "./components/columns";
import { getUserPermissions } from "@/lib/rbac-middleware";
import { Permissions } from "@/types/permissions";
import StaffClient from "./components/client";

export default async function StaffPage({
  params
}: {
  params: { storeId: string }
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/signin');
  }

  // Check if user is the store owner
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      userId: session.userId
    }
  });

  // Get user's role assignments for this store to check permissions
  const roleAssignment = await prismadb.roleAssignment.findFirst({
    where: {
      userId: session.userId,
      storeId: params.storeId,
    },
    include: {
      role: {
        include: {
          permissions: true
        }
      }
    }
  });

  const userPermissions = new Set<string>();
  if (roleAssignment) {
    roleAssignment.role.permissions.forEach(permission => {
      userPermissions.add(permission.name);
    });
  }

  // Store owner or users with MANAGE_ROLES permission can manage staff
  const canManageStaff = store !== null || userPermissions.has(Permissions.MANAGE_ROLES);

  console.log('User Permissions:', Array.from(userPermissions)); // Debug log
  console.log('Can Manage Staff:', canManageStaff); // Debug log

  // Get staff with their roles
  const assignments = await prismadb.$queryRaw`
    SELECT 
      ra.id,
      u.email,
      u.name,
      r.name as role_name,
      ra."createdAt"
    FROM "RoleAssignment" ra
    JOIN "User" u ON ra."userId" = u.id
    JOIN "Role" r ON ra."roleId" = r.id
    WHERE ra."storeId" = ${params.storeId}
    ORDER BY ra."createdAt" DESC
  ` as Array<{
    id: string;
    email: string;
    name: string | null;
    role_name: string;
    createdAt: Date;
  }>;

  const formattedStaff = assignments.map((item) => ({
    id: item.id,
    email: item.email,
    name: item.name || '',
    role: item.role_name,
    joinedDate: new Date(item.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <StaffClient data={formattedStaff} canManage={canManageStaff} />
      </div>
    </div>
  );
}
