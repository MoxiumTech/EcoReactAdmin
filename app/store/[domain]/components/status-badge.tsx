import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/app/(dashboard)/[storeId]/(routes)/orders/[orderId]/types";

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusClass = (status: OrderStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "shipped":
        return "bg-blue-500";
      case "processing":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge className={getStatusClass(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
};
