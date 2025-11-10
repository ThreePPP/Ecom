"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images?: string[];
  image?: string;
  category?: string;
  brand?: string;
  description?: string;
  specifications?: Record<string, string> | Map<string, string>;
  stock?: number;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  sold?: number;
}

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  getCompareCount: () => number;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  // Load compare items from localStorage on mount
  useEffect(() => {
    const savedCompare = localStorage.getItem('compareItems');
    if (savedCompare) {
      try {
        setCompareItems(JSON.parse(savedCompare));
      } catch (error) {
        console.error('Error loading compare items:', error);
      }
    }
  }, []);

  // Save compare items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product: Product) => {
    const productId = product._id || product.id;
    
    // Check if already in compare list
    if (compareItems.some(item => (item._id || item.id) === productId)) {
      alert('สินค้านี้อยู่ในรายการเปรียบเทียบแล้ว');
      return;
    }

    // Limit to 4 items for comparison
    if (compareItems.length >= 4) {
      alert('สามารถเปรียบเทียบได้สูงสุด 4 รายการ');
      return;
    }

    setCompareItems(prev => [...prev, product]);
    alert('เพิ่มสินค้าเข้ารายการเปรียบเทียบแล้ว');
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems(prev => prev.filter(item => (item._id || item.id) !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId: string) => {
    return compareItems.some(item => (item._id || item.id) === productId);
  };

  const getCompareCount = () => {
    return compareItems.length;
  };

  return (
    <CompareContext.Provider 
      value={{ 
        compareItems, 
        addToCompare, 
        removeFromCompare, 
        clearCompare,
        isInCompare,
        getCompareCount
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
