"use client";

import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { RoleColumn, createColumns } from "./columns";
// Component removed since we're using a dedicated page for role creation

interface RolesClientProps {
  data: RoleColumn[];
  canManage: boolean;
  isOwner: boolean;
  description?: string;
}

export const RoleClient: React.FC<RolesClientProps> = ({
  data,
  canManage,
  isOwner,
  description
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading 
          title={`Roles (${data.length})`} 
          description={description || "Manage roles and permissions for staff members"} 
        />
        {canManage && (
          <Button onClick={() => router.push(`/${params.storeId}/roles/new`)}>
            <Plus className="mr-2 h-4 w-4" /> Create Role
          </Button>
        )}
      </div>
      <Separator />
      <DataTable 
        columns={createColumns({ isOwner })} 
        data={data} 
        searchKey="name" 
      />
    </>
  );
};
