"use client"

import React, { useEffect, useRef, useState } from 'react'
import type { BannerCarouselProps } from '@/app/util/types'

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  images = [],
  height = 'h-56',
}) => {
  const [index, setIndex] = useState(0)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (images.length > 0) {
      startAutoPlay()
    }
    return () => stopAutoPlay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images])

  const startAutoPlay = () => {
    stopAutoPlay()
    if (images.length > 0) {
      // auto-advance every 4s
      timeoutRef.current = window.setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length)
      }, 4000)
    }
  }

  const stopAutoPlay = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const prev = () => {
    if (images.length > 0) {
      setIndex((i: number) => (i - 1 + images.length) % images.length)
    }
  }
  const next = () => {
    if (images.length > 0) {
      setIndex((i: number) => (i + 1) % images.length)
    }
  }

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${height}`}>
      {/* Slides */}
      <div className="absolute inset-0 flex transition-transform duration-700" style={{ transform: `translateX(-${index * 100}%)` }}>
        {(images ?? []).map((src: string, i: number) => (
          <div key={i} className="w-full flex-shrink-0 h-full">
            <img src={src} alt={`banner-${i}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Left / Right arrows */}
      <button
        onClick={() => { stopAutoPlay(); prev(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Previous"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => { stopAutoPlay(); next(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Next"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {(images ?? []).map((_: string, i: number) => (
          <button
            key={i}
            onClick={() => { stopAutoPlay(); setIndex(i); }}
            className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/60'}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default BannerCarousel
