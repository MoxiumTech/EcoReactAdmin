"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type OrderColumn = {
  id: string
  phone: string
  address: string
  isPaid: boolean
  totalPrice: string
  products: string
  createdAt: string
}

export const getColumns = (canManage: boolean): ColumnDef<OrderColumn>[] => {
  const baseColumns: ColumnDef<OrderColumn>[] = [
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
