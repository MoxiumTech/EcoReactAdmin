"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Loader } from "@/components/ui/loader";
import { StaffForm } from "./components/staff-form";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Permissions } from "@/types/permissions";

interface Role {
  id: string;
  name: string;
}

interface StaffData {
  id: string;
  email: string;
  roleId: string;
}

export default function StaffPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading staff member data...', {
          storeId: params.storeId,
          staffId: params.staffId
        });

        // Load staff member data
        const staffResponse = await axios.get(`/api/${params.storeId}/staff/${params.staffId}`);
        console.log('Staff response:', staffResponse.data);
        setStaffData(staffResponse.data);

        // Load available roles
        const rolesResponse = await axios.get(`/api/${params.storeId}/roles`);
        console.log('Roles response:', rolesResponse.data);
        
        setRoles(rolesResponse.data);
      } catch (error: any) {
        console.error('Error loading data:', error.response || error);
        toast.error(error.response?.data || "Error loading staff member");
        router.push(`/${params.storeId}/staff`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.staffId, params.storeId, router]);

  if (loading || !staffData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader 
          simulateProgress={true}
          status="Loading staff member..."
        />
      </div>
    );
  }

  return (
    <PermissionGate 
      permission={Permissions.VIEW_ROLES}
      managePermission={[Permissions.MANAGE_ROLES, Permissions.MANAGE_STAFF]}
    >
      <div className="flex-col">
        <StaffForm 
          initialData={staffData}
          roles={roles}
          storeId={params.storeId as string}
          staffId={params.staffId as string}
        />
      </div>
    </PermissionGate>
  );
}
