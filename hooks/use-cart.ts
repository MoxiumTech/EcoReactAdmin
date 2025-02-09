import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getCurrentCustomer } from '@/lib/get-customer';

export interface CartItem {
  id: string;
  orderId: string;
  variant: {
    id: string;
    name: string;
    price: number;
    images: Array<{ url: string }>;
    product: {
      name: string;
    }
  };
  quantity: number;
}

interface Cart {
  id: string;
  orderItems: CartItem[];
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  isInitialized: boolean;
  customerId: string | null;
  storeId: string | null;
  addItem: (variantId: string | { id: string, [key: string]: any }) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
}

// Utility function to handle API calls with token refresh
const apiCallWithRefresh = async <T>(
  apiCall: () => Promise<T>
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    if (error.response?.status === 401) {
      try {
        // Attempt to refresh the token
        await axios.post('/api/auth/customer/refresh');
        // Retry the original request
        return await apiCall();
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw error;
      }
    }
    throw error;
  }
};

const useCart = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  isInitialized: false,
  customerId: null as string | null,
  storeId: null as string | null,

  fetchCart: async () => {
    const currentState = get();
    if (currentState.isLoading || currentState.isInitialized) return;
    
    try {
      set({ isLoading: true });
      
      // Get domain from URL
      const pathParts = window.location.pathname.split('/');
      const domain = pathParts[2];
      
      if (!domain) {
        console.error('No domain found in URL');
        return;
      }

      // Get customer information first
      const customer = await apiCallWithRefresh(async () => getCurrentCustomer(domain));
      
      if (!customer) {
        set({ 
          items: [], 
          customerId: null, 
          storeId: null, 
          isInitialized: true 
        });
        return;
      }

      if (!customer.storeId) {
        set({ 
          items: [], 
          customerId: customer.id, 
          storeId: null, 
          isInitialized: true 
        });
        return;
      }
      
      set({ customerId: customer.id, storeId: customer.storeId });

      const response = await apiCallWithRefresh(async () => 
        axios.get(`/api/storefront/${customer.storeId}/cart`)
      );

      if (response.data?.orderItems) {
        set({ 
          items: response.data.orderItems,
          storeId: response.data.storeId,
          customerId: response.data.customerId,
          isInitialized: true
        });
      } else {
        set({ 
          items: [], 
          storeId: customer?.storeId || null, 
          customerId: customer?.id || null,
          isInitialized: true
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Error fetching cart');
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (variantId) => {
    try {
      const currentState = get();
      set({ isLoading: true });

      if (!currentState.storeId) {
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
        const customer = await getCurrentCustomer(domain);
        
        if (!customer) {
          toast.error('Please sign in to add items to cart');
          return;
        }
        set({ customerId: customer.id, storeId: customer.storeId });
      }

      const variantToUse = typeof variantId === 'object' ? variantId.id : variantId;
      const response = await apiCallWithRefresh(async () => 
        axios.post(`/api/storefront/${get().storeId}/cart`, {
          variantId: variantToUse,
          quantity: 1
        })
      );

      if (response.data?.orderItems) {
        set({
          items: response.data.orderItems,
          storeId: response.data.storeId,
          customerId: response.data.customerId,
          isInitialized: true
        });
      } else {
        set({ items: [], isInitialized: true });
      }
      toast.success('Item added to cart');
    } catch (error) {
      toast.error('Error adding item to cart');
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    try {
      const currentState = get();
      set({ isLoading: true });

      if (!currentState.storeId) {
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
        const customer = await apiCallWithRefresh(() => getCurrentCustomer(domain));
        
        if (!customer) {
          toast.error('Please sign in to remove items from cart');
          return;
        }
        set({ customerId: customer.id, storeId: customer.storeId });
      }

      const response = await apiCallWithRefresh(async () => 
        axios.delete(`/api/storefront/${get().storeId}/cart?itemId=${itemId}`)
      );

      if (response.data?.orderItems) {
        set({
          items: response.data.orderItems,
          storeId: response.data.storeId,
          customerId: response.data.customerId,
          isInitialized: true
        });
      } else {
        set({ items: [], isInitialized: true });
      }
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Error removing item from cart');
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity < 1) return;
    
    try {
      const currentState = get();
      set({ isLoading: true });

      if (!currentState.storeId) {
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
        const customer = await apiCallWithRefresh(() => getCurrentCustomer(domain));
        
        if (!customer) {
          toast.error('Please sign in to update cart');
          return;
        }
        set({ customerId: customer.id, storeId: customer.storeId });
      }

      const response = await apiCallWithRefresh(async () => 
        axios.patch(`/api/storefront/${get().storeId}/cart`, {
          itemId,
          quantity
        })
      );

      if (response.data?.orderItems) {
        set({
          items: response.data.orderItems,
          storeId: response.data.storeId,
          customerId: response.data.customerId,
          isInitialized: true
        });
      } else {
        set({ items: [], isInitialized: true });
      }
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Error updating cart');
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useCart;
