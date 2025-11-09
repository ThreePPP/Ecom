"use client"

import React, { useRef, useState, useEffect } from "react";
import { FaShoppingCart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { productAPI } from "@/app/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  category?: string;
  flashSaleEndTime?: string;
}

// Countdown Timer Hook
const useCountdown = (endTime?: string) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!endTime) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      });
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return timeLeft;
};

const Flashsale = () => {
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Get the earliest end time for countdown display
  const earliestEndTime = products.length > 0 
    ? products.reduce((earliest, product) => {
        if (!product.flashSaleEndTime) return earliest;
        if (!earliest) return product.flashSaleEndTime;
        return new Date(product.flashSaleEndTime) < new Date(earliest) 
          ? product.flashSaleEndTime 
          : earliest;
      }, products[0]?.flashSaleEndTime)
    : undefined;

  const countdown = useCountdown(earliestEndTime);

  useEffect(() => {
    const fetchFlashSaleProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProducts({ 
          flashSale: 'true' as any,
          limit: 20 
        });
        
        if (response.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching flash sale products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSaleProducts();
  }, []);

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'อื่นๆ';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const flashSaleData = Object.entries(groupedProducts).map(([category, categoryProducts], index) => ({
    id: index + 1,
    title: `${category} SALE`,
    icon: "⚡",
    color: "bg-red-600",
    products: categoryProducts,
  }));

  const handleAddToCart = (product: Product) => {
    addToCart({
      ...product,
      id: product._id,
      image: product.images?.[0] || product.image || '/placeholder.jpg'
    });
    alert(`เพิ่ม "${product.name}" ลงในตะกร้าสินค้าแล้ว!`);
  };

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const scrollRight = () => {
    const maxIndex = Math.max(0, products.length - 5);
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white px-10 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (flashSaleData.length === 0) {
    return (
      <div className="bg-white px-10 py-8">
        <div className="text-center py-8 text-gray-500">
          ไม่มีสินค้า Flash Sale ในขณะนี้
        </div>
      </div>
    );
  }

  return (
    <div id="flashsale-section" className="bg-white px-10 py-8">
      {/* Flash Sale Header with Gradient Background */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 rounded-3xl px-8 py-12 mb-8 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-4 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-4 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          {/* Main Content: Logo, Time Slots and Countdown */}
          <div className="flex items-center gap-12">
            {/* Flash Sale Title */}
            <div className="flex-shrink-0">
              <div className="relative">
                <img 
                  src="/Banners/flashsale.png" 
                  alt="Flash Sale" 
                  className="w-80 h-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Time Slots and Countdown (Right side) */}
            <div className="flex flex-col gap-6 flex-1">
              {/* Time Slots */}
              <div className="flex items-center gap-8">
                <span className="text-white font-bold text-2xl">ช่วงเวลา:</span>
                <button className="bg-white text-gray-800 px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                  <div className="text-3xl">10:00</div>
                  <div className="text-sm text-gray-500">จบแล้ว</div>
                </button>
                <button className="bg-white text-gray-800 px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                  <div className="text-3xl">14:00</div>
                  <div className="text-sm text-gray-500">จบแล้ว</div>
                </button>
                <button className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg">
                  <div className="text-3xl">18:00</div>
                  <div className="text-sm">กำลังดำเนินอยู่</div>
                </button>
              </div>

              {/* Countdown Timer */}
              {!countdown.isExpired && (
                <div className="flex items-center gap-6">
                  <span className="text-white font-bold text-2xl">จบลงใน :</span>
                  <div className="flex gap-4">
                    {countdown.hours > 0 && (
                      <>
                        <div className="bg-black text-white px-6 py-4 rounded-lg text-center min-w-[90px]">
                          <div className="text-5xl font-bold">{countdown.hours.toString().padStart(2, '0')}</div>
                        </div>
                        <span className="text-white text-5xl font-bold self-center">:</span>
                      </>
                    )}
                    <div className="bg-black text-white px-6 py-4 rounded-lg text-center min-w-[90px]">
                      <div className="text-5xl font-bold">{countdown.minutes.toString().padStart(2, '0')}</div>
                    </div>
                    <span className="text-white text-5xl font-bold self-center">:</span>
                    <div className="bg-black text-white px-6 py-4 rounded-lg text-center min-w-[90px]">
                      <div className="text-5xl font-bold">{countdown.seconds.toString().padStart(2, '0')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View All Button */}
            <div className="flex-shrink-0">
              <button className="bg-white text-gray-800 px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all">
                ดูทั้งหมด →
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          disabled={currentIndex === 0}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl ${
            currentIndex === 0 
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : 'bg-black hover:bg-gray-800'
          }`}
          aria-label="Scroll left"
        >
          <FaChevronLeft className="text-white text-xl" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          disabled={currentIndex >= Math.max(0, products.length - 5)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl ${
            currentIndex >= Math.max(0, products.length - 5)
              ? 'bg-gray-400 cursor-not-allowed opacity-50' 
              : 'bg-black hover:bg-gray-800'
          }`}
          aria-label="Scroll right"
        >
          <FaChevronRight className="text-white text-xl" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-hidden px-12">
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 transition-transform duration-700 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * 20}%)`
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-xl transition-all flex-shrink-0 cursor-pointer"
                style={{ width: '220px' }}
                onClick={() => window.location.href = `/products/${product._id}`}
              >
                {/* Flash Sale Badge */}
                <div className="mb-2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full inline-flex items-center gap-1">
                    ⚡ Flash Sale
                  </span>
                </div>
                
                {/* Product Image */}
                <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  <img
                    src={product.images?.[0] || product.image || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Brand/Category */}
                <div className="text-xs text-gray-500 uppercase font-semibold mb-1">
                  {product.category || 'สินค้า'}
                </div>

                {/* Product Name */}
                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 h-10">
                  {product.name}
                </h3>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 line-through text-xs">
                      ฿{(product.price * 1.2).toLocaleString()}
                    </span>
                    <span className="text-red-600 font-bold text-lg">
                      ฿{product.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Product Detail Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/products/${product._id}`;
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  รายละเอียดสินค้า
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.max(1, Math.ceil(products.length / 5)) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-red-600 w-8' 
                  : 'bg-gray-300 w-2 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Flashsale;
