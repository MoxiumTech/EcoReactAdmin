"use client";

import { Product } from "@/types/models";
import { ProductCard } from "./product-card";
import NoResults from "@/components/ui/no-results";
import { cn } from "@/lib/utils";

interface ProductsListProps {
  title: string;
  items: Product[];
  compact?: boolean;
}

export const ProductsList: React.FC<ProductsListProps> = ({
  title,
  items = [],
  compact = false
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-2xl">{title}</h3>
        {items.length > 0 && (
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <NoResults />
      ) : (
        <div className={cn(
          "grid gap-4 md:gap-6",
          compact 
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" 
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        )}>
          {items.map((item) => (
            <ProductCard 
              key={item.id} 
              data={item}
              size={compact ? "compact" : "default"}
            />
          ))}
        </div>
      )}
    </div>
  );
};
