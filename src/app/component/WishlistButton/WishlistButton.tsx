"use client"

import React, { useState, useEffect } from 'react'
import { FaHeart } from 'react-icons/fa'
import { useWishlist } from '@/app/context/WishlistContext'
import { useAuth } from '@/app/context/AuthContext'
import './WishlistButton.css'

interface WishlistButtonProps {
  productId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showBackground?: boolean
  onLoginRequired?: () => void
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  size = 'md',
  className = '',
  showBackground = true,
  onLoginRequired,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [wasInWishlist, setWasInWishlist] = useState(false)

  const isActive = isInWishlist(productId)

  useEffect(() => {
    setWasInWishlist(isActive)
  }, [])

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      onLoginRequired?.()
      return
    }

    if (isLoading) return

    const willBeActive = !isActive
    
    // Start animation immediately for better UX
    if (willBeActive) {
      setIsAnimating(true)
      setShowParticles(true)
      
      // Remove particles after animation
      setTimeout(() => {
        setShowParticles(false)
      }, 700)
      
      // Remove bounce animation
      setTimeout(() => {
        setIsAnimating(false)
      }, 400)
    }

    setIsLoading(true)
    try {
      await toggleWishlist(productId)
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        wishlist-button
        ${sizeClasses[size]}
        ${showBackground ? (isActive ? 'bg-red-100' : 'bg-white shadow-md') : ''}
        ${isActive ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        ${isAnimating ? 'wishlist-animate' : ''}
        rounded-full transition-colors relative
        ${className}
      `}
      title={isActive ? 'ลบออกจากรายการโปรด' : 'เพิ่มในรายการโปรด'}
    >
      {/* Main Heart Icon */}
      <div className={`heart-icon ${isActive ? 'active' : ''} ${isAnimating ? 'pop' : ''}`}>
        <FaHeart 
          size={iconSizes[size]} 
          className={`transition-all duration-200 ${isActive ? 'text-red-500' : ''}`}
        />
      </div>

      {/* Ring Animation */}
      {isAnimating && (
        <div className="ring-animation" />
      )}

      {/* Particles */}
      {showParticles && (
        <div className="particles-container">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className={`particle particle-${i + 1}`}
              style={{ '--rotation': `${i * 60}deg` } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </button>
  )
}

export default WishlistButton
