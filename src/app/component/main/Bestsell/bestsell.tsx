import React from "react";
import Image from "next/image";

const Bestsell = () => {
  const products = [
    {
      id: 1,
      brand: "ASUS",
      name: "Notebook Asus Expertbook B9 B9403CVAR-P1T390X (Star Black)",
      specs:
        "14.0 inch / Intel Core 7 150U / 16GB LPDDR5X / 1TB SSD / Integrated Graphics / Win 11 Pro",
      price: "฿60,990",
      oldPrice: "฿31,990",
      installment: "ประกัน 3-3-3",
      discount: null,
      badge: "ขายได้ มีที่",
      image: "/public/Banners/sf1.jpg",
      views: "2",
    },
    {
      id: 2,
      brand: "LENOVO",
      name: "Notebook Lenovo V15 G4 IRU 83A100DDTA (Business Black)",
      specs:
        "15.6 inch / Intel i5-13420H / 16GB DDR4 / 512GB SSD / Integrated Graphics / Win 11 Home",
      price: "฿13,490",
      oldPrice: "฿13,990",
      installment: "ประกัน 1-1-1",
      discount: "-3500",
      badge: "Best Price",
      image: "/public/Banners/sf1.jpg",
      views: "20.2 K",
    },
    {
      id: 3,
      brand: "HP",
      name: "Notebook HP ProBook 4 G11 (8X8D4PT#AKL)",
      specs:
        "16.0 inch / Intel Core Ultra 5 225U (AI) / 16GB DDR5 / 512GB SSD / Integrated Graphics / Win 11 Pro",
      price: "฿29,990",
      oldPrice: "฿31,490",
      installment: "ประกัน 3-3-3",
      discount: "-31,500",
      badge: "Best Price",
      image: "/public/Banners/sf1.jpg",
      views: "4",
    },
    {
      id: 4,
      brand: "MSI",
      name: "Notebook MSI Vector 18 HX A1 4DXW1S-943TH (Cosmos Gray)",
      specs:
        "18.0 inch / Intel Core Ultra 9 275HX (AI) / 32GB DDR5 / 2TB SSD / GeForce RTX 5090 16GB GDDR7 / Win 11",
      price: "฿99,590",
      oldPrice: "฿104,990",
      installment: "ประกัน 3Y",
      discount: "-35,400",
      badge: null,
      image: "/public/Banners/sf1.jpg",
      views: "162",
    },
    {
      id: 5,
      brand: "ACER",
      name: "Notebook Acer Travelmate TMP215-53-TCO-5305/T002 (Pure Silver)",
      specs:
        "15.6 inch / Intel i5-1334U / 8GB DDR5 / 512GB SSD / Integrated Graphics / ESHELL",
      price: "฿15,390",
      oldPrice: "฿15,990",
      installment: "ประกัน 3-3-3",
      discount: "-600",
      badge: null,
      image: "/public/Banners/sf1.jpg",
      views: "4.6 K",
    },
  ];

  return (
    <div className="bg-white px-10 py-6">
      {/* Header Section with Categories */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl p-8 mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white">สินค้าแนะนำ</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-2 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition">
              Cpu
            </button>
            <button className="px-6 py-2 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition">
              Mainboard
            </button>
            <button className="px-6 py-2 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition">
              Ram
            </button>
            <button className="px-6 py-2 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition">
              Graphic Card
            </button>
            <button className="px-6 py-2 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition">
              Power Supply
            </button>
            <button className="px-6 py-2 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition">
              Monitor
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-4 flex flex-col"
          >
            {/* Brand Logo */}
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-bold text-gray-700">
                {product.brand}
              </div>
              {product.badge && (
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    product.badge === "Best Price"
                      ? "bg-red-500 text-white"
                      : "bg-yellow-400 text-gray-800"
                  }`}
                >
                  {product.badge}
                </div>
              )}
            </div>

            {/* Product Image */}
            <div className="bg-gray-100 rounded-lg mb-3 h-48 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Product Image</div>
            </div>

            {/* Product Name */}
            <h3 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[40px]">
              {product.name}
            </h3>

            {/* Specs */}
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 min-h-[32px]">
              {product.specs}
            </p>

            {/* Installment */}
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {product.installment}
              </div>
              <div className="text-blue-600 text-xs">ℹ️</div>
            </div>

            {/* Price Section */}
            <div className="mt-auto">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">
                  {product.price}
                </span>
                {product.discount && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {product.discount}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 line-through mb-3">
                *ราคาปกติ {product.oldPrice} รวบสินค้าแล้วนะ
              </div>

              {/* Buy Button */}
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full transition flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
                ซื้อเลย
              </button>

              {/* Views */}
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
                {product.views}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bestsell;
