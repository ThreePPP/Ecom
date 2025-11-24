'use client';

import React, { useEffect, useState } from "react";
import { productAPI } from "@/app/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  category?: string;
}

const Bestsell = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProducts({ 
          featured: 'true' as any,
          limit: 5 
        });
        
        if (response.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  return (
    <div className="bg-gray-50 px-10 py-6">
      {/* Header Section with Categories */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-orange-500 text-2xl">🔥</span>
          <h2 className="text-xl font-bold text-gray-800">สินค้าแนะนำ</h2>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ไม่มีสินค้าแนะนำในขณะนี้
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {products.map((product) => {
            const imageUrl = product.images?.[0] || product.image || '/placeholder.jpg';
            
            return (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.location.href = `/products/${product._id}`}
              >
                <div className="relative">
                  <div className="bg-gray-200 aspect-square flex items-center justify-center overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {product.category && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {product.category}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-600 font-bold text-lg">
                      ฿{product.price.toLocaleString()}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/products/${product._id}`;
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bestsell;
