"use client"

import React, { useState } from 'react'
import Image from 'next/image'

const Promotion = () => {
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const promoCode = "ONLINE50"

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const scrollToFlashSale = () => {
    const flashSaleSection = document.getElementById('flashsale-section')
    if (flashSaleSection) {
      flashSaleSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const promotions = [
    {
      id: 1,
      title: 'โปรโมชั่น',
      subtitle: 'ออนไลน์',
      bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600',
      image: '/Banners/promotion1.png',
      action: () => setShowCodeModal(true)
    },
    {
      id: 2,
      title: 'Flash Sale',
      subtitle: '',
      bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
      image: '/Banners/flashsale.png',
      action: scrollToFlashSale
    },
    {
      id: 3,
      title: 'Shock',
      subtitle: 'Price',
      bgColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
      image: '/Banners/shockprice.png',
      action: () => console.log('Shock Price clicked')
    },
    {
      id: 4,
      title: 'โปรโมชั่นผ่อน 0%',
      subtitle: '',
      bgColor: 'bg-gradient-to-br from-blue-500 to-purple-600',
      image: '/Banners/installment.png',
      action: () => console.log('Installment clicked')
    }
  ]

  return (
    <>
      <div className="bg-gray-50 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {promotions.map((promo) => (
            <div
              key={promo.id}
              onClick={promo.action}
              className={`${promo.bgColor} rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden min-h-[180px] flex flex-col justify-center items-center`}
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
              
              <div className="text-center z-10">
                <h3 className="text-white font-bold text-xl md:text-2xl mb-1">
                  {promo.title}
                </h3>
                {promo.subtitle && (
                  <p className="text-white font-semibold text-lg md:text-xl">
                    {promo.subtitle}
                  </p>
                )}
              </div>

              {/* Optional: Add icon or badge */}
              {promo.id === 1 && (
                <div className="absolute bottom-2 right-2 bg-white/20 rounded-full px-3 py-1">
                  <span className="text-white text-xs font-bold">รับโค้ด</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full transform transition-all">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🎉 โค้ดส่วนลด
              </h2>
              <p className="text-gray-600 mb-6">
                ลด 50 บาท สำหรับการสั่งซื้อออนไลน์
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">รหัสโปรโมชั่น</p>
                <p className="text-3xl font-bold text-blue-600 tracking-wider">
                  {promoCode}
                </p>
              </div>

              <button
                onClick={handleCopyCode}
                className={`w-full ${copiedCode ? 'bg-green-500' : 'bg-blue-500'} text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors mb-3`}
              >
                {copiedCode ? '✓ คัดลอกแล้ว!' : 'คัดลอกโค้ด'}
              </button>

              <button
                onClick={() => setShowCodeModal(false)}
                className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ปิด
              </button>

              <p className="text-xs text-gray-500 mt-4">
                * ใช้ได้ถึง 31 ธันวาคม 2025
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Promotion
