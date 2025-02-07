"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { AttributeColumn, columns } from "./columns";

interface AttributesClientProps {
  data: AttributeColumn[];
  canManage: boolean;
}

export const AttributesClient: React.FC<AttributesClientProps> = ({
  data,
  canManage
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Attributes (${data.length})`}
          description="Manage product attributes for your store"
        />
        {canManage && (
          <Button onClick={() => router.push(`/${params.storeId}/attributes/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      {canManage && (
        <>
          <Heading title="API" description="API calls for Attributes" />
          <Separator />
          <ApiList entityName="attributes" entityIdName="attributeId" />
        </>
      )}
    </>
  );
};
