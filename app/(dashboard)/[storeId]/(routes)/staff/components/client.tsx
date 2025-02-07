"use client";

import { Plus, UserPlus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StaffColumn, columns } from "./columns";
import { InviteModal } from "./invite-modal";
import { EmptyState } from "./empty-state";
import { useState } from "react";

interface StaffClientProps {
  data: StaffColumn[];
  canManage: boolean;
}

const StaffClient: React.FC<StaffClientProps> = ({
  data,
  canManage
}) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <InviteModal 
        isOpen={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex items-center justify-between">
        <Heading 
          title={`Staff Members (${data.length})`} 
          description="Invite and manage your store staff members"
        />
        {canManage && (
          <Button onClick={() => setOpen(true)} size="lg">
            <UserPlus className="mr-2 h-5 w-5" /> Invite Staff Member
          </Button>
        )}
      </div>
      <Separator />
      {canManage && (
        <Alert>
          <AlertDescription>
            Staff members can help you manage your store. Each staff member can be assigned different roles with specific permissions.
          </AlertDescription>
        </Alert>
      )}
      {data.length === 0 ? (
        <EmptyState onInvite={() => setOpen(true)} canManage={canManage} />
      ) : (
        <DataTable columns={columns} data={data} searchKey="email" />
      )}
    </>
  );
};

export default StaffClient;
