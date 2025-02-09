import { CreditCard, DollarSign, Package, Users } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Overview } from "@/components/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getSalesCount } from "@/actions/get-sales-count";
import { getGraphRevenue } from "@/actions/get-graph-revenue";
import { getStockCount } from "@/actions/get-stock-count";
import getCustomersCount from "@/actions/get-customers-count";
import { getGraphCustomers } from "@/actions/get-graph-customers";
import prismadb from "@/lib/prismadb";
import { getFormatter, formatPrice } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

type StoreWithRoles = Prisma.StoreGetPayload<{
  include: {
    roleAssignments: {
      include: {
        role: true
      }
    }
  }
}>;

interface DashboardPageProps {
  params: {
    storeId: string;
  };
};

const DashboardPage: React.FC<DashboardPageProps> = async ({
  params
}) => {
  const { storeId } = await params;
  
  // Get current admin session
  const { getAdminSession } = await import("@/lib/auth");
  const session = await getAdminSession();
  const userId = session?.userId;

  if (!userId) {
    throw new Error("Unauthenticated");
  }

  console.log('[DASHBOARD] Attempting to find store with:', { userId, storeId });
  
  // Fetch store settings with access check and include relations for debugging
  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      OR: [
        { userId: userId },
        {
          roleAssignments: {
            some: {
              userId: userId
            }
          }
        }
      ]
    },
    include: {
      roleAssignments: {
        where: {
          userId: userId
        },
        include: {
          role: true
        }
      }
    }
  });

  console.log('[DASHBOARD] Raw store result:', { 
    store,
    hasStore: !!store,
    roleAssignments: store?.roleAssignments,
    roleAssignmentsLength: store?.roleAssignments?.length
  });

  if (!store) {
    console.log('[DASHBOARD] No store found. Checking if user has any accessible stores...');
    
    // Try to find any store where user has a role assignment
    const storeWithRoleAssignment = await prismadb.store.findFirst({
      where: {
        roleAssignments: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        roleAssignments: {
          where: {
            userId: userId
          },
          include: {
            role: true
          }
        }
      }
    });

    console.log('[DASHBOARD] Store with role assignment check:', {
      found: !!storeWithRoleAssignment,
      storeId: storeWithRoleAssignment?.id,
      roles: storeWithRoleAssignment?.roleAssignments.map(ra => ra.role.name)
    });

    if (!storeWithRoleAssignment) {
      console.log('[DASHBOARD] No accessible stores found');
      redirect('/signin');
    }

    // Redirect to the accessible store
    const redirectUrl = `/${storeWithRoleAssignment.id}/overview`;
    console.log('[DASHBOARD] Redirecting to:', redirectUrl);
    redirect(redirectUrl);
  }

  // Log successful access
  console.log('[DASHBOARD] Store access granted:', {
    userId,
    storeName: store.name,
    accessType: store.userId === userId ? 'owner' : 'staff',
    roles: store.roleAssignments.map((ra: { role: { name: string } }) => ra.role.name)
  });

  const formatter = getFormatter({
    currency: store.currency || 'USD',
    locale: store.locale || 'en-US'
  });

  const totalRevenue = await getTotalRevenue(storeId);
  const graphRevenue = await getGraphRevenue(storeId);
  const graphCustomers = await getGraphCustomers(storeId);
  const salesCount = await getSalesCount(storeId);
  const stockCount = await getStockCount(storeId);
  const customersCount = await getCustomersCount(storeId);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your store" />
        <Separator />
        <Card>
          <CardContent className="p-6">
            <Overview 
              data={graphRevenue} 
              customersData={graphCustomers}
              totalRevenue={totalRevenue}
              totalSales={salesCount}
              totalStock={stockCount}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
