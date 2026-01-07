'use client';

import React, { useEffect, useState } from "react";
import { productAPI } from "@/app/lib/api";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/component/Toast/Toast";
import AddToCartButton from "@/app/component/AddToCartButton/AddToCartButton";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  coverImage?: string;
  category?: string;
  condition?: string;
}

const Bestsell = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showCartToast } = useToast();

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
    <div className="bg-white w-full py-12">
      <div className="container mx-auto px-4">
        {/* Minimal Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-500 text-sm">🔥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">สินค้าแนะนำ</h2>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl text-gray-400 font-light">
            ไม่มีสินค้าแนะนำในขณะนี้
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map((product) => {
              const imageUrl = product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg';

              return (
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-gray-100/50 flex flex-col"
                  onClick={() => window.location.href = `/products/${product._id}`}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                      {product.category && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-md text-gray-900 border border-gray-100 shadow-sm">
                          {product.category}
                        </span>
                      )}
                      {product.condition && (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm backdrop-blur-md border ${product.condition === 'สภาพเหมือนใหม่' ? 'bg-green-50/90 text-green-700 border-green-100' :
                          product.condition === 'สภาพดี' ? 'bg-blue-50/90 text-blue-700 border-blue-100' :
                            product.condition === 'สภาพพอใช้' ? 'bg-yellow-50/90 text-yellow-700 border-yellow-100' :
                              'bg-gray-50/90 text-gray-700 border-gray-100'
                          }`}>
                          {product.condition}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 line-clamp-2 min-h-[40px] group-hover:text-black transition-colors leading-relaxed">
                      {product.name}
                    </h3>

                    <div className="mt-auto pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-gray-900">
                            {product.price.toLocaleString()} coins
                          </span>
                        </div>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <AddToCartButton
                          className="w-full !rounded-xl !bg-black hover:!bg-gray-800 !text-white !h-10 !text-sm font-medium shadow-none transition-all"
                          onClick={() => {
                            addToCart({
                              id: product._id,
                              name: product.name,
                              price: Number(product.price) || 0,
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bestsell;

