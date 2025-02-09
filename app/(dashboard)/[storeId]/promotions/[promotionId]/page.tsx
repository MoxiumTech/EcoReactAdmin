import prismadb from "@/lib/prismadb";

import { PromotionForm } from "./components/promotion-form";

const PromotionPage = async ({
  params
}: {
  params: { promotionId: string, storeId: string }
}) => {
  const promotion = params.promotionId === 'new' ? null : await prismadb.promotion.findUnique({
    where: {
      id: params.promotionId
    }
  });

  const customers = await prismadb.customer.findMany({
    where: {
      storeId: params.storeId
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PromotionForm 
          initialData={promotion}
          customers={customers}
        />
      </div>
    </div>
  );
}

export default PromotionPage;
