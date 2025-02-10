"use client";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";
import { Card } from "@/components/ui/card";
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
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Heading
          title={`Orders (${data.length})`}
          description="Manage orders for your store"
        />
      </div>
      <Card className="p-0 shadow-sm">
        <div className="p-6 border-b bg-white/50">
          <DataTable searchKey="products" columns={columns} data={data} />
        </div>
      </Card>
      {canManage && (
        <Card className="p-6 shadow-sm">
          <Heading title="API" description="API Endpoints for Orders" />
          <Separator className="my-4" />
          <ApiList entityName="orders" entityIdName="orderId" />
        </Card>
      )}
    </div>
  );
};
