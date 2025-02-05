"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ApiList } from "@/components/ui/api-list";

import { BrandColumn, columns } from "./columns";

interface BrandsClientProps {
  data: BrandColumn[];
  canManage: boolean;
}

export const BrandsClient: React.FC<BrandsClientProps> = ({
  data,
  canManage
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Brands (${data.length})`}
          description="Manage brands for your store"
        />
        {canManage && (
          <Button onClick={() => router.push(`/${params.storeId}/brands/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        )}
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      {canManage && (
        <>
          <Heading title="API" description="API calls for Brands" />
          <Separator />
          <ApiList entityName="brands" entityIdName="brandId" />
        </>
      )}
    </>
  );
};
