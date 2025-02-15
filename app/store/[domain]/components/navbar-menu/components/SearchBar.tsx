"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number | string;
  compareAtPrice: number | string | null;
  images: Array<{
    url: string;
    alt: string | null;
  }>;
  brand: {
    name: string;
    slug: string;
  } | null;
  sku: string | null;
  inStock: boolean;
  tags: string[];
}

interface SearchBarProps {
  storeId: string;
  domain: string;
  className?: string;
}

export const SearchBar = ({ storeId, domain, className }: SearchBarProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!debouncedQuery || !storeId) {
      setSearchResults([]);
      return;
    }

    const searchProducts = async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/storefront/${storeId}/search?q=${encodeURIComponent(debouncedQuery)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(`Search failed: ${response.status}`);
        const products = await response.json();
        setSearchResults(products);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    if (debouncedQuery.length >= 2) {
      searchProducts();
    }
  }, [debouncedQuery, storeId]);

  return (
    <div className={cn("relative w-full", className)}>
      <form className="w-full" onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full h-10 pl-4 pr-10 rounded-full border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              if (!value.trim()) {
                setSearchResults([]);
              }
            }}
            minLength={2}
          />
          <div className="absolute right-3 top-2.5">
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </form>

      {searchResults.length > 0 && (
        <div className="absolute mt-2 w-full bg-background border rounded-lg shadow-lg max-h-[80vh] overflow-auto z-50">
          {searchResults.map((product) => (
            <Link
              key={product.id}
              href={`/store/${domain}/product/${product.slug}`}
              className="flex items-start gap-4 p-4 hover:bg-accent transition-colors border-b last:border-b-0"
              onClick={() => {
                setSearchResults([]);
                setSearchQuery("");
              }}
            >
              {product.images?.[0] && (
                <div className="relative w-16 h-16 flex-shrink-0">
                  <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    fill
                    className="object-contain rounded"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium truncate">{product.name}</h4>
                    {product.brand && (
                      <p className="text-sm text-muted-foreground">
                        {product.brand.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(product.price))}
                    </p>
                    {product.compareAtPrice &&
                      Number(product.compareAtPrice) > Number(product.price) && (
                        <p className="text-sm text-muted-foreground line-through">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(Number(product.compareAtPrice))}
                        </p>
                      )}
                  </div>
                </div>
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {product.inStock ? (
                    <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                  {product.sku && (
                    <span className="text-xs text-muted-foreground">
                      SKU: {product.sku}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
