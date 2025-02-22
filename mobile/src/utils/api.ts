import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Product, 
  CartItem, 
  Order, 
  LoginResponse, 
  StoreDetails,
  Taxonomy,
  SearchResult,
  Promotion,
  AuthTokens,
  RefreshTokenResponse
} from '../types/api';

const extra = Constants.expoConfig?.extra;
import { Platform } from 'react-native';

// Use androidApiBaseUrl for Android emulator
const apiBaseUrl = Platform.select({
  android: extra?.androidApiBaseUrl,
  default: extra?.apiBaseUrl,
});
const storeId = extra?.storeId;

if (!apiBaseUrl || !storeId) {
  throw new Error('API_BASE_URL and STORE_ID must be configured');
}

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
};

// Helper function to create store-specific endpoint
const endpoint = (path: string) => `/${storeId}${path}`;

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-mobile-app': 'true',
  },
  timeout: extra?.apiTimeout || 30000,
  timeoutErrorMessage: 'Request timed out - please check your internet connection',
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

// Auth interceptor to add token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Get new tokens from server
        const response = await axios.post<{ accessToken: string }>(
          `${apiBaseUrl}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-store-id': storeId,
            },
          }
        );

        const { accessToken } = response.data;
        
        if (!accessToken) {
          throw new Error('Invalid refresh token response');
        }

        await AsyncStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        onRefreshed(accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        await clearAuthData();
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

const clearAuthData = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(AUTH_STORAGE_KEYS.USER)
    ]);
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

interface DataResponse<T> {
  data: T;
  meta?: {
    total?: number;
  };
}

// Product APIs
export const getProducts = () => api.get<DataResponse<Product[]>>(endpoint('/products'));
export const getProduct = (slug: string) => api.get<DataResponse<Product>>(endpoint(`/products/${slug}`));
export const getRelatedProducts = (slug: string) => 
  api.get<DataResponse<Product[]>>(endpoint(`/products/${slug}/related`));
export const searchProducts = (query: string) => 
  api.get<SearchResult>(endpoint(`/search?q=${query}`));

// Cart APIs
export const getCart = async () => {
  try {
    const response = await api.get<DataResponse<CartItem[]>>(endpoint('/cart'));
    return {
      ...response,
      data: {
        data: response.data.data || [] // Ensure we always return an array
      }
    };
  } catch (error) {
    // Return empty cart on error
    return {
      data: {
        data: []
      }
    };
  }
};

export const addToCart = (productId: string, quantity: number = 1) => 
  api.post(endpoint('/cart'), { productId, quantity });

export const updateCartItem = (id: string, quantity: number) =>
  api.patch(endpoint(`/cart/${id}`), { quantity });

export const removeFromCart = (id: string) =>
  api.delete(endpoint(`/cart/${id}`));

// Auth APIs
export const login = async (email: string, password: string) => {
  // Use raw axios to bypass the interceptor for login
  const response = await axios.post<LoginResponse>(
    `${apiBaseUrl}/api/storefront/${storeId}/auth/signin`,
    { email, password },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': storeId,
      },
    }
  );

  if (!response.data.user || !response.data.tokens) {
    throw new Error('Invalid response from server');
  }

  const { user, tokens } = response.data;
  await Promise.all([
    AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user)),
    AsyncStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    AsyncStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
  ]);

  api.defaults.headers.Authorization = `Bearer ${tokens.accessToken}`;
  api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
  return response;
};

export const register = async (email: string, password: string, name: string) => {
  const response = await axios.post<LoginResponse>(
    `${apiBaseUrl}/api/storefront/${storeId}/auth/register`,
    { email, password, name },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-store-id': storeId,
      },
    }
  );

  if (!response.data.user || !response.data.tokens) {
    throw new Error('Invalid response from server');
  }

  const { user, tokens } = response.data;
  await Promise.all([
    AsyncStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user)),
    AsyncStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
    AsyncStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
  ]);

  api.defaults.headers.Authorization = `Bearer ${tokens.accessToken}`;
  api.defaults.headers.common['Authorization'] = `Bearer ${tokens.accessToken}`;
  return response;
};

export const logout = async () => {
  try {
    await api.post(endpoint('/auth/signout'));
  } finally {
    await clearAuthData();
  }
};

// Profile APIs
export const getProfile = () => api.get(endpoint('/profile'));
export const updateProfile = (data: Partial<{ name: string; email: string }>) =>
  api.patch(endpoint('/profile'), data);

// Store APIs
export const getStoreDetails = () => api.get<StoreDetails>(endpoint('/store/details'));
export const getStoreLayout = () => api.get(endpoint('/store/layout'));
export const getStoreSettings = () => api.get(endpoint('/store/settings'));

// Category/Taxonomy APIs
export const getTaxonomies = () => api.get<Taxonomy[]>(endpoint('/taxonomies'));
export const getTaxonomy = (slug: string) => api.get<Taxonomy>(endpoint(`/taxonomies/${slug}`));
export const getTaxonProducts = (slug: string) => 
  api.get<DataResponse<Product[]>>(endpoint(`/taxonomies/${slug}/products`));

// Order APIs
export const getOrders = () => api.get<DataResponse<Order[]>>(endpoint('/orders'));
export const getOrder = (orderId: string) => api.get<DataResponse<Order>>(endpoint(`/orders/${orderId}`));
export const createOrder = () => api.post<Order>(endpoint('/orders'));

// Checkout & Payment APIs
export const initiateCheckout = () => api.post(endpoint('/checkout'));
export const processPayment = (token: string) => 
  api.post(endpoint('/payment'), { token });

// Promotion APIs
export const getPromotions = () => api.get<Promotion[]>(endpoint('/promotions'));
export const applyCoupon = (code: string) => 
  api.post(endpoint('/promotions/apply-coupon'), { code });