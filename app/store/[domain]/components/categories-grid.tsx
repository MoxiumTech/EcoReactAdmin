"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface Taxon {
  id: string;
  name: string;
  imageUrl?: string;
  permalink: string;
  description?: string;
  count?: number;
}

interface CategoriesGridProps {
  categories: Taxon[];
  title?: string;
  displayStyle?: "grid" | "list" | "carousel" | "featured";
  itemsPerRow?: number;
  showCount?: boolean;
  className?: string;
}

const getGridColumns = (itemsPerRow: number = 4) => {
  const columns = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  };
  
  return columns[itemsPerRow as keyof typeof columns] || columns[4];
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories = [],
  title = "Shop by Category",
  displayStyle = "grid",
  itemsPerRow = 4,
  showCount = false,
  className
}) => {
  const params = useParams();
  const domain = params?.domain as string;
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      const newScrollLeft = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      carouselRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      // Update buttons after scroll animation
      setTimeout(updateScrollButtons, 300);
    }
  };

  if (displayStyle === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {title && <h2 className="font-bold text-3xl mb-6">{title}</h2>}
        <div className="space-y-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/store/${domain}/category/${category.id}`}
              className="group flex items-center p-4 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-300 hover:shadow-md"
            >
              {category.imageUrl && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden mr-4">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              )}
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {showCount && category.count !== undefined && (
                    <span className="text-sm text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (displayStyle === "carousel") {
    return (
      <div className={cn("space-y-4", className)}>
        {title && <h2 className="font-bold text-3xl mb-6">{title}</h2>}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-200",
              "hover:bg-white hover:scale-110",
              "disabled:opacity-0 disabled:pointer-events-none",
              !canScrollLeft && "opacity-0 pointer-events-none"
            )}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scroll('right')}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-200",
              "hover:bg-white hover:scale-110",
              "disabled:opacity-0 disabled:pointer-events-none",
              !canScrollRight && "opacity-0 pointer-events-none"
            )}
            disabled={!canScrollRight}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Content */}
          <div 
            ref={carouselRef}
            className="flex space-x-6 overflow-x-auto scroll-smooth scrollbar-hide"
            onScroll={updateScrollButtons}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/store/${domain}/category/${category.id}`}
                className="group relative w-80 flex-none aspect-square overflow-hidden rounded-2xl bg-gray-100 transition-all duration-300 hover:shadow-xl"
              >
                {category.imageUrl && (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-white/90 mt-2 line-clamp-2">{category.description}</p>
                    )}
                    {showCount && category.count !== undefined && (
                      <span className="inline-block mt-3 text-sm text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        {category.count} items
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (displayStyle === "featured") {
    return (
      <div className={cn("space-y-4", className)}>
        {title && <h2 className="font-bold text-3xl mb-6">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.slice(0, 1).map((category) => (
            <Link
              key={category.id}
              href={`/store/${domain}/category/${category.id}`}
              className="group relative aspect-[2/1] md:aspect-square row-span-2 overflow-hidden rounded-2xl bg-gray-100"
            >
              {category.imageUrl && (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-white/90 mt-2 line-clamp-2">{category.description}</p>
                  )}
                  {showCount && category.count !== undefined && (
                    <span className="inline-block mt-3 text-sm text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      {category.count} items
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          <div className="grid grid-cols-2 gap-6">
            {categories.slice(1, 5).map((category) => (
              <Link
                key={category.id}
                href={`/store/${domain}/category/${category.id}`}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
              >
                {category.imageUrl && (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {showCount && category.count !== undefined && (
                      <span className="inline-block mt-2 text-sm text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {category.count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && <h2 className="font-bold text-3xl mb-6">{title}</h2>}
      <div className={cn(
        "grid gap-6",
        getGridColumns(itemsPerRow)
      )}>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/store/${domain}/category/${category.id}`}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100 transition-all duration-300 hover:shadow-xl"
          >
            {category.imageUrl && (
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-white/90 mt-2 line-clamp-2">
                    {category.description}
                  </p>
                )}
                {showCount && category.count !== undefined && (
                  <span className="inline-block mt-3 text-sm text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    {category.count} items
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
