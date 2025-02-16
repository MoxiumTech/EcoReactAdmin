import { useStore } from '../contexts/StoreContext';

// This hook is deprecated. Use useStore() instead.
export const useStoreLayout = () => {
  console.warn(
    'useStoreLayout is deprecated and will be removed in a future version. ' +
    'Please use useStore() instead.'
  );
  
  const { layout, loading, error, refreshStore } = useStore();

  return {
    layout,
    loading,
    error,
    refresh: refreshStore
  };
};