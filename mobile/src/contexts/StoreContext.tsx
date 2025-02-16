import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreDetails } from '../types/api';
import { HomeLayout } from '../types/layout';
import { getStoreDetails, getStoreLayout } from '../utils/api';
import { handleApiError } from '../utils/error-handler';

interface StoreContextType {
  store: StoreDetails | null;
  layout: HomeLayout | null;
  loading: boolean;
  error: Error | null;
  refreshStore: () => Promise<void>;
}

const initialStore: StoreDetails = {
  id: '',
  name: '',
  description: '',
  logoUrl: '',
  bannerUrl: '',
  currency: 'USD',
  taxonomies: [],
  cart: {
    id: '',
    items: [],
    total: 0
  },
  settings: {
    theme: {
      primaryColor: '',
      secondaryColor: ''
    }
  }
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<StoreDetails | null>(initialStore);
  const [layout, setLayout] = useState<HomeLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const [storeResponse, layoutResponse] = await Promise.all([
        getStoreDetails(),
        getStoreLayout()
      ]);

      // Ensure cart is always initialized
      const storeData = {
        ...storeResponse.data,
        cart: storeResponse.data.cart || {
          id: '',
          items: [],
          total: 0
        }
      };

      setStore(storeData);
      setLayout(layoutResponse.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching store data:', err);
      handleApiError(err, 'Failed to load store data');
      setError(err as Error);
      // Keep the initial store state on error to prevent undefined issues
      setStore(initialStore);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  const refreshStore = async () => {
    await fetchStoreData();
  };

  const value = {
    store,
    layout,
    loading,
    error,
    refreshStore
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

// HOC to ensure store data is available
export const withStoreData = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithStoreData: React.FC<P> = (props) => {
    const { loading, error, refreshStore } = useStore();

    if (loading) {
      // You could add a custom loading component here
      return null;
    }

    if (error) {
      // You could add a custom error component here
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  WithStoreData.displayName = `WithStoreData(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithStoreData;
};