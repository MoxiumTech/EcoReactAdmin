"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Loader } from "@/components/ui/loader";
import { RoleForm } from "./components/role-form";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Permissions } from "@/types/permissions";

interface RoleData {
  name: string;
  description: string;
  permissions: string[];
}

export default function RolePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<RoleData | null>(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const response = await axios.get(`/api/${params.storeId}/roles/${params.roleId}`);
        setData(response.data);
      } catch (error) {
        toast.error("Error loading role");
        router.push(`/${params.storeId}/roles`);
      }
    };

    loadRole();
  }, [params.roleId, params.storeId, router]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader 
          simulateProgress={true}
          status="Loading your Roles..."
        />
      </div>
    );
  }

  return (
    <PermissionGate 
      permission={Permissions.VIEW_ROLES}
      managePermission={Permissions.MANAGE_ROLES}
    >
      <div className="flex-col">
        <RoleForm 
          initialData={data}
          storeId={params.storeId as string}
          roleId={params.roleId as string}
        />
      </div>
    </PermissionGate>
  );
}
