import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { PromotionClient } from "./components/client";
import { PromotionColumn } from "./components/columns";

const PromotionsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const promotions = await prismadb.promotion.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      customers: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedPromotions: PromotionColumn[] = promotions.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    code: item.code || "N/A",
    discount: item.discount.toString(),
    isFixed: item.isFixed,
    isActive: item.isActive,
    usageCount: item.usageCount,
    startDate: item.startDate ? format(item.startDate, 'MMMM do, yyyy') : "N/A",
    endDate: item.endDate ? format(item.endDate, 'MMMM do, yyyy') : "N/A",
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
    customers: item.customers
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PromotionClient data={formattedPromotions} />
      </div>
    </div>
  );
};

export default PromotionsPage;
