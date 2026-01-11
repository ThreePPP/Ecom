"use client"

import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/component/Toast/Toast";
import { productAPI } from "@/app/lib/api";
import { getImageUrl } from "@/app/utils/imageUrl";


interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  originalPrice?: number;
  discount?: number;
  images?: string[];
  image?: string;
  coverImage?: string;
  category?: string;
  condition?: string;
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

// Product Card Component
// Product Card Component
import AddToCartButton from "@/app/component/AddToCartButton/AddToCartButton";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const productCountdown = useCountdown(product.flashSaleEndTime);
  const { addToCart } = useCart();
  const { showCartToast } = useToast();

  // Calculate discount percentage
  const originalPrice = product.originalPrice || product.oldPrice || product.price * 1.2;
  const discountPercent = product.discount || Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const rawImageUrl = product.coverImage || product.images?.[0] || product.image;
  const imageUrl = getImageUrl(rawImageUrl);

  return (
    <div
      className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-gray-100/50 flex flex-col flex-shrink-0 w-[160px] sm:w-[200px] lg:w-[240px]"
      onClick={() => window.location.href = `/products/${product._id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-10 items-start">
          {product.category && (
            <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-semibold bg-white/90 backdrop-blur-md text-gray-900 border border-gray-100 shadow-sm">
              {product.category}
            </span>
          )}
          {product.condition && (
            <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-semibold shadow-sm backdrop-blur-md border ${product.condition === 'สภาพเหมือนใหม่' ? 'bg-green-50/90 text-green-700 border-green-100' :
              product.condition === 'สภาพดี' ? 'bg-blue-50/90 text-blue-700 border-blue-100' :
                product.condition === 'สภาพพอใช้' ? 'bg-yellow-50/90 text-yellow-700 border-yellow-100' :
                  'bg-gray-50/90 text-gray-700 border-gray-100'
              }`}>
              {product.condition}
            </span>
          )}
        </div>

        {/* Discount Badge */}
        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg sm:rounded-bl-xl z-20 shadow-sm">
          -{discountPercent}%
        </div>
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        {/* Product Name */}
        <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 line-clamp-2 h-8 sm:h-10 group-hover:text-black transition-colors leading-relaxed">
          {product.name}
        </h3>

        {/* Flash Sale Timer */}
        {!productCountdown.isExpired && (
          <div className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-medium text-red-600 bg-red-50 border border-red-500 rounded-md sm:rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 inline-flex items-center gap-1 sm:gap-1.5 w-fit">
            <span>⚡</span>
            <span>เหลือ {productCountdown.days}D {productCountdown.hours}:{productCountdown.minutes.toString().padStart(2, '0')}:{productCountdown.seconds.toString().padStart(2, '0')}</span>
          </div>
        )}

        <div className="mt-auto pt-1.5 sm:pt-2 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-sm sm:text-lg font-bold text-gray-900">
                  {product.price.toLocaleString()} coins
                </span>
                <span className="text-[10px] sm:text-xs text-gray-400 line-through hidden sm:inline">
                  {originalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <AddToCartButton
              className="w-full !rounded-lg sm:!rounded-xl !bg-black hover:!bg-gray-800 !text-white !h-7 sm:!h-9 !text-xs sm:!text-sm font-medium shadow-none transition-all"
              onClick={() => {
                addToCart({
                  id: product._id,
                  name: product.name,
                  price: Number(product.price) || 0,
                  oldPrice: product.oldPrice ? Number(product.oldPrice) : product.originalPrice ? Number(product.originalPrice) : undefined,
                  image: imageUrl,
                  images: product.images
                });
                showCartToast('เพิ่มสินค้าลงตะกร้า');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Flashsale = () => {

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
      <div className="bg-gray-50 w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (flashSaleData.length === 0) {
    return (
      <div className="bg-gray-50 w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8 text-gray-500">
            ไม่มีสินค้า Flash Sale ในขณะนี้
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="flashsale-section" className="bg-gray-50 w-full">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Flash Sale Header */}
        <div className="relative bg-white rounded-xl sm:rounded-2xl px-4 sm:px-8 py-3 sm:py-6 mb-4 sm:mb-8 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/icons/bolt.png" alt="Flash Sale" className="w-6 h-6 sm:w-8 sm:h-8" />
              <h2 className="text-red-600 text-lg sm:text-2xl font-bold">Flash Sale</h2>
            </div>

            {/* Countdown Timer */}
            {!countdown.isExpired && (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <div className="bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-center min-w-[40px] sm:min-w-[60px]">
                  <div className="text-base sm:text-2xl font-bold text-gray-800">{countdown.days}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">วัน</div>
                </div>
                <div className="bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-center min-w-[40px] sm:min-w-[60px]">
                  <div className="text-base sm:text-2xl font-bold text-gray-800">{countdown.hours.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">ชั่วโมง</div>
                </div>
                <div className="bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-center min-w-[40px] sm:min-w-[60px]">
                  <div className="text-base sm:text-2xl font-bold text-gray-800">{countdown.minutes.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">นาที</div>
                </div>
                <div className="bg-gray-100 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg text-center min-w-[40px] sm:min-w-[60px]">
                  <div className="text-base sm:text-2xl font-bold text-gray-800">{countdown.seconds.toString().padStart(2, '0')}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">วินาที</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative">
          {/* Left Arrow - Hidden on mobile (use swipe) */}
          <button
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className={`absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl hidden sm:block ${currentIndex === 0
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-black hover:bg-gray-800'
              }`}
            aria-label="Scroll left"
          >
            <FaChevronLeft className="text-white text-base sm:text-xl" />
          </button>

          {/* Right Arrow - Hidden on mobile (use swipe) */}
          <button
            onClick={scrollRight}
            disabled={currentIndex >= Math.max(0, products.length - 5)}
            className={`absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 shadow-lg rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl hidden sm:block ${currentIndex >= Math.max(0, products.length - 5)
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-black hover:bg-gray-800'
              }`}
            aria-label="Scroll right"
          >
            <FaChevronRight className="text-white text-base sm:text-xl" />
          </button>

          {/* Scrollable Container - Touch scroll on mobile */}
          <div className="overflow-x-auto sm:overflow-hidden px-0 sm:px-12 scrollbar-hide touch-scroll">
            <div
              ref={scrollContainerRef}
              className="flex gap-2 sm:gap-4 pb-2 sm:pb-0 sm:transition-transform sm:duration-700 sm:ease-in-out"
              style={{
                transform: `translateX(-${typeof window !== 'undefined' && window.innerWidth >= 640 ? currentIndex * 20.8 : 0}%)`
              }}
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Dots Indicator - Hidden on mobile */}
          <div className="hidden sm:flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.max(1, Math.ceil(products.length / 5)) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                  ? 'bg-red-600 w-8'
                  : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashsale;
