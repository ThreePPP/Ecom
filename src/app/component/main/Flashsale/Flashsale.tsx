"use client"

import React, { useRef, useState } from "react";
import Image from "next/image";
import { FaShoppingCart, FaPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import type { Product } from "@/app/util/types";

const Flashsale = () => {
  const { addToCart } = useCart();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flashSaleData = [
    {
      id: 1,
      title: "CPU SALE",
      icon: "⚡",
      color: "bg-red-600",
      products: [
        {
          id: "cpu-1",
          name: "CPU (มือ) INTEL 1700 CORE I5-12400F 2.5GHz 6C 12T",
          price: 3690,
          oldPrice: 3990,
          image: "/icons/12400f.jpg",
        },
        {
          id: "cpu-2",
          name: "CPU (มือ) AMD AM5 RYZEN 5 9600X 3.9GHz 6C 12T",
          price: 8690,
          oldPrice: 8990,
          image: "/icons/R5 9600X.jpg",
        },
        {
          id: "cpu-3",
          name: "CPU (มือ) AMD AM5 RYZEN 7 9800X3D 4.7GHz 8C 16T",
          price: 17690,
          oldPrice: 19990,
          image: "/icons/R7 9800X3D.jpg",
        },
      ],
    },
    {
      id: 2,
      title: "MAINBOARD SALE",
      icon: "⚡",
      color: "bg-red-600",
      products: [
        {
          id: "gpu-1",
          name: "CPU (มือ) INTEL 1700 CORE I5-12400F 2.5GHz 6C 12T",
          price: 3690,
          oldPrice: 3990,
          image: "/icons/12400f.jpg",
        },
        {
          id: "gpu-2",
          name: "CPU (มือ) AMD AM5 RYZEN 5 9600X 3.9GHz 6C 12T",
          price: 8690,
          oldPrice: 8990,
          image: "/icons/R5 9600X.jpg",
        },
        {
          id: "gpu-3",
          name: "CPU (มือ) AMD AM5 RYZEN 7 9800X3D 4.7GHz 8C 16T",
          price: 17690,
          oldPrice: 19990,
          image: "/icons/R7 9800X3D.jpg",
        },
      ],
    },
    {
      id: 3,
      title: "RAM SALE",
      icon: "⚡",
      color: "bg-red-600",
      products: [
        {
          id: "ram-1",
          name: "CPU (มือ) INTEL 1700 CORE I5-12400F 2.5GHz 6C 12T",
          price: 3690,
          oldPrice: 3990,
          image: "/icons/12400f.jpg",
        },
        {
          id: "ram-2",
          name: "CPU (มือ) AMD AM5 RYZEN 5 9600X 3.9GHz 6C 12T",
          price: 8690,
          oldPrice: 8990,
          image: "/icons/R5 9600X.jpg",
        },
        {
          id: "ram-3",
          name: "CPU (มือ) AMD AM5 RYZEN 7 9800X3D 4.7GHz 8C 16T",
          price: 17690,
          oldPrice: 19990,
          image: "/icons/R7 9800X3D.jpg",
        },
      ],
    },
    {
      id: 4,
      title: "GPU SALE",
      icon: "⚡",
      color: "bg-red-600",
      products: [
        {
          id: "mb-1",
          name: "MAINBOARD ASUS ROG STRIX B550-F GAMING (AM4)",
          price: 5490,
          oldPrice: 6290,
          image: "/icons/12400f.jpg",
        },
        {
          id: "mb-2",
          name: "MAINBOARD MSI MAG B660M MORTAR WIFI DDR4 (LGA1700)",
          price: 4990,
          oldPrice: 5690,
          image: "/icons/R5 9600X.jpg",
        },
        {
          id: "mb-3",
          name: "MAINBOARD GIGABYTE Z790 AORUS ELITE AX (LGA1700)",
          price: 8990,
          oldPrice: 10990,
          image: "/icons/R7 9800X3D.jpg",
        },
      ],
    },
    {
      id: 5,
      title: "PSU SALE",
      icon: "⚡",
      color: "bg-red-600",
      products: [
        {
          id: "psu-1",
          name: "PSU CORSAIR RM850x 850W 80+ GOLD MODULAR",
          price: 4290,
          oldPrice: 4990,
          image: "/icons/12400f.jpg",
        },
        {
          id: "psu-2",
          name: "PSU SEASONIC FOCUS GX-750 750W 80+ GOLD",
          price: 3490,
          oldPrice: 3990,
          image: "/icons/R5 9600X.jpg",
        },
        {
          id: "psu-3",
          name: "PSU THERMALTAKE TOUGHPOWER GF1 1000W 80+ GOLD",
          price: 5490,
          oldPrice: 6290,
          image: "/icons/R7 9800X3D.jpg",
        },
      ],
    },
  ];

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    // Optional: Show a toast notification
    alert(`เพิ่ม "${product.name}" ลงในตะกร้าสินค้าแล้ว!`);
  };

  const scrollLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const scrollRight = () => {
    const maxIndex = Math.max(0, flashSaleData.length - 3); // แสดง 3 cards พร้อมกัน
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div id="flashsale-section" className="bg-white px-10 py-8">
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
              transform: `translateX(-${currentIndex * (100 / 3 + 2)}%)` // เลื่อนทีละ 1 card (ประมาณ 33.33% + gap)
            }}
          >
            {flashSaleData.map((sale) => (
            <div
              key={sale.id}
              className={`${sale.color} rounded-2xl p-6 flex-shrink-0`}
              style={{ width: 'calc(33.333% - 16px)' }} // แสดง 3 cards พร้อมกัน
            >
            <div className="flex items-center gap-3 text-white font-bold text-2xl mb-6">
              <span className="text-yellow-300 text-3xl">{sale.icon}</span>
              {sale.title}
            </div>
            <div className="space-y-4">
              {sale.products.map((product, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="object-contain"
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
                      {product.oldPrice && (
                        <span className="text-gray-400 text-sm line-through">
                          ฿{product.oldPrice.toLocaleString()}
                        </span>
                      )}
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
