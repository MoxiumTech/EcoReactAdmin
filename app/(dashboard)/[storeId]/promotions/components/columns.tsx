"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Badge } from "@/components/ui/badge";

type Customer = {
  id: string;
  name: string;
  email: string;
};

export type PromotionColumn = {
  id: string;
  name: string;
  type: string;
  code: string;
  discount: string;
  isFixed: boolean;
  isActive: boolean;
  usageCount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  customers?: Customer[];
}

export const columns: ColumnDef<PromotionColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <Badge variant={row.original.type === "email" ? "default" : "secondary"}>
          {row.original.type === "email" ? "Email Based" : "Coupon"}
        </Badge>
        {row.original.type === "email" && row.original.customers?.[0] && (
          <span className="text-xs text-muted-foreground mt-1">
            {row.original.customers[0].name}
          </span>
        )}
      </div>
    ),
  },
  {
  accessorKey: "code",
  header: "Code",
  cell: ({ row }) => (
    <div>
      {row.original.type === "email" 
        ? "N/A" 
        : row.original.code || "No code set"}
    </div>
  ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => (
      <div>
        {row.original.isFixed 
          ? `$${Number(row.original.discount).toFixed(2)}`
          : `${Number(row.original.discount)}%`
        }
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "usageCount",
    header: "Uses",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
