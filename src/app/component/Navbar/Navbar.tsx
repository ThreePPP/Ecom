"use client"

import React, { useState, useEffect } from 'react'
import { FaSearch, FaExchangeAlt, FaHeart, FaShoppingCart, FaUser } from 'react-icons/fa'
import LoginModal from './LoginModal'
import CartModal from '@/app/component/Navbar/CartModal'
import BannerCarousel from './BannerCarousel'
import Promotion from './Promotion'
import { useCart } from '@/app/context/CartContext'
import type { types } from '@/app/util/types'

interface NavbarProps {
  showBanner?: boolean;
  showPromotion?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ showBanner = true, showPromotion = true }) => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false)
  const [isCartModalOpen, setCartModalOpen] = useState(false)
  const [isPromotionOpen, setPromotionOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const { getTotalItems } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      // เมื่อเลื่อนลงเกิน 100px จะทำให้ navbar ติด
      if (window.scrollY > 100) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div>
      {/* Main Navbar */}
      <div className={`flex items-center px-10 py-4 bg-gradient-to-r from-blue-900 to-blue-500 text-white transition-all duration-500 ease-in-out ${
        isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-2xl transform scale-100' : ''
      }`}>
        <a href="/"><img src="/Logo/logo_W.png" alt="" className='h-20 w-58'/></a>
      <form className="flex flex-1 max-w-3xl mx-auto bg-white rounded-full">
        <input
          type="text"
          placeholder="Search Products, Categories, Brands"
          className="flex-1 px-5 py-2 rounded-l-full text-gray-800 focus:outline-none"
        />
        <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-blue-900 text-white rounded-r-full font-semibold border-l border-blue-800 hover:bg-blue-800">
          <FaSearch />
          Search
        </button>
      </form>
      {/* เมนูด้านขวา สามารถเพิ่มตามต้องการ */}
      <ul className="flex items-center space-x-2 ml-6">
        {/* ปุ่มเปรียบเทียบ */}
        <li>
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-blue-800">
            <FaExchangeAlt size={20} />
          </button>
        </li>
        {/* ปุ่มตะกร้าสินค้า */}
        <li className="relative">
          <button 
            onClick={() => setCartModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-blue-800 relative"
          >
            <FaShoppingCart size={20} />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </li>
        {/* ปุ่มเข้าสู่ระบบ */}
        <li>
          <button
            className="flex items-center px-5 py-2 bg-blue-900 rounded-full border border-white hover:bg-blue-800 font-semibold"
            onClick={() => setLoginModalOpen(true)}
          >
            เข้าสู่ระบบ
          </button>
        </li>
      </ul>
      </div>
      
  {/* Modal สำหรับเข้าสู่ระบบ */}
  <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} onOpen={() => setLoginModalOpen(true)} />
  
  {/* Modal สำหรับตะกร้าสินค้า */}
  <CartModal isOpen={isCartModalOpen} onClose={() => setCartModalOpen(false)} />
    
  {/* Spacer เมื่อ navbar เป็น fixed */}
  <div 
    className="transition-all duration-500 ease-in-out overflow-hidden"
    style={{ height: isSticky ? '88px' : '0' }}
  ></div>
    
  {/* Secondary Menu Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-10 py-3">
          <nav className="flex items-center space-x-8 text-gray-700">
            {/* Categories with icon */}
            <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-600">
              <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                <div className="grid grid-cols-2 gap-px">
                  <div className="w-1 h-1 bg-white rounded-xs"></div>
                  <div className="w-1 h-1 bg-white rounded-xs"></div>
                  <div className="w-1 h-1 bg-white rounded-xs"></div>
                  <div className="w-1 h-1 bg-white rounded-xs"></div>
                </div>
              </div>
              <span className="font-medium">Categories</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Other menu items */}
            <button 
              onClick={() => setPromotionOpen(!isPromotionOpen)}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
              style={{ display: showPromotion ? 'flex' : 'none' }}
            >
              โปรโมชันออนไลน์
              <svg 
                className={`w-4 h-4 transition-transform ${isPromotionOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <a href="#" className="hover:text-blue-600 transition-colors">คู่มือการช็อปปิ้ง</a>
            <a href="#" className="hover:text-blue-600 transition-colors">บริการหลังการขาย</a>
          </nav>
        </div>
      </div>

      {/* Promotion Dropdown with slide animation */}
      {showPromotion && (
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isPromotionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <Promotion />
        </div>
      )}

      {/* Banner carousel placed under secondary menu */}
      {showBanner && (
        <div>
          {/* Use banner images from public/Banners folder */}
          <BannerCarousel images={["/Banners/sf1.jpg", "/Banners/who.png", "/Banners/who1.png"]} height="h-150" />
        </div>
      )}
    </div>
  )
}

export default Navbar
