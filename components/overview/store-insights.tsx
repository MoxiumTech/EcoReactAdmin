"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";

interface StoreInsightsProps {
  data: any[];
  totalRevenue: number;
  totalSales: number;
}

export const StoreInsights: React.FC<StoreInsightsProps> = ({
  data,
  totalRevenue,
  totalSales
}) => {
  // Calculate average order value
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  
  // Calculate month-over-month revenue growth
  const calculateRevenueGrowth = () => {
    if (data.length < 2) return 0;
    const currentMonth = data[data.length - 1].total;
    const lastMonth = data[data.length - 2].total;
    return lastMonth !== 0 ? ((currentMonth - lastMonth) / lastMonth) * 100 : 0;
  };

  const revenueGrowth = calculateRevenueGrowth();

  // Calculate projected monthly revenue
  const calculateProjectedRevenue = () => {
    if (data.length < 3) return 0;
    const lastThreeMonths = data.slice(-3);
    const average = lastThreeMonths.reduce((sum, month) => sum + month.total, 0) / 3;
    return average * 1.1; // Assuming 10% growth
  };

  const projectedRevenue = calculateProjectedRevenue();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Store Insights</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Average Order Value</span>
            </div>
            <p className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</p>
            <Badge variant="secondary" className="text-xs">
              Key metric for store health
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Monthly Growth Rate</span>
            </div>
            <p className="text-2xl font-bold">
              {revenueGrowth > 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
            </p>
            <Badge 
              variant={revenueGrowth >= 10 ? "default" : "secondary"}
              className="text-xs"
            >
              {revenueGrowth >= 10 ? "Strong growth" : "Steady performance"}
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Revenue Projection</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">
              ${projectedRevenue.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Projected revenue for next month based on 3-month trend
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 border rounded-md hover:bg-accent/10 cursor-pointer transition-colors">
                <p className="font-medium">Revenue Goals</p>
                <p className="text-muted-foreground">Set monthly targets</p>
              </div>
              <div className="p-2 border rounded-md hover:bg-accent/10 cursor-pointer transition-colors">
                <p className="font-medium">Performance Report</p>
                <p className="text-muted-foreground">Download analysis</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
