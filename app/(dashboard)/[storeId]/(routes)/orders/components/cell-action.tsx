"use client";

import { useState } from "react";
import { Copy, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
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
import { OrderColumn } from "./columns";

interface CellActionProps {
  data: OrderColumn;
  canManage: boolean;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  canManage
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Order ID copied to clipboard.');
  };

  const onUpdate = async (isPaid: boolean) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/${params.storeId}/orders/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPaid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      router.refresh();
      toast.success('Order updated.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
            {!data.isPaid && (
              <DropdownMenuItem onClick={() => onUpdate(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Paid
              </DropdownMenuItem>
            )}
            {data.isPaid && (
              <DropdownMenuItem onClick={() => onUpdate(false)}>
                <XCircle className="mr-2 h-4 w-4" />
                Mark as Unpaid
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
