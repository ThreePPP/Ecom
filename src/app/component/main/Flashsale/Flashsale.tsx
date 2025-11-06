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
    const maxIndex = Math.max(0, flashSaleData.length - 3);
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
      {/* Flash Sale Header with Countdown */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-800">⚡ Flash Sale</h2>
        </div>
        {!countdown.isExpired && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl shadow-lg">
            <span className="text-sm font-semibold">เหลือเวลา:</span>
            <div className="flex gap-2">
              {countdown.days > 0 && (
                <>
                  <div className="bg-white text-red-600 px-3 py-1 rounded-md font-bold min-w-[48px] text-center">
                    {countdown.days.toString().padStart(2, '0')}
                  </div>
                  <span className="self-center font-bold">:</span>
                </>
              )}
              <div className="bg-white text-red-600 px-3 py-1 rounded-md font-bold min-w-[48px] text-center">
                {countdown.hours.toString().padStart(2, '0')}
              </div>
              <span className="self-center font-bold">:</span>
              <div className="bg-white text-red-600 px-3 py-1 rounded-md font-bold min-w-[48px] text-center">
                {countdown.minutes.toString().padStart(2, '0')}
              </div>
              <span className="self-center font-bold">:</span>
              <div className="bg-white text-red-600 px-3 py-1 rounded-md font-bold min-w-[48px] text-center">
                {countdown.seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        )}
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
          disabled={currentIndex >= Math.max(0, flashSaleData.length - 3)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl ${
            currentIndex >= Math.max(0, flashSaleData.length - 3)
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
            className="flex gap-6 transition-transform duration-700 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / 3 + 2)}%)`
            }}
          >
            {flashSaleData.map((sale) => (
            <div
              key={sale.id}
              className={`${sale.color} rounded-2xl p-6 flex-shrink-0`}
              style={{ width: 'calc(33.333% - 16px)' }}
            >
            <div className="flex items-center gap-3 text-white font-bold text-2xl mb-6">
              <span className="text-yellow-300 text-3xl">{sale.icon}</span>
              {sale.title}
            </div>
            <div className="space-y-4">
              {sale.products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={product.images?.[0] || product.image || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium mb-2 line-clamp-2">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold text-lg">
                        ฿{product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <FaShoppingCart size={16} />
                    <span>เพิ่ม</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.max(0, flashSaleData.length - 2) }).map((_, index) => (
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
