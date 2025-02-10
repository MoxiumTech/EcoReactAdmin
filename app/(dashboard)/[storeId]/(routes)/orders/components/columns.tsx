"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-action";
import { OrderStatus } from "@/app/(dashboard)/[storeId]/(routes)/orders/[orderId]/types";
import { cn } from "@/lib/utils";

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  status: OrderStatus;
  totalPrice: string;
  products: string;
  createdAt: string;
};

export const getColumns = (canManage: boolean): ColumnDef<OrderColumn>[] => {
  const baseColumns: ColumnDef<OrderColumn>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.id}</span>
      )
    },
    {
      accessorKey: "products",
      header: "Products",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.products}>
          {row.original.products}
        </div>
      )
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.phone}</span>
      )
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.address}>
          {row.original.address}
        </div>
      )
    },
    {
      accessorKey: "totalPrice",
      header: "Total price",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.totalPrice}</span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusStyles: Record<OrderStatus, string> = {
          completed: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
          shipped: "bg-blue-50 text-blue-700 border-blue-200/50",
          processing: "bg-yellow-50 text-yellow-700 border-yellow-200/50",
          cancelled: "bg-red-50 text-red-700 border-red-200/50",
          cart: "bg-gray-50 text-gray-700 border-gray-200/50"
        };
        
        return (
          <Badge 
            className={cn(
              "border px-2 py-0.5",
              statusStyles[status] || "bg-gray-100 text-gray-700"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      }
    },
    {
      accessorKey: "isPaid",
      header: "Payment",
      cell: ({ row }) => {
        const isPaid = row.original.isPaid;
        return (
          <Badge 
            variant={isPaid ? "default" : "destructive"}
            className={cn(
              "px-2 py-0.5",
              isPaid ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-red-50 text-red-700 hover:bg-red-50"
            )}
          >
            {isPaid ? "Paid" : "Pending"}
          </Badge>
        );
      }
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.createdAt}
        </span>
      )
    }
  ];

  // Only add actions column if user can manage
  if (canManage) {
    baseColumns.push({
      id: "actions",
      cell: ({ row }) => <CellAction data={row.original} canManage={canManage} />,
    });
  }

  return baseColumns;
};

// For backward compatibility
export const columns = getColumns(true);
