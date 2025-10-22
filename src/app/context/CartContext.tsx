"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, CartContextType } from '@/app/util/types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convert old format to new format if needed
        const normalizedCart = parsedCart.map((item: any) => ({
          ...item,
          price: typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/[^0-9.-]+/g, '')) 
            : Number(item.price),
          oldPrice: item.oldPrice 
            ? (typeof item.oldPrice === 'string'
              ? parseFloat(item.oldPrice.replace(/[^0-9.-]+/g, ''))
              : Number(item.oldPrice))
            : undefined,
        }));
        setCart(normalizedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }

    // Load selected items
    const savedSelectedIds = localStorage.getItem('selectedItemIds');
    if (savedSelectedIds) {
      try {
        setSelectedItemIds(JSON.parse(savedSelectedIds));
      } catch (error) {
        console.error('Error loading selected items:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Save selected items to localStorage
  useEffect(() => {
    localStorage.setItem('selectedItemIds', JSON.stringify(selectedItemIds));
  }, [selectedItemIds]);

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.price) || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const setSelectedItems = (ids: string[]) => {
    setSelectedItemIds(ids);
  };

  const getSelectedItems = () => {
    return cart.filter(item => selectedItemIds.includes(item.id));
  };

  const clearSelectedItems = () => {
    setSelectedItemIds([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        selectedItemIds,
        setSelectedItems,
        getSelectedItems,
        clearSelectedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
