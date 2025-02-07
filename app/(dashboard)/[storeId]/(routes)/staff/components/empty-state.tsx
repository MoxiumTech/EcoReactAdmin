"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onInvite: () => void;
  canManage: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onInvite,
  canManage
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Plus className="h-20 w-20 text-gray-400" />
      </div>
      <h3 className="text-2xl font-medium">No staff members yet</h3>
      {canManage ? (
        <>
          <p className="text-center text-muted-foreground max-w-sm">
            Get started by inviting team members to help manage your store.
            They will receive an email invitation to join.
          </p>
          <Button size="lg" onClick={onInvite}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Staff Member
          </Button>
        </>
      ) : (
        <p className="text-center text-muted-foreground max-w-sm">
          No staff members have been added to this store yet.
        </p>
      )}
    </div>
  );
};
