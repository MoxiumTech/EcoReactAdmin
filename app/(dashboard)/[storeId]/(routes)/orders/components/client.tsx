"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { getColumns, OrderColumn } from "./columns";

interface OrderClientProps {
  data: OrderColumn[];
  canManage: boolean;
}

export const OrderClient: React.FC<OrderClientProps> = ({
  data,
  canManage
}) => {
  const columns = getColumns(canManage);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Orders (${data.length})`}
          description="Manage orders for your store"
        />
      </div>
      <Separator />
      <DataTable searchKey="products" columns={columns} data={data} />
      {canManage && (
        <>
          <Heading title="API" description="API Endpoints for Orders" />
          <Separator />
          <ApiList entityName="orders" entityIdName="orderId" />
        </>
      )}
    </>
  );
};
