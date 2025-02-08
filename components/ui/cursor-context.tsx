"use client";

import { createContext, useContext, useState, useEffect } from "react";

type CursorType = "default" | "button" | "text";

type CursorContextType = {
  cursorType: CursorType;
  setCursorType: (type: CursorType) => void;
  isMounted: boolean;
};

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 50);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <CursorContext.Provider value={{ cursorType, setCursorType, isMounted }}>
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
}
