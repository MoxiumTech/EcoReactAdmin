"use client";

import { useState } from "react";
import { StorefrontChatButton } from "./storefront-chat-button";
import { StorefrontChatDialog } from "./storefront-chat-dialog";

interface StorefrontChatProps {
  storeId: string;
  customerId?: string;
}

export const StorefrontChat = ({ storeId, customerId }: StorefrontChatProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show chat if customer is logged in
  if (!customerId) return null;

  return (
    <>
      <StorefrontChatDialog 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        storeId={storeId}
        customerId={customerId}
      />
      <StorefrontChatButton 
        onClick={() => setIsOpen(!isOpen)} 
        isOpen={isOpen} 
      />
    </>
  );
};
