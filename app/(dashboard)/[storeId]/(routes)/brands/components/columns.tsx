"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type BrandColumn = {
  id: string
  name: string
  website: string
  isActive: boolean
  createdAt: string
}

export const getColumns = (canManage: boolean): ColumnDef<BrandColumn>[] => {
  const baseColumns: ColumnDef<BrandColumn>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "website",
      header: "Website",
      cell: ({ row }) => (
        <div>
          {row.original.website || "N/A"}
        </div>
      )
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <div className={`font-medium ${row.original.isActive ? "text-green-600" : "text-red-600"}`}>
          {row.original.isActive ? "Active" : "Inactive"}
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Date",
    }
  ];

  if (canManage) {
    baseColumns.push({
      id: "actions",
      cell: ({ row }) => <CellAction data={row.original} canManage={canManage} />
    });
  }

  return baseColumns;
};

// For backward compatibility
export const columns = getColumns(true);
