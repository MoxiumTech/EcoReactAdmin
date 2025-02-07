import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";
import { getFormatter } from "@/lib/utils";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Permissions } from "@/types/permissions";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions } from "@/lib/rbac-middleware";
import { Prisma } from "@prisma/client";

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        variant: true;
      };
    };
  };
}>;

const OrdersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const formatter = getFormatter();
  const session = await getAdminSession();

  if (!session) {
    redirect('/signin');
  }

  // Check if user is store owner and get their permissions
  const [store, userPermissions] = await Promise.all([
    prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    }),
    getUserPermissions(session.userId, params.storeId)
  ]);

  const isOwner = !!store;
  const canManageOrders = isOwner || userPermissions.includes(Permissions.MANAGE_ORDERS);

  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      orderItems: {
        include: {
          variant: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedOrders: OrderColumn[] = (orders as OrderWithRelations[]).map((order) => ({
    id: order.id,
    phone: order.phone,
    address: order.address,
    products: order.orderItems
      .map(item => item.variant?.name || 'Unknown')
      .join(', '),
    totalPrice: formatter.format(
      order.orderItems.reduce((total, item) => {
        const price = item.variant?.price ? parseFloat(item.variant.price.toString()) : 0;
        return total + (price * item.quantity);
      }, 0)
    ),
    isPaid: order.isPaid,
    createdAt: format(order.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <PermissionGate permission={Permissions.VIEW_ORDERS}>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <OrderClient 
            data={formattedOrders}
            canManage={canManageOrders}
          />
        </div>
      </div>
    </PermissionGate>
  );
};

export default OrdersPage;
