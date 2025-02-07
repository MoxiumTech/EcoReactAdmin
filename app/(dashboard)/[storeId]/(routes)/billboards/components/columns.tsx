"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type BillboardColumn = {
  id: string;
  label: string;
  createdAt: string;
}

export const getColumns = (canManage: boolean): ColumnDef<BillboardColumn>[] => {
  const baseColumns: ColumnDef<BillboardColumn>[] = [
    {
      accessorKey: "label",
      header: "Label",
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
