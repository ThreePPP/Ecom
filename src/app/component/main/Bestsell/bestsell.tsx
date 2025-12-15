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
    <div className="bg-gray-50 w-full">
      <div className="container mx-auto px-4 py-8">
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
            const imageUrl = product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg';
            
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
                  <div className="absolute top-2 left-2">
                    {product.category && (
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded mb-1">
                        {product.category}
                      </div>
                    )}
                    {product.condition && (
                      <div className={`text-white text-xs px-2 py-1 rounded font-medium ${
                        product.condition === 'สภาพเหมือนใหม่' ? 'bg-green-500' :
                        product.condition === 'สภาพดี' ? 'bg-blue-500' :
                        product.condition === 'สภาพพอใช้' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}>
                        {product.condition}
                      </div>
                    )}
                  </div>
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

                  <AddToCartButton 
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
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default Bestsell;
