"use client";

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { TrendingUp, ArrowDownIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  trend: number;
  icon: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  description,
  trend,
  icon
}) => {
  return (
    <Card className="hover:bg-accent/10 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center text-sm">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 text-rose-500 mr-1" />
            )}
            <span 
              className={trend > 0 ? "text-emerald-500" : "text-rose-500"}
            >
              {Math.abs(trend).toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1">{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
