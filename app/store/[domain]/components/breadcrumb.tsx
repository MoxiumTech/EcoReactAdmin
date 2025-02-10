import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link
        href="/"
        className="transition-colors hover:text-foreground"
      >
        Home
      </Link>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          <Link
            href={item.href}
            className={`transition-colors ${
              index === items.length - 1 
                ? "font-medium text-foreground" 
                : "hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
};
