"use client"

import React, { useState } from 'react'
import { FaShoppingCart, FaCheck } from 'react-icons/fa'
import './AddToCartButton.css'

interface AddToCartButtonProps {
  onClick: () => void
  className?: string
  text?: string
  successText?: string
  disabled?: boolean
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onClick,
  className = '',
  text = 'เพิ่มลงตะกร้า',
  successText = 'เพิ่มแล้ว!',
  disabled = false,
}) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showParticles, setShowParticles] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (disabled || isAnimating) return

    // Start animation
    setIsAnimating(true)
    setShowParticles(true)

    // Show success state after bounce
    setTimeout(() => {
      setIsSuccess(true)
      onClick()
    }, 300)

    // Hide particles
    setTimeout(() => {
      setShowParticles(false)
    }, 600)

    // Reset to normal state
    setTimeout(() => {
      setIsAnimating(false)
      setIsSuccess(false)
    }, 1500)
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isAnimating}
      className={`
        add-to-cart-button
        ${isAnimating ? 'animating' : ''}
        ${isSuccess ? 'success' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Button Content */}
      <span className="button-content">
        <span className={`cart-icon ${isAnimating ? 'bounce' : ''}`}>
          {isSuccess ? <FaCheck size={14} /> : <FaShoppingCart size={14} />}
        </span>
        <span className="button-text">
          {isSuccess ? successText : text}
        </span>
      </span>

      {/* Ripple Effect */}
      {isAnimating && <span className="ripple-effect" />}

      {/* Flying Cart Items */}
      {showParticles && (
        <div className="flying-items">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`flying-item item-${i + 1}`}
              style={{ '--delay': `${i * 0.05}s` } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Success Checkmark Animation */}
      {isSuccess && (
        <span className="success-ring" />
      )}
    </button>
  )
}

export default AddToCartButton
