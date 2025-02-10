"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface StoreSettings {
  currency: string;
  name: string;
  [key: string]: any;
}

const StoreSettingsContext = createContext<StoreSettings>({
  currency: "USD",
  name: "",
});

export const StoreSettingsProvider = ({ 
  children,
  storeId,
}: { 
  children: React.ReactNode;
  storeId: string;
}) => {
  const [settings, setSettings] = useState<StoreSettings>({
    currency: "USD",
    name: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`/api/storefront/${storeId}/store/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch store settings:', error);
      }
    };

    if (storeId) {
      fetchSettings();
    }
  }, [storeId]);

  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error("useStoreSettings must be used within a StoreSettingsProvider");
  }
  return context;
};

export default useStoreSettings;
