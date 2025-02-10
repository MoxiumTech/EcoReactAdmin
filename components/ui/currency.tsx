"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPriceWithCurrency } from "@/lib/price-formatter";
import { useStoreSettings } from "@/hooks/use-store-settings";

interface CurrencyProps {
  value?: number | string;
  className?: string;
}

const Currency: React.FC<CurrencyProps> = ({
  value = 0,
  className
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const { currency } = useStoreSettings();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return ( 
    <div className={cn("font-semibold", className)}>
      {formatPriceWithCurrency(value, currency)}
    </div>
  );
};

export { Currency };
