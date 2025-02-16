import { useCallback } from 'react';
import { useStore } from '../contexts/StoreContext';
import { addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, updateCartItem as apiUpdateCartItem } from '../utils/api';
import { handleApiError } from '../utils/error-handler';

export const useCart = () => {
  const { refreshStore } = useStore();

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      await apiAddToCart(productId, quantity);
      await refreshStore();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      handleApiError(error, 'Failed to add item to cart');
      return false;
    }
  }, [refreshStore]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      await apiRemoveFromCart(itemId);
      await refreshStore();
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      handleApiError(error, 'Failed to remove item from cart');
      return false;
    }
  }, [refreshStore]);

  const updateCartItem = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        return removeFromCart(itemId);
      }
      await apiUpdateCartItem(itemId, quantity);
      await refreshStore();
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      handleApiError(error, 'Failed to update cart item');
      return false;
    }
  }, [refreshStore, removeFromCart]);

  return {
    addToCart,
    removeFromCart,
    updateCartItem,
  };
};