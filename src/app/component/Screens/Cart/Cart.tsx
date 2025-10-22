"use client"

import React, { useState } from 'react';
import { FaPlus, FaMinus, FaTrash, FaTag, FaTruck, FaUndo, FaShieldAlt } from 'react-icons/fa';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/component/Navbar/Navbar';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart, getSelectedItems, selectedItemIds } = useCart();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Get items to display (selected items or all if none selected)
  const displayItems = selectedItemIds.length > 0 ? getSelectedItems() : cart;

  // Calculate subtotal, VAT, and total based on displayed items
  const subtotal = displayItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    return total + price * item.quantity;
  }, 0);
  const vatRate = 0.07; // 7% VAT
  const vat = subtotal * vatRate;
  const total = subtotal + vat - discount;

  // Handle promo code
  const handleApplyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    
    if (!code) {
      setPromoError('กรุณาใส่โค้ดส่วนลด');
      return;
    }

    // Valid promo codes
    const validCodes: { [key: string]: number } = {
      'ONLINE50': 50,
      'SAVE100': 100,
      'DISCOUNT20': subtotal * 0.2,
    };

    if (validCodes[code] !== undefined) {
      setAppliedPromo(code);
      setDiscount(validCodes[code]);
      setPromoError('');
    } else {
      setPromoError('โค้ดส่วนลดไม่ถูกต้อง');
      setAppliedPromo(null);
      setDiscount(0);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setDiscount(0);
    setPromoError('');
  };

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
            {/* Selected Items Info */}
            {selectedItemIds.length > 0 && cart.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium">
                  📦 แสดงสินค้าที่เลือก: {displayItems.length} จาก {cart.length} รายการ
                </p>
              </div>
            )}

            {displayItems.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-xl mb-4">
                  {cart.length > 0 ? 'กรุณาเลือกสินค้าที่ต้องการสั่งซื้อ' : 'ตะกร้าสินค้าว่างเปล่า'}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  เริ่มช็อปปิ้ง
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                {displayItems.map((item) => (
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
                <div className="p-6 bg-gray-50 flex justify-between items-center">
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    ล้างตะกร้าสินค้า
                  </button>
                  {selectedItemIds.length > 0 && cart.length > displayItems.length && (
                    <button
                      onClick={() => router.push('/')}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      เลือกสินค้าเพิ่ม
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          {displayItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">ยอดรวมทั้งหมด</h2>
                
                {/* Promo Code Input */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaTag className="text-red-600" />
                    โค้ดส่วนลด
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="ใส่โค้ดส่วนลด"
                      disabled={!!appliedPromo}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                    />
                    <button
                      onClick={appliedPromo ? handleRemovePromo : handleApplyPromo}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        appliedPromo
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {appliedPromo ? 'ยกเลิก' : 'ใช้งาน'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-red-500 text-sm mt-2">{promoError}</p>
                  )}
                  {appliedPromo && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                      ✓ ใช้โค้ด {appliedPromo} สำเร็จ
                    </p>
                  )}
                </div>
                
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
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>ส่วนลด ({appliedPromo}):</span>
                      <span>-฿{discount.toLocaleString()}</span>
                    </div>
                  )}
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
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg mb-4"
                >
                  ดำเนินการสั่งซื้อ
                </button>

                {/* Service Information */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaTruck className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">จัดส่งทั่วประเทศ</p>
                      <p className="text-gray-600 text-xs">โดยลูกค้าจะได้รับสินค้าภายใน 1-4 วัน</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaUndo className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">เลือกซื้อสินค้าอย่างปลอดภัย</p>
                      <p className="text-gray-600 text-xs">มั่นใจในทุกการสั่งซื้อ</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaShieldAlt className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">ดูแลลูกค้าทางออนไลน์</p>
                      <p className="text-gray-600 text-xs">เราดูแลลูกค้าทางออนไลน์ในเวบาทำการ</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
};

export default CartPage;
