"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  domain: string;
  store: {
    name: string;
    logoUrl: string | null;
  };
  className?: string;
}

export const Logo = ({ domain, store, className }: LogoProps) => {
  return (
    <Link
      href={`/store/${domain}`}
      className={cn(
        "flex items-center gap-x-2 hover:opacity-90 transition-opacity",
        className
      )}
    >
      {store?.logoUrl ? (
        <div className="relative w-8 h-8">
          <Image
            src={store.logoUrl}
            alt={store?.name || "Store"}
            fill
            className="object-contain"
            sizes="32px"
            priority
          />
        </div>
      ) : (
        <p className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          {store?.name || "Store"}
        </p>
      )}
    </Link>
  );
};
