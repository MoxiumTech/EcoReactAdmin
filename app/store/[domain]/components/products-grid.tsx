"use client";

import type { Product, Size, Color, Brand, FilterParams } from "@/types/models";
import { type ReactNode } from "react";
import { ProductCard } from "./product-card";
import { MobileFilters } from "./mobile-filters";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ArrowUpDown } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import qs from "query-string";

interface ProductsGridProps {
  title: string;
  description?: string;
  items: Product[];
  sizes: Size[];
  colors: Color[];
  brands: Brand[];
  searchParams: FilterParams & {
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sortBy?: string;
  };
}

interface FilterSectionProps {
  title: string;
  children: ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="bg-muted px-4 py-2 border-b">
        <h4 className="font-medium">{title}</h4>
      </div>
      <div className="divide-y">{children}</div>
    </div>
  );
};

const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Most Popular', value: 'popularity' },
];

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  title,
  description,
  items,
  sizes,
  colors,
  brands,
  searchParams,
}) => {
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Get min and max prices from items
  useEffect(() => {
    if (items.length > 0) {
      const prices = items.map(item => 
        item.variants.length > 0 
          ? Math.min(...item.variants.map(v => v.price))
          : item.price
      );
      setPriceRange([
        Math.floor(Math.min(...prices)),
        Math.ceil(Math.max(...prices))
      ]);
    }
  }, [items]);

  const router = useRouter();
  const search = useSearchParams();

  const hasActiveFilters = !!(searchParams.sizeId || searchParams.colorId || searchParams.brandId || searchParams.sort);

  const onFilter = (filterKey: string, value: string | string[]) => {
    const current = qs.parse(search.toString());
    
    const query = {
      ...current,
      [filterKey]: current[filterKey] === value ? null : value,
    };

    const url = qs.stringifyUrl({
      url: window.location.href.split("?")[0],
      query,
    }, { skipNull: true });

    router.push(url);
  };

  const onPriceRangeChange = (range: [number, number]) => {
    const current = qs.parse(search.toString());
    
    const query = {
      ...current,
      minPrice: range[0].toString(),
      maxPrice: range[1].toString(),
    };

    const url = qs.stringifyUrl({
      url: window.location.href.split("?")[0],
      query,
    }, { skipNull: true });

    router.push(url);
  };

  const onSortChange = (value: string) => {
    const current = qs.parse(search.toString());
    
    const query = {
      ...current,
      sort: value,
    };

    const url = qs.stringifyUrl({
      url: window.location.href.split("?")[0],
      query,
    }, { skipNull: true });

    router.push(url);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="py-6 border-b mb-6 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-2xl sm:text-3xl">{title}</h3>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Sort dropdown */}
            <select 
              className="p-2 border rounded-md bg-white/50 backdrop-blur-sm min-w-[200px] hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => onSortChange(e.target.value)}
              value={searchParams.sort || ""}
            >
              <option value="">Sort by</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Mobile filter button */}
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden flex items-center gap-2 hover:bg-accent/50 transition-colors">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full sm:max-w-lg">
                <div className="space-y-6 py-4">
                  <FilterSection title="Price Range">
                    <div className="px-4 py-4">
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={1000}
                        step={10}
                        onValueChange={onPriceRangeChange}
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </FilterSection>
                  
                  <FilterSection title="Availability">
                    <RadioGroup
                      defaultValue={searchParams.inStock || "all"}
                      onValueChange={(value: string) => onFilter("inStock", value)}
                      className="px-4 py-4 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All items</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="in-stock" />
                        <Label htmlFor="in-stock">In stock only</Label>
                      </div>
                    </RadioGroup>
                  </FilterSection>

                  {sizes.length > 0 && (
                    <FilterSection title="Sizes">
                      <div className="px-4 py-4 flex flex-wrap gap-2">
                        {sizes.map((size) => (
                          <Button
                            key={size.id}
                            onClick={() => onFilter("sizeId", size.id)}
                            variant={searchParams.sizeId === size.id ? "default" : "outline"}
                            size="sm"
                          >
                            {size.name}
                          </Button>
                        ))}
                      </div>
                    </FilterSection>
                  )}

                  {colors.length > 0 && (
                    <FilterSection title="Colors">
                      <div className="px-4 py-4 flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <Button
                            key={color.id}
                            onClick={() => onFilter("colorId", color.id)}
                            variant={searchParams.colorId === color.id ? "default" : "outline"}
                            size="sm"
                            className="flex items-center gap-x-2"
                          >
                            <div 
                              className="h-3 w-3 rounded-full border"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.name}
                          </Button>
                        ))}
                      </div>
                    </FilterSection>
                  )}

                  {brands.length > 0 && (
                    <FilterSection title="Brands">
                      <div className="px-4 py-4 flex flex-wrap gap-2">
                        {brands.map((brand) => (
                          <Button
                            key={brand.id}
                            onClick={() => onFilter("brandId", brand.id)}
                            variant={searchParams.brandId === brand.id ? "default" : "outline"}
                            size="sm"
                          >
                            {brand.name}
                          </Button>
                        ))}
                      </div>
                    </FilterSection>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile filters and sorting */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <MobileFilters 
            sizes={sizes}
            colors={colors}
            brands={brands}
            searchParams={searchParams}
            onFilter={onFilter}
          />
        </div>

        {/* Desktop sidebar filters */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-28 space-y-6 bg-card p-6 rounded-lg shadow-sm border">
            <FilterSection title="Price Range">
              <div className="px-4 py-4">
                <Slider
                  defaultValue={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={onPriceRangeChange}
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </FilterSection>

            <FilterSection title="Availability">
              <RadioGroup
                defaultValue={searchParams.inStock || "all"}
                onValueChange={(value: string) => onFilter("inStock", value)}
                className="px-4 py-4 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="desktop-all" />
                  <Label htmlFor="desktop-all">All items</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="desktop-in-stock" />
                  <Label htmlFor="desktop-in-stock">In stock only</Label>
                </div>
              </RadioGroup>
            </FilterSection>

            {sizes.length > 0 && (
              <FilterSection title="Sizes">
                <div className="px-4 py-4 flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <Button
                      key={size.id}
                      onClick={() => onFilter("sizeId", size.id)}
                      variant={searchParams.sizeId === size.id ? "default" : "outline"}
                      size="sm"
                    >
                      {size.name}
                    </Button>
                  ))}
                </div>
              </FilterSection>
            )}

            {colors.length > 0 && (
              <FilterSection title="Colors">
                <div className="px-4 py-4 flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <Button
                      key={color.id}
                      onClick={() => onFilter("colorId", color.id)}
                      variant={searchParams.colorId === color.id ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-x-2"
                    >
                      <div 
                        className="h-3 w-3 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.name}
                    </Button>
                  ))}
                </div>
              </FilterSection>
            )}
            
            {brands.length > 0 && (
              <FilterSection title="Brands">
                <div className="px-4 py-4 flex flex-wrap gap-2">
                  {brands.map((brand) => (
                    <Button
                      key={brand.id}
                      onClick={() => onFilter("brandId", brand.id)}
                      variant={searchParams.brandId === brand.id ? "default" : "outline"}
                      size="sm"
                    >
                      {brand.name}
                    </Button>
                  ))}
                </div>
              </FilterSection>
            )}
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {items.length === 0 ? (
            <EmptyState 
              showReset={hasActiveFilters}
              description={hasActiveFilters 
                ? "No products match your selected filters. Try adjusting or removing them."
                : "This category doesn't have any products yet. Check back later."
              }
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in fade-in-50 duration-500">
              {items.map((item) => (
                <ProductCard key={item.id} data={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
