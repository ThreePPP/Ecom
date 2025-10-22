"use client"

import React from 'react';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/component/Navbar/Navbar';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const router = useRouter();

  // Calculate subtotal, VAT, and total
  const subtotal = getTotalPrice();
  const vatRate = 0.07; // 7% VAT
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBanner={false} showPromotion={false} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <span className="ml-2 font-semibold text-red-600">ตะกร้าสินค้า</span>
            </div>
            <div className="w-20 h-1 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <span className="ml-2 text-gray-400">รานละเอียด</span>
            </div>
            <div className="w-20 h-1 bg-gray-300 mx-4"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <span className="ml-2 text-gray-400">ชำระเงิน</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Cart Items */}
          <div className="lg:col-span-2">
            {cart.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-xl mb-4">ตะกร้าสินค้าว่างเปล่า</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  เริ่มช็อปปิ้ง
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={128}
                          height={128}
                          className="object-contain"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-red-600 font-bold text-xl">
                            ฿{Number(item.price).toLocaleString()}
                          </span>
                          {item.oldPrice && (
                            <span className="text-gray-400 text-sm line-through">
                              ฿{Number(item.oldPrice).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center border-2 border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-4 py-2 hover:bg-gray-100 transition-colors"
                            >
                              <FaMinus size={14} className="text-gray-600" />
                            </button>
                            <span className="px-6 py-2 font-bold text-lg border-x-2 border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-4 py-2 hover:bg-gray-100 transition-colors"
                            >
                              <FaPlus size={14} className="text-gray-600" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Clear Cart Button */}
                <div className="p-6 bg-gray-50">
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    ล้างตะกร้าสินค้า
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          {cart.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">ยอดรวมทั้งหมด</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>ค่าสินค้า:</span>
                    <span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ราคาค่าส่งสินค้า:</span>
                    <span className="text-red-600">฿0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ภาษี VAT 7%:</span>
                    <span>฿{vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ส่วนลดเพิ่มหมด:</span>
                    <span>฿0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ส่วนลด:</span>
                    <span>฿0.00</span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">ยอดรวม</span>
                    <span className="text-2xl font-bold text-red-600">
                      ฿{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">ยอดรวม (รวมภาษีมูลค่าเพิ่ม)</p>
                </div>

                <button
                  onClick={() => alert('กำลังไปหน้าชำระเงิน...')}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg mb-3"
                >
                  ดำเนินการสั่งซื้อ
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
                >
                  ดูสินค้าเพิ่มเติม
                </button>

                {/* Additional Info */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span>💳</span>
                    <div>
                      <p className="font-semibold">ส่งฟรีทั่วไทย</p>
                      <p>ช้อปครบ 5,000 บาทขึ้นไป</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span>🔍</span>
                    <div>
                      <p className="font-semibold">ผ่อนสูงสุด 10 เดือน</p>
                      <p>**บัตรที่ผ่อนได้มีเงื่อนไขเกณฑ์ค่าตัด</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span>💰</span>
                    <div>
                      <p className="font-semibold">ไว้ใจ 1000.-</p>
                      <p>แอคโรงฝั่นเซ่ต(ซื้อสินค้า เมาคอมมุ้นี่ประกันคอมเพ็ต)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span>📦</span>
                    <div>
                      <p className="font-semibold">คืนสินค้า</p>
                      <p>7 วัน</p>
                      <p className="text-xs text-red-600">เป็นไปในเทอร์ของเงื่อนไขร้านค้า</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                    ขอเคลมสินค้า
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
