"use client";

import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modals/alert-modal";

import { BrandColumn } from "./columns";

interface CellActionProps {
  data: BrandColumn;
  canManage: boolean;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  canManage
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Brand ID copied to clipboard.');
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${params.storeId}/brands/${data.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete brand');
      }

      router.refresh();
      toast.success('Brand deleted.');
    } catch (error) {
      toast.error('Make sure you removed all products using this brand first.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onToggleActive = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${params.storeId}/brands/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !data.isActive
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update brand');
      }

      router.refresh();
      toast.success('Brand updated.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Id
          </DropdownMenuItem>
          {canManage && (
            <>
              <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/brands/${data.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive}>
                <Edit className="mr-2 h-4 w-4" />
                {data.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
