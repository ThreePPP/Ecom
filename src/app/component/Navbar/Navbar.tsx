"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaSearch, FaExchangeAlt, FaHeart, FaShoppingCart, FaUser, FaUserCircle, FaSignOutAlt, FaCog, FaClipboardList, FaDesktop } from 'react-icons/fa'
import LoginModal from './LoginModal'
import CartModal from '@/app/component/Navbar/CartModal'
import AutoBuildModal from './AutoBuildModal'
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
  const [isPCBuilderModalOpen, setPCBuilderModalOpen] = useState(false) // New state for PC Builder Modal
  const [isAutoBuildModalOpen, setAutoBuildModalOpen] = useState(false)
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
      // เมื่อเลื่อนลงเกิน 50px จะทำให้ navbar ติด
      if (window.scrollY > 50) {
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
    <div className='relative font-sans'>
      {/* Main Navbar */}
      <div className={`flex items-center px-6 lg:px-12 py-3 bg-white/95 backdrop-blur-md text-gray-800 transition-all duration-300 ease-in-out border-b border-gray-100 z-50 ${isSticky ? 'fixed top-0 left-0 right-0 shadow-sm' : 'relative'
        }`}>

        {/* LOGO */}
        <a href="/" className="mr-8 shrink-0">
          <img src="/Logo/logo_B.png" alt="FavorPC" className='h-16 w-auto object-contain' />
        </a>

        {/* Search with Dropdown */}
        <div className="relative flex-1 max-w-2xl" ref={searchRef}>
          <form
            className="flex items-center w-full bg-gray-50 rounded-full border border-gray-200 focus-within:bg-white focus-within:border-gray-400 focus-within:shadow-sm transition-all duration-200 overflow-hidden"
            onSubmit={handleSearchSubmit}
          >
            <div className="pl-4 text-gray-500">
              <FaSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
              className="flex-1 px-3 py-2.5 bg-transparent text-gray-800 text-sm focus:outline-none placeholder-gray-500"
            />
          </form>

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-[400px] overflow-y-auto custom-scrollbar">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <div className="animate-spin w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full mx-auto mb-2"></div>
                  กำลังค้นหา...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product._id)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                    >
                      <div className="text-gray-300">
                        <FaSearch size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate font-medium">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          <span className="text-blue-600 font-medium">{product.category}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                  {searchResults.length >= 8 && (
                    <div
                      onClick={handleSearchSubmit as any}
                      className="px-4 py-3 text-center text-blue-600 hover:text-blue-700 hover:bg-gray-50 cursor-pointer text-sm font-medium transition-colors"
                    >
                      ดูผลลัพธ์ทั้งหมด →
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                  ไม่พบสินค้าที่ตรงกับ "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Menu */}
        <ul className="flex items-center space-x-3 ml-auto">
          {/* PC Builder Button */}
          <li>
            <button
              onClick={() => setPCBuilderModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-all shadow-sm hover:shadow"
            >
              <FaDesktop size={14} />
              <span className="text-sm font-medium">จัดสเปคคอม</span>
            </button>
            <button
              onClick={() => setPCBuilderModalOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <FaDesktop size={18} />
            </button>
          </li>

          <div className="h-6 w-px bg-gray-200 mx-2 hidden lg:block"></div>

          {/* Compare */}
          <li className="relative">
            <a
              href="/compare"
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-800 transition-colors relative"
              title="เปรียบเทียบสินค้า"
            >
              <FaExchangeAlt size={18} />
              {getCompareCount() > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                  {getCompareCount()}
                </span>
              )}
            </a>
          </li>

          {/* Wishlist */}
          <li className="relative">
            <a
              href="/wishlist"
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-800 transition-colors relative"
              title="รายการโปรด"
            >
              <FaHeart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </a>
          </li>

          {/* Cart */}
          <li className="relative">
            <button
              onClick={() => setCartModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-800 transition-colors relative"
              title="ตะกร้าสินค้า"
            >
              <FaShoppingCart size={18} />
              {getTotalItems() > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </li>

          {/* Coins Display */}
          {isAuthenticated && (
            <li className="relative hidden md:block">
              <a
                href="/coins"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-gray-700 text-sm font-medium border border-yellow-100 hover:border-yellow-300 transition-all"
              >
                <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] text-yellow-800 font-bold">฿</div>
                <span>{(user?.coins || 0).toLocaleString()}</span>
              </a>
            </li>
          )}

          {/* User Profile / Login */}
          <li className="relative pl-2" ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <button
                  className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-black transition-colors"
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 border border-gray-200">
                    <FaUser size={14} />
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{user?.firstName}</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] py-2 z-50 border border-gray-100 overflow-hidden ring-1 ring-black/5">
                    <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm text-gray-900 font-semibold truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-black text-white text-[10px] rounded animate-pulse">
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <a
                        href="/profile"
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaUser className="text-gray-400" size={14} />
                        ข้อมูลของฉัน
                      </a>

                      <a
                        href="/orders"
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaClipboardList className="text-gray-400" size={14} />
                        คำสั่งซื้อของฉัน
                      </a>

                      <a
                        href="/wishlist"
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FaHeart className="text-gray-400" size={14} />
                        รายการโปรด
                      </a>
                    </div>

                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-50 my-1"></div>
                        <a
                          href="/admin"
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FaCog className="text-red-500" size={14} />
                          Admin Panel
                        </a>
                      </>
                    )}

                    <div className="border-t border-gray-50 my-1"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        logout()
                      }}
                      className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                      <FaSignOutAlt className="text-gray-400" size={14} />
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                className="flex items-center px-6 py-2 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all shadow-sm"
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

      {/* Modal เลือกโหมดจัดสเปคคอม */}
      {isPCBuilderModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setPCBuilderModalOpen(false)}>
          <div
            className="relative bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'fadeIn 0.2s ease-out' }}
          >
            <button
              onClick={() => setPCBuilderModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">เลือกโหมดจัดสเปคคอม</h3>

            <div className="flex flex-col gap-4">
              <a
                href="/pc-builder"
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FaDesktop size={24} className="text-gray-800" />
                </div>
                <span className="text-lg font-bold text-gray-900">จัดสเปคคอมเอง</span>
                <span className="text-sm text-gray-500 mt-1">เลือกอุปกรณ์ทีละชิ้นตามใจคุณ</span>
              </a>

              <button
                onClick={() => {
                  setPCBuilderModalOpen(false);
                  setAutoBuildModalOpen(true);
                }}
                className="group flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all duration-300 w-full"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">จัดสเปคคอมตามงบจัดอัตโนมัติ</span>
                <span className="text-sm text-gray-500 mt-1">ระบุงบประมาณ ระบบช่วยจัดให้</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AutoBuildModal isOpen={isAutoBuildModalOpen} onClose={() => setAutoBuildModalOpen(false)} />

      {/* Spacer เมื่อ navbar เป็น fixed */}
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ height: isSticky ? '88px' : '0' }}
      ></div>

      {/* Secondary Menu Bar - Clean Minimalist */}
      <div className="bg-white border-b border-gray-100 relative z-40">
        <div className="container mx-auto px-6 lg:px-12">
          <nav className="flex items-center space-x-8 text-sm font-medium text-gray-800 h-12">
            {/* Categories */}
            <button
              onClick={() => {
                setCategoriesOpen(!isCategoriesOpen);
                setPromotionOpen(false);
              }}
              className={`flex items-center space-x-2 h-full border-b-2 transition-colors ${isCategoriesOpen ? 'border-black text-black' : 'border-transparent hover:text-black'}`}
            >
              <div className="grid grid-cols-2 gap-0.5">
                <div className={`w-1 h-1 rounded-[1px] ${isCategoriesOpen ? 'bg-black' : 'bg-gray-400 group-hover:bg-black'}`}></div>
                <div className={`w-1 h-1 rounded-[1px] ${isCategoriesOpen ? 'bg-black' : 'bg-gray-400 group-hover:bg-black'}`}></div>
                <div className={`w-1 h-1 rounded-[1px] ${isCategoriesOpen ? 'bg-black' : 'bg-gray-400 group-hover:bg-black'}`}></div>
                <div className={`w-1 h-1 rounded-[1px] ${isCategoriesOpen ? 'bg-black' : 'bg-gray-400 group-hover:bg-black'}`}></div>
              </div>
              <span>หมวดหมู่สินค้า</span>
            </button>

            {/* Separator */}
            <div className="h-4 w-px bg-gray-200"></div>

            {/* Other menu items */}
            <button
              onClick={() => {
                setPromotionOpen(!isPromotionOpen);
                setCategoriesOpen(false);
              }}
              className={`h-full border-b-2 transition-colors flex items-center gap-1 ${isPromotionOpen ? 'border-black text-black' : 'border-transparent hover:text-black'}`}
              style={{ display: showPromotion ? 'flex' : 'none' }}
            >
              โปรโมชันออนไลน์
            </button>

            <a href="#" className="h-full flex items-center border-b-2 border-transparent hover:text-black hover:border-gray-200 transition-all">
              คู่มือการช็อปปิ้ง
            </a>

            <a href="/contact" className="h-full flex items-center border-b-2 border-transparent hover:text-black hover:border-gray-200 transition-all">
              ติดต่อเรา
            </a>
          </nav>
        </div>
      </div>

      {/* Categories Dropdown */}
      <div
        className={`absolute left-0 right-0 bg-white border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out z-30 ${isCategoriesOpen ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
          }`}
      >
        <CategoriesDropdown />
      </div>

      {/* Promotion Dropdown */}
      {showPromotion && (
        <div
          className={`absolute left-0 right-0 bg-white border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out z-30 ${isPromotionOpen ? 'max-h-[600px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
            }`}
        >
          <Promotion />
        </div>
      )}

      {/* Banner carousel */}
      {showBanner && (
        <div className="relative z-10 transition-opacity duration-500">
          {/* Add a fade-in effect or spacing if needed */}
          <BannerCarousel images={["/Banners/mb1.jpg", "/Banners/mb2.jpg", "/Banners/sf1.jpg"]} height="h-[500px] md:h-[600px]" />
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
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
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
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    แชทผ่านเฟสบุ๊ค
                  </a>

                  <a
                    href="/contact"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
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
