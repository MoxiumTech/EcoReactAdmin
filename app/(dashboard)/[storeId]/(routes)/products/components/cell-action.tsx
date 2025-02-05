"use client";

import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash, Archive, RefreshCcw } from "lucide-react";
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
import { useRBAC } from "@/hooks/use-rbac";
import { Permissions } from "@/types/permissions";

import { ProductColumn } from "./columns";

interface CellActionProps {
  data: ProductColumn;
}

export const CellAction: React.FC<CellActionProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { hasPermission } = useRBAC(params.storeId as string);

  // Check individual permissions
  const canEdit = hasPermission(Permissions.EDIT_PRODUCTS);
  const canArchive = hasPermission(Permissions.EDIT_PRODUCTS);
  const canDelete = hasPermission(Permissions.DELETE_PRODUCTS);

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Product ID copied to clipboard");
  };

  const onArchive = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/${params.storeId}/products/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isVisible: data.isArchived // If it's archived, we make it visible, and vice versa
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      router.refresh();
      toast.success(data.isArchived ? "Product restored." : "Product archived.");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/${params.storeId}/products/${data.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      router.refresh();
      toast.success("Product deleted.");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
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
          {canEdit && (
            <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/products/${data.id}`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {canArchive && (
            <DropdownMenuItem onClick={onArchive}>
              {data.isArchived ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Restore
                </>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </>
              )}
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
