"use client";

import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface StorefrontChatButtonProps {
  onClick: () => void;
  isOpen?: boolean;
}

export const StorefrontChatButton = ({ onClick, isOpen }: StorefrontChatButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-4 right-4 p-4 bg-primary text-primary-foreground",
        "rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
        "flex items-center gap-2 group hover:scale-105 transform",
        !isOpen && "hover:w-auto hover:pr-6",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      <MessageSquare 
        className={cn(
          "h-6 w-6 transition-transform duration-300",
          isOpen && "rotate-90"
        )}
      />
      <span 
        className={cn(
          "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
          !isOpen && "w-0 group-hover:w-20"
        )}
      >
        Need help?
      </span>
    </button>
  );
};
