"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaSearch, FaExchangeAlt, FaHeart, FaShoppingCart, FaUser, FaUserCircle, FaSignOutAlt, FaCog, FaClipboardList, FaDesktop } from 'react-icons/fa'
import LoginModal from './LoginModal'
import CartModal from '@/app/component/Navbar/CartModal'
import BannerCarousel from './BannerCarousel'
import Promotion from './Promotion'
import CategoriesDropdown from './CategoriesDropdown'
import { useCart } from '@/app/context/CartContext'
import { useCompare } from '@/app/context/CompareContext'
import { useAuth } from '@/app/context/AuthContext'
import { useWishlist } from '@/app/context/WishlistContext'
import { productAPI } from '@/app/lib/api'
import type { types } from '@/app/util/types'

interface NavbarProps {
  showBanner?: boolean;
  showPromotion?: boolean;
}

interface SearchProduct {
  _id: string;
  name: string;
  price: number;
  category: string;
  coverImage?: string;
  images?: string[];
}

const Navbar: React.FC<NavbarProps> = ({ showBanner = true, showPromotion = true }) => {
  const router = useRouter()
  const [isLoginModalOpen, setLoginModalOpen] = useState(false)
  const [isCartModalOpen, setCartModalOpen] = useState(false)
  const [isPromotionOpen, setPromotionOpen] = useState(false)
  const [isCategoriesOpen, setCategoriesOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { getTotalItems } = useCart()
  const { getCompareCount } = useCompare()
  const { user, isAuthenticated, isAdmin, logout, refreshUser } = useAuth()
  const { totalItems: wishlistCount } = useWishlist()

  // Refresh user data periodically to update coins
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh on mount
      refreshUser();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        refreshUser();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search products as user types
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await productAPI.getProducts({ search: searchQuery.trim(), limit: 8 })
          if (response.success) {
            setSearchResults(response.data.products)
          }
        } catch (error) {
          console.error('Search error:', error)
        } finally {
          setIsSearching(false)
        }
      }, 300) // Debounce 300ms
    } else {
      setSearchResults([])
      setIsSearching(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setShowSearchDropdown(true)
  }

  const handleProductClick = (productId: string) => {
    setShowSearchDropdown(false)
    setSearchQuery('')
    router.push(`/products/${productId}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchDropdown(false)
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div>
      {/* Main Navbar */}
      <div className={`flex items-center px-10 py-4 bg-gradient-to-r from-white to-white text-gray-800 transition-all duration-500 ease-in-out ${
        isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-2xl transform scale-100' : ''
      }`}>
        <a href="/"><img src="/Logo/logo_B.png" alt="" className='h-20 w-58'/></a>
      
      {/* Search with Dropdown */}
      <div className="relative flex-1 max-w-3xl mx-auto" ref={searchRef}>
        <form 
          className="flex bg-white rounded-full border-2 border-gray-200 focus-within:border-blue-400 transition-colors"
          onSubmit={handleSearchSubmit}
        >
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
            className="flex-1 px-5 py-2 rounded-l-full bg-transparent text-gray-800 focus:outline-none"
          />
          <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white rounded-r-full font-semibold border-gray-700 hover:bg-[#99ff33] hover:text-gray-700 transition-colors">
            <FaSearch />
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showSearchDropdown && searchQuery.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[400px] overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                กำลังค้นหา...
              </div>
            ) : searchResults.length > 0 ? (
              <>
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="text-gray-400">
                      <FaSearch size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 truncate">
                        <span className="text-blue-600">{product.category}</span>
                        {' '}
                        {product.name}
                      </p>
                    </div>
                  </div>
                ))}
                {searchResults.length >= 8 && (
                  <div
                    onClick={handleSearchSubmit as any}
                    className="px-4 py-3 text-center text-blue-600 hover:bg-blue-50 cursor-pointer font-medium"
                  >
                    ดูผลลัพธ์ทั้งหมด →
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">
                ไม่พบสินค้าที่ตรงกับ "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* เมนูด้านขวา สามารถเพิ่มตามต้องการ */}
      <ul className="flex items-center space-x-2 ml-6">
        {/* ปุ่มจัดสเปคคอม */}
        <li>
          <a 
            href="/pc-builder"
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-white hover:bg-[#99ff33] transition-colors"
          >
            <FaDesktop size={18} />
            <span className="font-medium">จัดสเปคคอม</span>
          </a>
        </li>
        {/* ปุ่มเปรียบเทียบ */}
        <li className="relative">
          <a 
            href="/compare"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-[#99ff33] relative"
          >
            <FaExchangeAlt size={20} />
            {getCompareCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getCompareCount()}
              </span>
            )}
          </a>
        </li>
        {/* ปุ่มรายการโปรด */}
        <li className="relative">
          <a 
            href="/wishlist"
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-[#99ff33] relative"
          >
            <FaHeart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </a>
        </li>
        {/* ปุ่มตะกร้าสินค้า */}
        <li className="relative">
          <button 
            onClick={() => setCartModalOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white hover:bg-[#99ff33] relative"
          >
            <FaShoppingCart size={20} />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </li>
        {/* ปุ่มแสดงเหรียญ (Coins) - อยู่ข้างซ้ายของ Profile */}
        {isAuthenticated && (
          <li className="relative">
            <a 
              href="/coins"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-semibold shadow-md cursor-pointer hover:from-yellow-500 hover:to-yellow-600 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5"/>
                <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">฿</text>
              </svg>
              <span className="font-bold">{(user?.coins || 0).toLocaleString()}</span>
            </a>
          </li>
        )}
        {/* ปุ่มเข้าสู่ระบบ / บัญชีผู้ใช้ */}
        <li className="relative" ref={dropdownRef}>
          {isAuthenticated ? (
            <>
              <button
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-white font-semibold transition-colors"
                style={{ backgroundColor: '#99ff33' }}
                onClick={() => setDropdownOpen(!isDropdownOpen)}
              >
                <FaUserCircle size={20} />
                <span>{user?.firstName}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm text-gray-900 font-semibold">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Admin
                      </span>
                    )}
                  </div>

                  <a
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaUser className="text-gray-500" />
                    ข้อมูลของฉัน
                  </a>

                  <a
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaClipboardList className="text-gray-500" />
                    คำสั่งซื้อของฉัน
                  </a>

                  <a
                    href="/wishlist"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FaHeart className="text-gray-500" />
                    รายการโปรด
                  </a>

                  {isAdmin && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <a
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaCog className="text-red-600" />
                        Admin Panel
                      </a>
                    </>
                  )}

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false)
                      logout()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="text-gray-500" />
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              className="flex items-center px-5 py-2 rounded-full border border-white hover:bg-[#ccff66] font-semibold transition-colors"
              style={{ backgroundColor: '#ccff66' }}
              onClick={() => setLoginModalOpen(true)}
            >
              เข้าสู่ระบบ
            </button>
          )}
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
            <button 
              onClick={() => {
                setCategoriesOpen(!isCategoriesOpen);
                setPromotionOpen(false); // Close Promotion when opening Categories
              }}
              className="flex items-center space-x-2 cursor-pointer hover:text-blue-600"
            >
              <div className="w-4 h-4 bg-gray-600 rounded-sm flex items-center justify-center">
                <div className="grid grid-cols-2 gap-px">
                  <div className="w-1 h-1 bg-white rounded-xs"></div>
                  <div className="w-1 h-1 bg-white rounded-xs"></div>
                  <div className="w-1 h-1 bg-white rounded-xs"></div>
                  <div className="w-1 h-1 bg-white rounded-xs"></div>
                </div>
              </div>
              <span className="font-medium">หมวดหมู่สินค้า</span>
              <svg 
                className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Other menu items */}
            <button 
              onClick={() => {
                setPromotionOpen(!isPromotionOpen);
                setCategoriesOpen(false); // Close Categories when opening Promotion
              }}
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
            <a href="#" className="hover:text-blue-600 transition-colors">คู่มือการช็อปปิ้งและบริการหลังการขาย</a>
            <a href="/contact" className="hover:text-blue-600 transition-colors">ติดต่อเรา</a>
          </nav>
        </div>
      </div>

      {/* Categories Dropdown with slide animation */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isCategoriesOpen ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
        }`}
      >
        <CategoriesDropdown />
      </div>

      {/* Promotion Dropdown with slide animation */}
      {showPromotion && (
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isPromotionOpen ? 'max-h-[500px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
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

      {/* Promotional Contact Section - Below Banner */}
      {showBanner && (
        <div className="bg-white py-8 px-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-8">
              {/* Logo Section */}
              <div className="flex-shrink-0">
                <img src="/Logo/logo_B.png" alt="Logo" className="h-32 w-auto" />
              </div>

              {/* Content Section */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  ร้านขายอะไหล่คอมพิวเตอร์มือสอง <span className="text-blue-600">favorpc.top</span>
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  ศูนย์รวมอะไหล่คอมพิวเตอร์มือสอง คุ้มค่า คุ้มราคา
จำหน่ายอะไหล่คอมพิวเตอร์มือสองทุกชนิด ไม่ว่าจะเป็น CPU, GPU, RAM, SSD, Power Supply, เคส และอุปกรณ์ต่าง ๆ คุณภาพดี ผ่านการตรวจเช็กและทดสอบทุกชิ้นจากทีมงานมืออาชีพ 
ใช้งานได้จริง มั่นใจได้ในคุณภาพเรามีบริการให้คำปรึกษาการอัปเกรดคอมพิวเตอร์แบบเป็นกันเอง ช่วยเลือกสเปคให้เหมาะกับงบของคุณ ไม่ว่าจะใช้งานทั่วไป เล่นเกม หรือทำงานหนัก 
ก็จัดให้ตามต้องการได้ไม่ว่าคุณจะอยากอัปเกรดคอม หรือตามหาอะไหล่คุณภาพดีในราคาถูก มาคุยกับเราได้ที่ favorpc.top ยินดีให้บริการ พร้อมมอบประสบการณ์ช้อปปิ้งที่ง่าย รวดเร็ว 
สบายใจ เหมือนมีเพื่อนที่รู้เรื่องคอมช่วยดูแล
                </p>

                {/* Contact Buttons */}
                <div className="flex gap-4">
                  <a
                    href="https://line.me/ti/p/~rakhmor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    แอดไลน์
                  </a>

                  <a
                    href="https://www.facebook.com/rakhmor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    แชทผ่านเฟสบุ๊ค
                  </a>

                  <a
                    href="/contact"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                    ติดต่อเรา
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar
