'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { wishlistAPI } from '@/app/lib/api';
import { useAuth } from './AuthContext';

interface WishlistItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
    coverImage?: string;
    condition?: string;
    category?: string;
    brand?: string;
  };
  addedAt: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  totalItems: number;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  toggleWishlist: (productId: string) => Promise<{ success: boolean; action?: string }>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch wishlist when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const refreshWishlist = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      if (response.success) {
        setItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await wishlistAPI.addToWishlist(productId);
      if (response.success) {
        setItems(response.data.items || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await wishlistAPI.removeFromWishlist(productId);
      if (response.success) {
        setItems(response.data.items || []);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const toggleWishlist = async (productId: string): Promise<{ success: boolean; action?: string }> => {
    if (!isAuthenticated) {
      return { success: false };
    }
    
    try {
      const response = await wishlistAPI.toggleWishlist(productId);
      if (response.success) {
        setItems(response.data.items || []);
        return { success: true, action: response.data.action };
      }
      return { success: false };
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return { success: false };
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.product?._id === productId);
  };

  const clearWishlist = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await wishlistAPI.clearWishlist();
      if (response.success) {
        setItems([]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        totalItems: items.length,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        refreshWishlist,
      }}
    >
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
