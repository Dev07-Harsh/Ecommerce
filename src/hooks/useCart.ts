import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useCart = () => {
  const { user } = useAuth();
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    // Check both the auth context and localStorage for merchant status
    const merchantFlag = localStorage.getItem('isMerchant') === 'true';
    const isUserMerchant = user?.role === 'merchant';
    setIsMerchant(merchantFlag || isUserMerchant);
  }, [user]);

  const fetchCartItems = async () => {
    if (isMerchant) {
      return []; // Return empty array for merchants
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/items`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    if (isMerchant) {
      return null;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update cart item');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      return null;
    }
  };

  const removeCartItem = async (itemId: number) => {
    if (isMerchant) {
      return null;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove cart item');
      }

      return true;
    } catch (error) {
      console.error('Error removing cart item:', error);
      return null;
    }
  };

  return {
    isMerchant,
    fetchCartItems,
    updateCartItem,
    removeCartItem
  };
}; 