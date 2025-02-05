"use client";

import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { RoleColumn, columns } from "./columns";
import { CreateRoleModal } from "./create-role-modal";

interface RolesClientProps {
  data: RoleColumn[];
  canManage: boolean;
  description?: string;
}

export const RoleClient: React.FC<RolesClientProps> = ({
  data,
  canManage,
  description
}) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <CreateRoleModal 
        isOpen={open}
        onClose={() => {
          setOpen(false);
          router.refresh();
        }}
      />
      <div className="flex items-center justify-between">
        <Heading 
          title={`Roles (${data.length})`} 
          description={description || "Manage roles and permissions for staff members"} 
        />
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Role
          </Button>
        )}
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
    </>
  );
};
