"use client";

import React, { useState } from "react";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaTag,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import Navbar from "@/app/component/Navbar/Navbar";

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  subdistrict: string;
  postalCode: string;
}

const CartPage = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
    getSelectedItems,
    selectedItemIds,
  } = useCart();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    subdistrict: "",
    postalCode: "",
  });

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

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
    setPromoError("");
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoError("กรุณาใส่โค้ดส่วนลด");
      return;
    }

    // Valid promo codes
    const validCodes: { [key: string]: number } = {
      ONLINE50: 50,
      SAVE100: 100,
      DISCOUNT20: subtotal * 0.2,
    };

    if (validCodes[code] !== undefined) {
      setAppliedPromo(code);
      setDiscount(validCodes[code]);
      setPromoError("");
    } else {
      setPromoError("โค้ดส่วนลดไม่ถูกต้อง");
      setAppliedPromo(null);
      setDiscount(0);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setAppliedPromo(null);
    setDiscount(0);
    setPromoError("");
  };

  const handleNextStep = () => {
    if (currentStep === 1 && displayItems.length === 0) {
      alert("กรุณาเลือกสินค้าก่อนดำเนินการต่อ");
      return;
    }
    if (currentStep === 2) {
      // Validate shipping address
      if (
        !shippingAddress.fullName ||
        !shippingAddress.phone ||
        !shippingAddress.address ||
        !shippingAddress.province ||
        !shippingAddress.district ||
        !shippingAddress.postalCode
      ) {
        alert("กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน");
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCompleteOrder = () => {
    if (!paymentMethod) {
      alert("กรุณาเลือกช่องทางการชำระเงิน");
      return;
    }
    if (!acceptTerms) {
      alert("กรุณายอมรับเงื่อนไขและข้อตกลงในการใช้บริการ");
      return;
    }
    alert(
      `สั่งซื้อสำเร็จ!\nช่องทางการชำระเงิน: ${paymentMethod}\nยอดชำระ: ฿${total.toLocaleString()}`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBanner={false} showPromotion={false} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 ${
                  currentStep >= 1 ? "bg-red-600" : "bg-gray-300"
                } text-white rounded-full flex items-center justify-center font-bold cursor-pointer`}
                onClick={() => setCurrentStep(1)}
              >
                1
              </div>
              <span
                className={`ml-2 font-semibold ${
                  currentStep >= 1 ? "text-red-600" : "text-gray-400"
                }`}
              >
                ตะกร้าสินค้า
              </span>
            </div>
            <div
              className={`w-20 h-1 ${
                currentStep >= 2 ? "bg-red-600" : "bg-gray-300"
              } mx-4`}
            ></div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 ${
                  currentStep >= 2 ? "bg-red-600" : "bg-gray-300"
                } text-white rounded-full flex items-center justify-center font-bold cursor-pointer`}
                onClick={() => currentStep >= 2 && setCurrentStep(2)}
              >
                2
              </div>
              <span
                className={`ml-2 ${
                  currentStep >= 2
                    ? "text-red-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                รายละเอียด
              </span>
            </div>
            <div
              className={`w-20 h-1 ${
                currentStep >= 3 ? "bg-red-600" : "bg-gray-300"
              } mx-4`}
            ></div>
            <div className="flex items-center">
              <div
                className={`w-10 h-10 ${
                  currentStep >= 3 ? "bg-red-600" : "bg-gray-300"
                } text-white rounded-full flex items-center justify-center font-bold cursor-pointer`}
                onClick={() => currentStep >= 3 && setCurrentStep(3)}
              >
                3
              </div>
              <span
                className={`ml-2 ${
                  currentStep >= 3
                    ? "text-red-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                ชำระเงิน
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Cart Items / Shipping / Payment */}
          <div className="lg:col-span-2">
            {/* Step 1: Cart Items */}
            {currentStep === 1 && (
              <>
                {/* Selected Items Info */}
                {selectedItemIds.length > 0 && cart.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 font-medium">
                      📦 แสดงสินค้าที่เลือก: {displayItems.length} จาก{" "}
                      {cart.length} รายการ
                    </p>
                  </div>
                )}

                {displayItems.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500 text-xl mb-4">
                      {cart.length > 0
                        ? "กรุณาเลือกสินค้าที่ต้องการสั่งซื้อ"
                        : "ตะกร้าสินค้าว่างเปล่า"}
                    </p>
                    <button
                      onClick={() => router.push("/")}
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
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                                >
                                  <FaMinus
                                    size={14}
                                    className="text-gray-600"
                                  />
                                </button>
                                <span className="px-6 py-2 font-bold text-lg border-x-2 border-gray-300">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
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
                      {selectedItemIds.length > 0 &&
                        cart.length > displayItems.length && (
                          <button
                            onClick={() => router.push("/")}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            เลือกสินค้าเพิ่ม
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="text-red-600 text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    เพิ่มที่อยู่สำหรับจัดส่ง
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ - นามสกุล
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) =>
                        handleAddressChange("fullName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                      placeholder="กรุณากรอกชื่อ - นามสกุล"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        handleAddressChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                      placeholder="เบอร์โทรศัพท์"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ที่อยู่
                    </label>
                    <textarea
                      value={shippingAddress.address}
                      onChange={(e) =>
                        handleAddressChange("address", e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                      placeholder="บ้านเลขที่ หมู่บ้าน ซอย ถนน"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        รหัสไปรษณีย์
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          handleAddressChange("postalCode", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                        placeholder="รหัสไปรษณีย์"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        จังหวัด
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.province}
                        onChange={(e) =>
                          handleAddressChange("province", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                        placeholder="จังหวัด"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        อำเภอ / เขต
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.district}
                        onChange={(e) =>
                          handleAddressChange("district", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                        placeholder="อำเภอ / เขต"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ตำบล/แขวง
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.subdistrict}
                        onChange={(e) =>
                          handleAddressChange("subdistrict", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                        placeholder="ตำบล/แขวง"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Shipping Address Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <FaMapMarkerAlt className="text-green-600 text-xl" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        ที่อยู่ในการจัดส่ง
                      </h3>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      แก้ไข
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-800 font-semibold">
                      {shippingAddress.fullName}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {shippingAddress.phone}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {shippingAddress.address}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {shippingAddress.subdistrict} {shippingAddress.district}{" "}
                      {shippingAddress.province} {shippingAddress.postalCode}
                    </p>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaTag className="text-blue-600 text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      รายการสินค้า ({displayItems.length} รายการ)
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {displayItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-gray-800 font-medium text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-gray-500 text-xs">
                            จำนวน: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-600 font-bold">
                            ฿{(Number(item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <FaCreditCard className="text-red-600 text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      เลือกช่องทางการชำระเงิน
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {/* Credit Card */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "credit-card"
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="credit-card"
                        checked={paymentMethod === "credit-card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <div className="ml-4 flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FaCreditCard className="text-blue-600" size={24} />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            บัตรเครดิต / เดบิต
                          </span>
                          <span className="text-xs text-gray-500">
                            Visa, Mastercard, JCB
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* Installment */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "installment"
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="installment"
                        checked={paymentMethod === "installment"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <div className="ml-4 flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FaCreditCard className="text-purple-600" size={24} />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            ผ่อนชำระ 0%
                          </span>
                          <span className="text-xs text-gray-500">
                            3, 6, 10 เดือน
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* Mobile Banking */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "mobile-banking"
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="mobile-banking"
                        checked={paymentMethod === "mobile-banking"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <div className="ml-4 flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            โมบายแบงก์กิ้ง
                          </span>
                          <span className="text-xs text-gray-500">
                            ธนาคารชั้นนำทุกธนาคาร
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* Internet Banking */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "internet-banking"
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="internet-banking"
                        checked={paymentMethod === "internet-banking"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <div className="ml-4 flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-indigo-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            อินเทอร์เน็ตแบงก์กิ้ง
                          </span>
                          <span className="text-xs text-gray-500">
                            ชำระผ่านเว็บไซต์ธนาคาร
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* PromptPay */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "promptpay"
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="promptpay"
                        checked={paymentMethod === "promptpay"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <div className="ml-4 flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-blue-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            พร้อมเพย์ (PromptPay)
                          </span>
                          <span className="text-xs text-gray-500">
                            สแกน QR Code ชำระเงิน
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* TrueMoney Wallet */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "truemoney"
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="truemoney"
                        checked={paymentMethod === "truemoney"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <div className="ml-4 flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FaMoneyBillWave className="text-orange-600" size={24} />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            ทรูมันนี่ วอลเล็ท
                          </span>
                          <span className="text-xs text-gray-500">
                            TrueMoney Wallet
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* Line Pay */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "linepay"
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="linepay"
                        checked={paymentMethod === "linepay"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <div className="ml-4 flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            ไลน์เพย์ (LINE Pay)
                          </span>
                          <span className="text-xs text-gray-500">
                            ชำระผ่าน LINE แอพพลิเคชั่น
                          </span>
                        </div>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-red-500 bg-red-50 shadow-md"
                          : "border-gray-300 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-red-600 cursor-pointer"
                      />
                      <div className="ml-4 flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FaMoneyBillWave
                            className="text-green-600"
                            size={24}
                          />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            เก็บเงินปลายทาง (COD)
                          </span>
                          <span className="text-xs text-gray-500">
                            ชำระเงินเมื่อได้รับสินค้า
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Order Summary */}
          {displayItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  ยอดรวมทั้งหมด
                </h2>

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
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="ใส่โค้ดส่วนลด"
                      disabled={!!appliedPromo}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                    />
                    <button
                      onClick={
                        appliedPromo ? handleRemovePromo : handleApplyPromo
                      }
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        appliedPromo
                          ? "bg-red-100 text-red-600 hover:bg-red-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {appliedPromo ? "ยกเลิก" : "ใช้งาน"}
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
                    <span>
                      ฿
                      {vat.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
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
                    <span className="text-lg font-bold text-gray-800">
                      ยอดรวม
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      ฿
                      {total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ยอดรวม (รวมภาษีมูลค่าเพิ่ม)
                  </p>
                </div>

                {/* Terms and Conditions - Only show on payment step */}
                {currentStep === 3 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-5 h-5 mt-0.5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        ข้าพเจ้ายอมรับ{" "}
                        <a
                          href="/privacy-policy"
                          className="text-red-600 hover:text-red-700 font-medium underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          นโยบายความเป็นส่วนตัว
                        </a>{" "}
                        และ{" "}
                        <a
                          href="/terms-of-service"
                          className="text-red-600 hover:text-red-700 font-medium underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ข้อตกลงในการใช้บริการ
                        </a>
                      </span>
                    </label>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="space-y-3 mb-4">
                  {currentStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg"
                    >
                      {currentStep === 1
                        ? "ดำเนินการต่อ"
                        : currentStep === 2
                        ? "ไปหน้าชำระเงิน"
                        : "ดำเนินการสั่งซื้อ"}
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteOrder}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-lg"
                    >
                      ยืนยันการสั่งซื้อ
                    </button>
                  )}

                  {currentStep > 1 && (
                    <button
                      onClick={handlePreviousStep}
                      className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-bold"
                    >
                      ย้อนกลับ
                    </button>
                  )}
                </div>

                {/* Service Information */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaTruck className="text-red-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        จัดส่งทั่วประเทศ
                      </p>
                      <p className="text-gray-600 text-xs">
                        โดยลูกค้าจะได้รับสินค้าภายใน 1-4 วัน
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaUndo className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        เลือกซื้อสินค้าอย่างปลอดภัย
                      </p>
                      <p className="text-gray-600 text-xs">
                        มั่นใจในทุกการสั่งซื้อ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaShieldAlt className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        ดูแลลูกค้าทางออนไลน์
                      </p>
                      <p className="text-gray-600 text-xs">
                        เราดูแลลูกค้าทางออนไลน์ในเวบาทำการ
                      </p>
                    </div>
                  </div>
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
