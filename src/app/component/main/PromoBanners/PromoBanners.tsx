"use client"

import React, { useEffect, useRef, useState } from 'react'

interface BannerSlide {
  id: number
  image: string
  alt: string
}

const PromoBanners = () => {
  // State สำหรับเก็บ index ของภาพที่กำลังแสดง
  const [leftIndex, setLeftIndex] = useState(0)
  const [rightIndex, setRightIndex] = useState(0)
  const leftTimeoutRef = useRef<number | null>(null)
  const rightTimeoutRef = useRef<number | null>(null)

  // ภาพสำหรับ Banner ซ้าย
  const leftSlides: BannerSlide[] = [
    { id: 1, image: '/Banners/1.jpg', alt: 'Promotion' },
    { id: 2, image: '/Banners/2.jpg', alt: 'Promotion' },
    { id: 3, image: '/Banners/3.png', alt: 'Promotion' },
  ]

  // ภาพสำหรับ Banner ขวา
  const rightSlides: BannerSlide[] = [
    { id: 1, image: '/Banners/1.jpg', alt: 'Promotion' },
    { id: 2, image: '/Banners/2.jpg', alt: 'Promotion' },
    { id: 3, image: '/Banners/3.png', alt: 'Promotion' },
  ]

  // Auto-play สำหรับ Banner ซ้าย (เปลี่ยนภาพทุก 8 วินาที)
  useEffect(() => {
    if (leftSlides.length > 1) {
      leftTimeoutRef.current = window.setTimeout(() => {
        setLeftIndex((prev) => (prev + 1) % leftSlides.length)
      }, 8000) // เปลี่ยนจาก 5000 เป็น 8000 (8 วินาที)
    }
    return () => {
      if (leftTimeoutRef.current) clearTimeout(leftTimeoutRef.current)
    }
  }, [leftIndex, leftSlides.length])

  // Auto-play สำหรับ Banner ขวา (เปลี่ยนภาพทุก 8.5 วินาที)
  useEffect(() => {
    if (rightSlides.length > 1) {
      rightTimeoutRef.current = window.setTimeout(() => {
        setRightIndex((prev) => (prev + 1) % rightSlides.length)
      }, 8500) // เปลี่ยนจาก 5500 เป็น 8500 (8.5 วินาที)
    }
    return () => {
      if (rightTimeoutRef.current) clearTimeout(rightTimeoutRef.current)
    }
  }, [rightIndex, rightSlides.length])

  return (
    <div className="bg-gray-50 w-full px-10 py-8">
      <div className="flex gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          
          {/* ==================== Banner ซ้าย ==================== */}
          <div className="relative overflow-hidden rounded-lg bg-gray-100 h-64 md:h-80 lg:h-96">
            {/* Container สำหรับเลื่อนภาพ */}
            <div 
              className="absolute inset-0 flex transition-transform duration-700" 
              style={{ transform: `translateX(-${leftIndex * 100}%)` }}
            >
              {leftSlides.map((slide) => (
                <div key={slide.id} className="w-full flex-shrink-0 h-full">
                  <img 
                    src={slide.image} 
                    alt={slide.alt} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Dots Indicator สำหรับ Banner ซ้าย */}
            {leftSlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {leftSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLeftIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === leftIndex ? 'bg-white w-6' : 'bg-white/60'
                    }`}
                    aria-label={`Go to left slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ==================== Banner ขวา ==================== */}
          <div className="relative overflow-hidden rounded-lg bg-gray-100 h-64 md:h-80 lg:h-96">
            {/* Container สำหรับเลื่อนภาพ */}
            <div 
              className="absolute inset-0 flex transition-transform duration-700" 
              style={{ transform: `translateX(-${rightIndex * 100}%)` }}
            >
              {rightSlides.map((slide) => (
                <div key={slide.id} className="w-full flex-shrink-0 h-full">
                  <img 
                    src={slide.image} 
                    alt={slide.alt} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Dots Indicator สำหรับ Banner ขวา */}
            {rightSlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {rightSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setRightIndex(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === rightIndex ? 'bg-white w-6' : 'bg-white/60'
                    }`}
                    aria-label={`Go to right slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default PromoBanners
