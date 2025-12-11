'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productAPI } from '../lib/api';
import Navbar from '../component/Navbar/Navbar';
import Features from '../component/main/Features/Features';
import Footer from '../component/main/footer/footer';
import Breadcrumb from '../component/Breadcrumb/Breadcrumb';

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand?: string;
  stock: number;
  images?: string[];
  image?: string;
  coverImage?: string;
  condition?: string;
  description: string;
  rating?: number;
  reviewCount?: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    if (query) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts({ search: query });
      
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <>
      <Navbar showBanner={false} showPromotion={false} />
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb items={[{ label: `ค้นหา: "${query}"` }]} />

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ผลการค้นหา: "{query}"
            </h1>
            <p className="text-gray-600">
              พบ {sortedProducts.length} รายการ
            </p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">เรียงตาม:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
              >
                <option value="default">เรียงตามความเกี่ยวข้อง</option>
                <option value="price-asc">ราคา: ต่ำ - สูง</option>
                <option value="price-desc">ราคา: สูง - ต่ำ</option>
                <option value="name-asc">ชื่อ: A-Z</option>
                <option value="name-desc">ชื่อ: Z-A</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-2">ไม่พบสินค้าที่ตรงกับ "{query}"</p>
              <p className="text-gray-400 text-sm">ลองค้นหาด้วยคำอื่น หรือลดคำค้นหาลง</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedProducts.map((product) => {
                const imageUrl = product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg';
                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer relative"
                    onClick={() => router.push(`/products/${product._id}`)}
                  >
                    {/* Condition Badge */}
                    {product.condition && (
                      <div className="absolute top-2 right-2 z-10">
                        <div className={`text-white text-xs px-2 py-1 rounded font-medium ${
                          product.condition === 'สภาพเหมือนใหม่' ? 'bg-green-500' :
                          product.condition === 'สภาพดี' ? 'bg-blue-500' :
                          product.condition === 'สภาพพอใช้' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}>
                          {product.condition}
                        </div>
                      </div>
                    )}
                    
                    <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden p-4">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-blue-600 mb-1">{product.category}</p>
                      <h3 className="text-xs text-gray-600 mb-1 line-clamp-2 min-h-[2rem]">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-900 mb-3">
                        ฿{product.price.toLocaleString()}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/products/${product._id}`);
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        ดูสินค้า
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Features />
      <Footer />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">กำลังโหลด...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
