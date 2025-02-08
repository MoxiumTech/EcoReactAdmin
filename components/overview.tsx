"use client";

import { KPICard } from "./overview/kpi-card";
import { RevenueChart } from "./overview/revenue-chart";
import { StoreInsights } from "./overview/store-insights";
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Package
} from "lucide-react";

interface ChartDataPoint {
  name: string;
  total: number;
}

interface OverviewProps {
  data: ChartDataPoint[];
  customersData: ChartDataPoint[];
  totalRevenue: number;
  totalSales: number;
  totalStock: number;
}

export const Overview: React.FC<OverviewProps> = ({
  data,
  customersData,
  totalRevenue,
  totalSales,
  totalStock
}) => {
  const calculateGrowth = (data: ChartDataPoint[]) => {
    if (data.length < 2) return 0;
    const currentMonth = data[data.length - 1].total;
    const lastMonth = data[data.length - 2].total;
    return lastMonth !== 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;
  };

  const revenueGrowth = calculateGrowth(data);
  const customerGrowth = calculateGrowth(customersData);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          description="from last month"
          trend={revenueGrowth}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Total Customers"
          value={customersData[customersData.length - 1]?.total || 0}
          description="from last month"
          trend={customerGrowth}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Total Sales"
          value={totalSales}
          description="completed orders"
          trend={revenueGrowth}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Stock Items"
          value={totalStock}
          description="products in inventory"
          trend={0}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Chart and Insights Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-5">
          <RevenueChart data={data} customersData={customersData} />
        </div>
        <div className="lg:col-span-2">
          <StoreInsights
            data={data}
            totalRevenue={totalRevenue}
            totalSales={totalSales}
          />
        </div>
      </div>
    </div>
  );
};
