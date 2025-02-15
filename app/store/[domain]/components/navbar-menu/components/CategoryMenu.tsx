"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Taxon {
  id: string;
  name: string;
  permalink: string;
  children: Taxon[];
}

interface Category {
  id: string;
  name: string;
  taxons: Taxon[];
}

interface CategoryMenuProps {
  domain: string;
  taxonomies: Category[];
  className?: string;
}

const NestedTaxon = ({ taxon, domain }: { taxon: Taxon; domain: string }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group/nested"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={`/store/${domain}/category/${taxon.id}`}
        className={cn(
          "flex items-center justify-between w-full px-5 py-3",
          "text-sm font-medium hover:bg-accent/40 transition-all duration-200",
          "focus:bg-accent/40 outline-none text-muted-foreground hover:text-foreground",
          "first:rounded-t-lg last:rounded-b-lg",
          "relative after:absolute after:bottom-0 after:left-5 after:right-5 after:h-[1px]",
          "after:origin-left after:scale-x-0 hover:after:scale-x-100 after:bg-primary/50 after:transition-transform after:duration-300"
        )}
      >
        <span>{taxon.name}</span>
        {taxon.children?.length > 0 && (
          <ChevronRight className="h-4 w-4 ml-3 opacity-40 group-hover/nested:opacity-100 group-hover/nested:translate-x-0.5 transition-all" />
        )}
      </Link>
      
      {taxon.children?.length > 0 && isHovered && (
        <div 
          className={cn(
            "absolute left-[calc(100%-0.5rem)] top-0 min-w-[14rem]",
            "animate-in fade-in slide-in-from-left-1 duration-200",
            "bg-background/95 backdrop-blur-sm border rounded-lg",
            "shadow-lg ring-1 ring-black/5 p-1"
          )}
        >
          {taxon.children.map((child) => (
            <NestedTaxon key={child.id} taxon={child} domain={domain} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryMenu = ({ domain, taxonomies, className }: CategoryMenuProps) => {
  return (
    <div className={cn("border-t border-border/40 w-full bg-background/95 backdrop-blur-sm sticky top-0 z-40", className)}>
      <div className="container mx-auto">
        <div className="flex items-center h-14">
          {taxonomies.map((category) => (
            <div key={category.id} className="relative group">
              <button 
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5",
                  "text-sm font-medium text-muted-foreground hover:text-foreground transition-all",
                  "focus:text-foreground outline-none",
                  "after:absolute after:bottom-0 after:left-0 after:h-0.5",
                  "after:w-0 group-hover:after:w-full after:bg-primary after:transition-all after:duration-300"
                )}
              >
                {category.name}
                <ChevronDown className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
              
              {/* Dropdown */}
              <div className={cn(
                "absolute left-0 top-[calc(100%+0.5rem)] min-w-[14rem]",
                "invisible group-hover:visible opacity-0 group-hover:opacity-100",
                "bg-background/95 backdrop-blur-sm border rounded-lg",
                "shadow-lg ring-1 ring-black/5 p-1",
                "transform -translate-y-2 group-hover:translate-y-0 scale-95 group-hover:scale-100",
                "transition-all duration-200 ease-out origin-top-left"
              )}>
                {category.taxons.map((taxon) => (
                  <NestedTaxon key={taxon.id} taxon={taxon} domain={domain} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
