"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCompare } from '@/app/context/CompareContext';
import Navbar from '@/app/component/Navbar/Navbar';
import Footer from '@/app/component/main/footer/footer';
import Breadcrumb from '@/app/component/Breadcrumb/Breadcrumb';
import { FaTimes, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '@/app/context/CartContext';

export default function ComparePage() {
  const router = useRouter();
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: Number(product.price) || 0,
      oldPrice: product.oldPrice ? Number(product.oldPrice) : product.originalPrice ? Number(product.originalPrice) : undefined,
      image: product.images?.[0] || product.image || '/placeholder.jpg',
      images: product.images
    });
    alert(`เพิ่ม "${product.name}" ลงในตะกร้าสินค้าแล้ว!`);
  };

  // Get all unique specification keys from all products
  const getAllSpecKeys = () => {
    const keys = new Set<string>();
    compareItems.forEach(item => {
      if (item.specifications) {
        const specs = item.specifications instanceof Map 
          ? Object.fromEntries(item.specifications) 
          : item.specifications;
        Object.keys(specs).forEach(key => keys.add(key));
      }
    });
    return Array.from(keys);
  };

  const getSpecValue = (product: any, key: string) => {
    if (!product.specifications) return '-';
    const specs = product.specifications instanceof Map 
      ? Object.fromEntries(product.specifications) 
      : product.specifications;
    return specs[key] || '-';
  };

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showBanner={false} showPromotion={false} />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <Breadcrumb items={[{ label: 'เปรียบเทียบสินค้า' }]} />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">เปรียบเทียบสินค้า</h1>
            <p className="text-gray-600 mb-8">คุณยังไม่มีสินค้าในรายการเปรียบเทียบ</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              เลือกสินค้าเพื่อเปรียบเทียบ
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const specKeys = getAllSpecKeys();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBanner={false} showPromotion={false} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'เปรียบเทียบสินค้า' }]} />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">เปรียบเทียบสินค้า</h1>
          <div className="flex gap-4">
            <button
              onClick={clearCompare}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ล้างทั้งหมด
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              เพิ่มสินค้า
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="sticky left-0 bg-white p-4 text-left font-semibold text-gray-900 w-48">
                  รายการ
                </th>
                {compareItems.map((item) => (
                  <th key={item._id || item.id} className="p-4 min-w-[280px] relative">
                    <button
                      onClick={() => removeFromCompare(item._id || item.id || '')}
                      className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      title="ลบออกจากรายการ"
                    >
                      <FaTimes />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Product Image */}
              <tr className="border-b border-gray-200">
                <td className="sticky left-0 bg-white p-4 font-semibold text-gray-700">
                  รูปภาพ
                </td>
                {compareItems.map((item) => (
                  <td key={item._id || item.id} className="p-4">
                    <div className="bg-gray-50 rounded-lg p-4 aspect-square flex items-center justify-center">
                      <img
                        src={item.images?.[0] || item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-contain cursor-pointer"
                        onClick={() => router.push(`/products/${item._id || item.id}`)}
                      />
                    </div>
                  </td>
                ))}
              </tr>

              {/* Product Name */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="sticky left-0 bg-gray-50 p-4 font-semibold text-gray-700">
                  ชื่อสินค้า
                </td>
                {compareItems.map((item) => (
                  <td key={item._id || item.id} className="p-4">
                    <div 
                      className="font-semibold text-gray-900 cursor-pointer hover:text-red-600"
                      onClick={() => router.push(`/products/${item._id || item.id}`)}
                    >
                      {item.name}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className="border-b border-gray-200">
                <td className="sticky left-0 bg-white p-4 font-semibold text-gray-700">
                  ราคา
                </td>
                {compareItems.map((item) => (
                  <td key={item._id || item.id} className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      ฿{item.price.toLocaleString()}
                    </div>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <div className="text-sm text-gray-500 line-through">
                        ฿{item.originalPrice.toLocaleString()}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Brand */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="sticky left-0 bg-gray-50 p-4 font-semibold text-gray-700">
                  แบรนด์
                </td>
                {compareItems.map((item) => (
                  <td key={item._id || item.id} className="p-4 text-gray-900">
                    {item.brand || '-'}
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className="border-b border-gray-200">
                <td className="sticky left-0 bg-white p-4 font-semibold text-gray-700">
                  หมวดหมู่
                </td>
                {compareItems.map((item) => (
                  <td key={item._id || item.id} className="p-4 text-gray-900">
                    {item.category || '-'}
                  </td>
                ))}
              </tr>

              {/* Stock */}
              <tr className="border-b border-gray-200 bg-gray-50">
                <td className="sticky left-0 bg-gray-50 p-4 font-semibold text-gray-700">
                  สต็อก
                </td>
                {compareItems.map((item) => (
                  <td key={item._id || item.id} className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      (item.stock || 0) > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {(item.stock || 0) > 0 ? 'มีสินค้า' : 'สินค้าหมด'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr className="border-b border-gray-200">
                <td className="sticky left-0 bg-white p-4 font-semibold text-gray-700">
                  รายละเอียด
                </td>
                {compareItems.map((item) => (
                  <td key={item._id || item.id} className="p-4 text-sm text-gray-700">
                    {item.description || '-'}
                  </td>
                ))}
              </tr>

              {/* Specifications */}
              {specKeys.map((key, index) => (
                <tr 
                  key={key} 
                  className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                >
                  <td className={`sticky left-0 p-4 font-semibold text-gray-700 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    {key}
                  </td>
                  {compareItems.map((item) => (
                    <td key={item._id || item.id} className="p-4 text-gray-900">
                      {getSpecValue(item, key)}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Add to Cart Button */}
              <tr>
                <td className="sticky left-0 bg-white p-4 font-semibold text-gray-700">
                  การดำเนินการ
                </td>
                {compareItems.map((item) => (
                  <td key={item._id || item.id} className="p-4">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={(item.stock || 0) <= 0}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                        (item.stock || 0) > 0
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FaShoppingCart />
                      {(item.stock || 0) > 0 ? 'เพิ่มลงตะกร้า' : 'สินค้าหมด'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </div>
  );
}
