"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CellAction } from "./cell-action";
import { OrderStatus } from "@/app/(dashboard)/[storeId]/(routes)/orders/[orderId]/types";

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
    },
    {
      accessorKey: "products",
      header: "Products",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "address",
      header: "Address",
    },
    {
      accessorKey: "totalPrice",
      header: "Total price",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        
        switch (status) {
          case "completed":
            return <Badge className="bg-green-500">Completed</Badge>;
          case "shipped":
            return <Badge className="bg-blue-500">Shipped</Badge>;
          case "processing":
            return <Badge className="bg-yellow-500">Processing</Badge>;
          case "cancelled":
            return <Badge className="bg-red-500">Cancelled</Badge>;
          default:
            return <Badge>{status}</Badge>;
        }
      }
    },
    {
      accessorKey: "isPaid",
      header: "Paid",
      cell: ({ row }) => (
        <div className={`font-medium ${row.original.isPaid ? "text-green-600" : "text-red-600"}`}>
          {row.original.isPaid ? "Yes" : "No"}
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Date",
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
