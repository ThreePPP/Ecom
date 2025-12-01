"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  coins: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = () => {
      const token = authAPI.isAuthenticated();
      const savedUser = authAPI.getCurrentUser();
      
      if (token && savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password);
    if (response.success) {
      setUser(response.data.user);
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    window.location.href = '/';
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      if (response.success && response.data.user) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        // Update localStorage too
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
