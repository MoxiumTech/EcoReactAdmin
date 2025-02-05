"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { ProductsTableShell } from "./products-table-shell";

interface ProductsContentProps {
  canManage: boolean;
}

export function ProductsContent({ canManage }: ProductsContentProps) {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Products"
          description="Manage your product catalog"
        />
        {canManage && (
          <Button
            onClick={() => router.push(`/${params.storeId}/products/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>
      <Separator />
      <ProductsTableShell canManage={canManage} />
    </>
  );
}
