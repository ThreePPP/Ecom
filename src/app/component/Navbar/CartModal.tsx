"use client"

import React from 'react';
import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { useRouter } from 'next/navigation';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 z-50 flex items-start justify-end">
      <div className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 p-4 border-b">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-800">{cart.length} ชิ้น</h2>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 text-lg">ตะกร้าสินค้าว่างเปล่า</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 flex gap-4 border-b border-gray-100"
                >
                  {/* Quantity Controls - Left Side */}
                  <div className="flex flex-col items-center justify-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FaPlus size={14} />
                    </button>
                    <span className="text-xl font-bold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      <FaMinus size={14} />
                    </button>
                  </div>

                  {/* Product Image */}
                  <div className="w-24 h-24 bg-white flex items-center justify-center flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="float-right text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FaTimes size={18} />
                    </button>
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 pr-6">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 text-xs line-through">
                        ฿{Number(item.price).toLocaleString()} x {item.quantity}
                      </span>
                    </div>
                    <div className="text-red-600 font-bold text-xl">
                      ฿{(Number(item.price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t mt-auto">
            <button
              onClick={handleCheckout}
              className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg mb-3 flex items-center justify-center gap-2"
            >
              สั่งซื้อ (฿{getTotalPrice().toLocaleString()})
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-bold"
            >
              ดูสินค้าเพิ่มเติม
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
