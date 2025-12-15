"use client"

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaMinus, FaCheck } from 'react-icons/fa';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { useToast } from '@/app/component/Toast/Toast';
import { useRouter } from 'next/navigation';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, setSelectedItems: saveSelectedItems, selectedItemIds } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Handler for removing item with toast
  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId);
    showToast('ลบสินค้าออกจากตะกร้าแล้ว', 'error', 2500);
  };

  // Load saved selected items or select all by default
  useEffect(() => {
    if (selectedItemIds.length > 0) {
      setSelectedItems(new Set(selectedItemIds));
    } else {
      setSelectedItems(new Set(cart.map(item => item.id)));
    }
  }, [cart, selectedItemIds]);

  if (!isOpen) return null;

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cart.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.map(item => item.id)));
    }
  };

  const getSelectedTotal = () => {
    return cart
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      alert('กรุณาเลือกสินค้าที่ต้องการสั่งซื้อ');
      return;
    }
    // Save selected items to context
    saveSelectedItems(Array.from(selectedItems));
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 z-50 flex items-start justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">{cart.length} ชิ้น</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
          >
            <FaTimes size={22} />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 text-lg">ตะกร้าสินค้าว่างเปล่า</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 flex gap-3 hover:bg-gray-50 transition-colors"
                >
                  {/* Checkbox */}
                  <div className="flex items-start pt-8">
                    <button
                      onClick={() => toggleSelectItem(item.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedItems.has(item.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {selectedItems.has(item.id) && (
                        <FaCheck size={12} className="text-white" />
                      )}
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    
                    {/* Stock Status */}
                    <div className="mb-2">
                      <span className="text-xs text-green-600 font-medium">สินค้าพร้อมส่ง</span>
                    </div>

                    {/* Price */}
                    <div className="text-red-600 font-bold text-lg mb-3">
                      ฿{Number(item.price).toLocaleString()}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            handleRemoveFromCart(item.id);
                          } else {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                      >
                        <FaMinus size={10} />
                      </button>
                      <span className="text-base font-semibold text-gray-800 min-w-[30px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                      >
                        <FaPlus size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="flex items-start pt-1">
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="bg-white border-t mt-auto shadow-lg">
            {/* Select All */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedItems.size === cart.length
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedItems.size === cart.length && (
                    <FaCheck size={10} className="text-white" />
                  )}
                </div>
                <span>เลือกทั้งหมด ({selectedItems.size}/{cart.length})</span>
              </button>
              <span className="text-sm text-gray-600">
                รวม: <span className="font-bold text-red-600 text-base">฿{getSelectedTotal().toLocaleString()}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="p-4 space-y-2">
              <button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0}
                className={`w-full px-6 py-3.5 rounded-lg font-bold text-base transition-all ${
                  selectedItems.size === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                }`}
              >
                สั่งซื้อ ({selectedItems.size} ชิ้น) ฿{getSelectedTotal().toLocaleString()}
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                ช้อปปิ้งต่อ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
