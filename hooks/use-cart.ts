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

const useCart = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  isInitialized: false,
  customerId: null as string | null,
  storeId: null as string | null,

  fetchCart: async () => {
    const currentState = get();
    if (currentState.isLoading || currentState.isInitialized) return; // Prevent multiple fetches
    
    try {
      // Batch state updates
      const updates = { isLoading: true };
      set(updates);
      
      // Get domain from URL (/store/[domain]/...)
      const pathParts = window.location.pathname.split('/');
      const domain = pathParts[2];
      
      if (!domain) {
        console.error('No domain found in URL');
        return;
      }

      // Get customer information first
      const customer = await getCurrentCustomer(domain);
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

      const response = await axios.get(`/api/storefront/${customer.storeId}/cart`);
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

  addItem: async (variantId: string | { id: string, [key: string]: any }) => {
    try {
      const currentState = get();
      // Batch state updates
      const updates = { isLoading: true };
      set(updates);

      if (!currentState.storeId) {
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
        const customer = await getCurrentCustomer(domain);
        
        if (!customer) {
          toast.error('Please sign in to add items to cart');
          return;
        }
        set({ ...updates, customerId: customer.id, storeId: customer.storeId });
      }

      const variantToUse = typeof variantId === 'object' ? variantId.id : variantId;
      const response = await axios.post(`/api/storefront/${get().storeId}/cart`, {
        variantId: variantToUse,
        quantity: 1
      });
      console.log('Add item response:', response.data);
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

  removeItem: async (itemId: string) => {
    try {
      const currentState = get();
      // Batch state updates
      const updates = { isLoading: true };
      set(updates);

      if (!currentState.storeId) {
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
        const customer = await getCurrentCustomer(domain);
        
        if (!customer) {
          toast.error('Please sign in to remove items from cart');
          return;
        }
        set({ ...updates, customerId: customer.id, storeId: customer.storeId });
      }

      const response = await axios.delete(`/api/storefront/${get().storeId}/cart?itemId=${itemId}`);
      console.log('Remove item response:', response.data);
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

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    try {
      const currentState = get();
      // Batch state updates
      const updates = { isLoading: true };
      set(updates);

      if (!currentState.storeId) {
        const pathParts = window.location.pathname.split('/');
        const domain = pathParts[2];
        const customer = await getCurrentCustomer(domain);
        
        if (!customer) {
          toast.error('Please sign in to update cart');
          return;
        }
        set({ ...updates, customerId: customer.id, storeId: customer.storeId });
      }

      const response = await axios.patch(`/api/storefront/${get().storeId}/cart`, {
        itemId,
        quantity
      });
      console.log('Update quantity response:', response.data);
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
