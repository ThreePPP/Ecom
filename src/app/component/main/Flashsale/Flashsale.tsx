"use client"

import React from "react";
import Image from "next/image";
import { FaShoppingCart, FaPlus } from "react-icons/fa";
import { useCart } from "@/app/context/CartContext";
import type { Product } from "@/app/util/types";

const Flashsale = () => {
  const { addToCart } = useCart();

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
      title: "GPU SALE",
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
  ];

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    // Optional: Show a toast notification
    alert(`เพิ่ม "${product.name}" ลงในตะกร้าสินค้าแล้ว!`);
  };

  return (
    <div id="flashsale-section" className="bg-white px-10 py-8">
      <div className="flex gap-4 overflow-x-auto justify-center">
        {flashSaleData.map((sale) => (
          <div
            key={sale.id}
            className={`${sale.color} rounded-2xl p-6`}
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
  );
};

export default Flashsale;
