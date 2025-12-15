"use client"

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { FaCheck, FaTimes, FaShoppingCart, FaHeart, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'
import './Toast.css'

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'cart'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  showCartToast: (message: string) => void
  showSuccessToast: (message: string) => void
  showErrorToast: (message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
      case 'cart':
        return <FaCheck className="text-white" size={16} />
      case 'error':
        return <FaTimes className="text-white" size={16} />
      case 'warning':
        return <FaExclamationTriangle className="text-white" size={16} />
      case 'info':
        return <FaInfoCircle className="text-white" size={16} />
      default:
        return <FaCheck className="text-white" size={16} />
    }
  }

  const getIconBg = () => {
    switch (toast.type) {
      case 'success':
      case 'cart':
        return 'bg-green-500'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'info':
        return 'bg-blue-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="toast-item animate-slide-in">
      <div className="toast-content">
        <div className={`toast-icon ${getIconBg()}`}>
          {getIcon()}
        </div>
        <span className="toast-message">{toast.message}</span>
        <button 
          onClick={() => onRemove(toast.id)}
          className="toast-close"
        >
          <FaTimes size={12} />
        </button>
      </div>
      <div className="toast-progress">
        <div 
          className="toast-progress-bar"
          style={{ animationDuration: `${toast.duration || 3000}ms` }}
        />
      </div>
    </div>
  )
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 3000) => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const showCartToast = useCallback((message: string) => {
    showToast(message, 'cart', 2500)
  }, [showToast])

  const showSuccessToast = useCallback((message: string) => {
    showToast(message, 'success', 3000)
  }, [showToast])

  const showErrorToast = useCallback((message: string) => {
    showToast(message, 'error', 4000)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, showCartToast, showSuccessToast, showErrorToast }}>
      {children}
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
