'use client';

import { create } from 'zustand';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export interface AuthUser {
  id: string;
  userId?: string; // From JWT token
  email: string;
  role: 'admin' | 'customer';
  storeId?: string;
}

interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: async () => {
    try {
      const currentUser = useAuth.getState().user;
      
      if (currentUser?.role === 'admin') {
        await axios.post('/api/auth/signout');
        set({ user: null });
        window.location.href = '/signin';
      } else if (currentUser?.role === 'customer') {
        // Get domain from current URL for customer signout
        const domain = window.location.hostname;
        await axios.post(`/api/auth/customer/signout?domain=${domain}`);
        set({ user: null });
        window.location.href = `/store/${domain}/signin`;
      }
    } catch (error) {
      toast.error('Error signing out');
    }
  },
}));

// Hook for checking auth state on component mount
export function useAuthCheck() {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/session');
      const sessionData = response.data;
      
      // Format the user data with session information
      const userData: AuthUser = {
        id: sessionData.user.id,
        userId: sessionData.user.userId,
        email: sessionData.user.email,
        role: sessionData.user.role,
        storeId: sessionData.user.storeId // This comes from the JWT token
      };
      
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  return { user, checkAuth };
}

// Hook for customer auth state
export function useCustomerAuth(storeId: string) {
  const router = useRouter();
  const { user, setUser } = useAuth();

  const checkCustomerAuth = async () => {
    try {
      const response = await axios.get(`/api/auth/customer/session?storeId=${storeId}`);
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    }
  };

  return { user, checkCustomerAuth };
}
