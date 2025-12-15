"use client"

import React from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './component/Toast/Toast';

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <CompareProvider>
              {children}
            </CompareProvider>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
