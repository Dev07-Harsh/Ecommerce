import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, ''); // Remove trailing slash if present

interface WishlistItem {
  wishlist_item_id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    stock: number;
    is_deleted: boolean;
  };
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (wishlistItemId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, user } = useAuth();

  // Fetch wishlist from backend
  const fetchWishlist = async () => {
    if (!accessToken || user?.role !== 'customer') {
      console.log('Auth check failed in fetchWishlist:', { 
        hasAccessToken: !!accessToken, 
        userRole: user?.role 
      });
      setWishlistItems([]);
      setLoading(false);
      return;
    }
    
    try {
      console.log('=== Fetch Wishlist Debug ===');
      console.log('API Base URL:', API_BASE_URL);
      console.log('Full URL:', `${API_BASE_URL}/api/wishlist`);
      console.log('Access Token:', accessToken ? 'Present' : 'Missing');
      
      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error Response Data:', errorData);
        throw new Error('Failed to fetch wishlist');
      }

      const data = await response.json();
      console.log('Success Response Data:', data);

      if (data.status === 'success') {
        setWishlistItems(data.data);
      }
    } catch (error) {
      console.error('=== Fetch Wishlist Error Debug ===');
      console.error('Error Type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error Message:', error instanceof Error ? error.message : error);
      console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Full Error Object:', error);
      
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist when auth token or user role changes
  useEffect(() => {
    if (accessToken && user?.role === 'customer') {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [accessToken, user?.role]);

  const addToWishlist = async (productId: number) => {
    if (!accessToken || user?.role !== 'customer') {
      console.log('Auth check failed:', { 
        hasAccessToken: !!accessToken, 
        userRole: user?.role 
      });
      toast.error('Only customers can add items to wishlist');
      return;
    }

    try {
      console.log('=== Wishlist API Request Debug ===');
      console.log('API Base URL:', API_BASE_URL);
      console.log('Full URL:', `${API_BASE_URL}/api/wishlist`);
      console.log('Request Method:', 'POST');
      console.log('Product ID:', productId);
      console.log('Access Token:', accessToken ? 'Present' : 'Missing');
      
      const payload = {
        product_id: productId
      };
      
      console.log('Request Payload:', payload);
      console.log('Request Headers:', {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      });

      const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('=== Wishlist API Response Debug ===');
      console.log('Response Status:', response.status);
      console.log('Response Status Text:', response.statusText);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error Response Data:', errorData);
        throw new Error(errorData.message || 'Failed to add item to wishlist');
      }

      const data = await response.json();
      console.log('Success Response Data:', data);
      
      if (data.status === 'success') {
        await fetchWishlist();
        toast.success('Product added to wishlist');
      }
    } catch (error) {
      console.error('=== Wishlist Error Debug ===');
      console.error('Error Type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error Message:', error instanceof Error ? error.message : error);
      console.error('Error Stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Full Error Object:', error);
      
      toast.error(error instanceof Error ? error.message : 'Failed to add item to wishlist');
      throw error;
    }
  };

  const removeFromWishlist = async (wishlistItemId: number) => {
    if (!accessToken || user?.role !== 'customer') return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item from wishlist');
      }

      const data = await response.json();
      if (data.status === 'success') {
        await fetchWishlist();
        toast.success('Item removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove item from wishlist');
      throw error;
    }
  };

  const clearWishlist = async () => {
    if (!accessToken || user?.role !== 'customer') return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/wishlist/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to clear wishlist');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setWishlistItems([]);
        toast.success('Wishlist cleared');
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to clear wishlist');
      throw error;
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 