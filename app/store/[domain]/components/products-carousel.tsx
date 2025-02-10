"use client";

import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Product } from "@/types/models";
import { ProductCard } from "./product-card";
import NoResults from "@/components/ui/no-results";
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

interface ProductsCarouselProps {
  title: string;
  items: Product[];
  compact?: boolean;
}

export const ProductsCarousel: React.FC<ProductsCarouselProps> = ({
  title,
  items = [],
  compact = false
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    skipSnaps: false,
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="font-bold text-2xl">{title}</h3>
        <NoResults />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-2xl">{title}</h3>
        <div className="flex items-center gap-x-3">
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            View All
          </button>
          <div className="hidden md:flex items-center gap-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canScrollPrev}
              className={cn(
                "h-8 w-8 rounded-full",
                "border-gray-200 hover:border-gray-300 hover:bg-gray-100",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canScrollNext}
              className={cn(
                "h-8 w-8 rounded-full",
                "border-gray-200 hover:border-gray-300 hover:bg-gray-100",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative -mx-6 px-6">
        <div ref={emblaRef} className="overflow-hidden">
          <div className={cn(
            "flex gap-4 md:gap-6",
            compact ? "-ml-32 md:-ml-48" : "-ml-48 md:-ml-64"
          )}>
            {items.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex-none min-w-0",
                  compact 
                    ? "w-32 md:w-48" 
                    : "w-48 md:w-64"
                )}
              >
                <ProductCard 
                  data={item}
                  size={compact ? "compact" : "default"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
