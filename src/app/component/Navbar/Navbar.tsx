"use client"

import React, { useState } from 'react'
import { FaSearch, FaExchangeAlt, FaHeart, FaShoppingCart, FaUser } from 'react-icons/fa'
import LoginModal from './LoginModal'
import BannerCarousel from './BannerCarousel'
import type { types } from '@/app/util/types'

const Navbar = () => {
  const [isLoginModalOpen, setLoginModalOpen] = useState(false)

  return (
    <div>
      {/* Main Navbar */}
      <div className="flex items-center px-10 py-4 bg-gradient-to-r from-blue-900 to-blue-500 text-white">
        <h1 className="text-3xl italic font-bold mr-6">Favcom</h1>
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
        {/* ปุ่มรายการโปรด */}
        <li>
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-blue-800">
            <FaHeart size={20} />
          </button>
        </li>
        {/* ปุ่มตะกร้าสินค้า */}
        <li>
          <button className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-blue-800">
            <FaShoppingCart size={20} />
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
  <LoginModal isOpen={isLoginModalOpen} onClose={() => setLoginModalOpen(false)} />
    
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
            <a href="#" className="hover:text-blue-600 transition-colors">โปรโมชันออนไลน์</a>
            <a href="#" className="hover:text-blue-600 transition-colors">คู่มือการช็อปปิ้ง</a>
            <a href="#" className="hover:text-blue-600 transition-colors">บริการหลังการขาย</a>
          </nav>
        </div>
      </div>
      {/* Banner carousel placed under secondary menu */}
      <div className="px-10 mt-4">
        {/* Use banner images from public/Banners folder */}
        <BannerCarousel images={["/Banners/sf1.jpg", "/Banners/who.png", "/Banners/who1.png"]} height="h-150" />
      </div>
    </div>
  )
}

export default Navbar
