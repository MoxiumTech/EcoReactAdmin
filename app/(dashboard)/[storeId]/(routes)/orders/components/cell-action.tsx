"use client";

import { useState } from "react";
import { Copy, MoreHorizontal, CheckCircle, XCircle, Package, Ban } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { OrderColumn } from "./columns";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps {
  data: OrderColumn;
  canManage: boolean;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
  canManage
}) => {
  const [loading, setLoading] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const router = useRouter();
  const params = useParams();

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Order ID copied to clipboard.');
  };

  const onUpdateStatus = async (status: 'completed' | 'cancelled') => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/${params.storeId}/orders/${data.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update order status');
      }

      router.refresh();
      toast.success(`Order ${status === 'completed' ? 'completed' : 'cancelled'} successfully`);
      setShowCancelAlert(false);
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePayment = async (isPaid: boolean) => {
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
      toast.success('Payment status updated.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={showCancelAlert}
        onClose={() => setShowCancelAlert(false)}
        onConfirm={() => onUpdateStatus('cancelled')}
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
          <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/orders/${data.id}`)}>
            <Package className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Id
          </DropdownMenuItem>
          {canManage && data.status === 'processing' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onUpdateStatus('completed')}>
                <Package className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowCancelAlert(true)}
                className="text-red-600"
              >
                <Ban className="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
            </>
          )}
          {canManage && (
            <>
              <DropdownMenuSeparator />
              {!data.isPaid && (
                <DropdownMenuItem onClick={() => onUpdatePayment(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Paid
                </DropdownMenuItem>
              )}
              {data.isPaid && (
                <DropdownMenuItem onClick={() => onUpdatePayment(false)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark as Unpaid
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
