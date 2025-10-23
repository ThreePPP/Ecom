"use client"

import React, { useState, useEffect } from 'react'

const Promotion = () => {
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCodeModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showCodeModal])

  const promotions = [
    {
      id: 1,
      title: 'โปรโมชั่น',
      subtitle: 'ออนไลน์',
      bgColor: 'from-blue-500 via-blue-600 to-indigo-700',
      icon: '🎁',
      badge: 'รับโค้ด',
      action: () => setShowCodeModal(true)
    },
    {
      id: 2,
      title: 'Flash Sale',
      subtitle: 'ลดสูงสุด 70%',
      bgColor: 'from-rose-500 via-pink-600 to-purple-600',
      icon: '⚡',
      badge: 'Hot',
      action: scrollToFlashSale
    },
    {
      id: 3,
      title: 'Shock Price',
      subtitle: 'ราคาช็อค',
      bgColor: 'from-amber-400 via-orange-500 to-red-500',
      icon: '💥',
      badge: 'ใหม่',
      action: () => console.log('Shock Price clicked')
    },
    {
      id: 4,
      title: 'ผ่อน 0%',
      subtitle: 'นานสูงสุด 10 เดือน',
      bgColor: 'from-emerald-500 via-teal-600 to-cyan-600',
      icon: '💳',
      badge: 'ฟรี',
      action: () => console.log('Installment clicked')
    }
  ]

  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              โปรโมชั่นพิเศษ
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              คัดสรรดีลดีที่สุด เฉพาะคุณเท่านั้น
            </p>
          </div>

          {/* Promotion Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {promotions.map((promo, index) => (
              <div
                key={promo.id}
                onClick={promo.action}
                onMouseEnter={() => setHoveredCard(promo.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`
                  bg-gradient-to-br ${promo.bgColor}
                  rounded-2xl md:rounded-3xl p-5 md:p-6
                  cursor-pointer
                  transform transition-all duration-500 ease-out
                  ${hoveredCard === promo.id ? 'scale-105 -translate-y-2' : 'scale-100'}
                  hover:shadow-2xl
                  relative overflow-hidden
                  min-h-[160px] md:min-h-[200px]
                  group
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-2xl -mr-16 -mt-16 transform transition-transform duration-700 group-hover:scale-150"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-xl -ml-12 -mb-12 transform transition-transform duration-700 group-hover:scale-150"></div>
                </div>

                {/* Sparkle Effect */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-2xl animate-pulse">✨</span>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    {/* Icon */}
                    <div className="text-4xl md:text-5xl mb-2 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                      {promo.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-white font-bold text-lg md:text-xl lg:text-2xl mb-1 drop-shadow-lg">
                      {promo.title}
                    </h3>
                    
                    {/* Subtitle */}
                    {promo.subtitle && (
                      <p className="text-white/90 font-medium text-xs md:text-sm drop-shadow-md">
                        {promo.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Badge */}
                  <div className="flex justify-end">
                    <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1 transform transition-all duration-300 group-hover:bg-white/35 group-hover:scale-110">
                      <span className="text-white text-xs md:text-sm font-bold drop-shadow">
                        {promo.badge}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Code Modal */}
      {showCodeModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setShowCodeModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 md:p-10 max-w-md w-full transform transition-all animate-scaleIn shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCodeModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors group"
            >
              <span className="text-gray-500 group-hover:text-gray-700 text-xl">×</span>
            </button>

            <div className="text-center">
              {/* Icon with Animation */}
              <div className="mb-6 relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg animate-bounce-slow">
                  <span className="text-4xl">🎉</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-blue-500/20 rounded-full animate-ping"></div>
                </div>
              </div>
              
              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                รับโค้ดส่วนลด!
              </h2>
              
              {/* Description */}
              <p className="text-gray-600 mb-8 text-sm md:text-base">
                ลด <span className="font-bold text-blue-600">50 บาท</span> สำหรับการสั่งซื้อออนไลน์
              </p>

              {/* Promo Code Box */}
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-dashed border-blue-300 rounded-2xl p-6">
                  <p className="text-sm text-gray-600 mb-2 font-medium">รหัสโปรโมชั่น</p>
                  <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-widest mb-2">
                    {promoCode}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>ใช้งานได้ทันที</span>
                  </div>
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyCode}
                className={`
                  w-full font-bold py-4 px-6 rounded-xl mb-3
                  transform transition-all duration-300 hover:scale-105
                  shadow-lg hover:shadow-xl
                  ${copiedCode 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  }
                `}
              >
                {copiedCode ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    คัดลอกแล้ว!
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    คัดลอกโค้ด
                  </span>
                )}
              </button>

              {/* Terms */}
              <div className="bg-gray-50 rounded-xl p-4 text-left">
                <p className="text-xs text-gray-500 font-medium mb-2">📋 เงื่อนไขการใช้งาน:</p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>ใช้ได้ถึง 31 ธันวาคม 2025</li>
                  <li>ใช้ได้ 1 ครั้งต่อ 1 บัญชี</li>
                  <li>ยอดซื้อขั้นต่ำ 500 บาท</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

export default Promotion
