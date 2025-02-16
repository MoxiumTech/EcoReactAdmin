import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getProfile } from '../utils/api';
import { User } from '../types/api';
import { handleApiError, showSuccess } from '../utils/error-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STORAGE_KEYS } from '../utils/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getProfile();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiLogin(email, password);
      setUser(response.data.user);
      showSuccess('Successfully logged in');
    } catch (error) {
      handleApiError(error, 'Failed to login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      setUser(null);
      await AsyncStorage.multiRemove([
        AUTH_STORAGE_KEYS.ACCESS_TOKEN,
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        AUTH_STORAGE_KEYS.USER
      ]);
      showSuccess('Successfully logged out');
    } catch (error) {
      handleApiError(error, 'Failed to logout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiRegister(email, password, name);
      setUser(response.data.user);
      showSuccess('Successfully registered');
    } catch (error) {
      handleApiError(error, 'Failed to register');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};