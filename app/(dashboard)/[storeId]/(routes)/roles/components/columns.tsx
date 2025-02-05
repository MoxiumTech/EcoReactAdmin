"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { PermissionDisplay } from "./permission-display";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

export type RoleColumn = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
};

interface ColumnProps {
  isOwner: boolean;
}

export const createColumns = ({ isOwner }: ColumnProps): ColumnDef<RoleColumn>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <PermissionDisplay permissions={row.original.permissions} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Role Access Details: {row.original.name}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <h3 className="font-medium mb-2">{row.original.description}</h3>
                <PermissionDisplay permissions={row.original.permissions} showDetails />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <CellAction data={row.original} isOwner={isOwner} />;
    },
  },
];
