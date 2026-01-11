"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaMinus,
  FaTrash,
  FaTag,
  FaUndo,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaMoneyBillWave,
  FaShippingFast,
  FaShoppingBag,
  FaComments,
} from "react-icons/fa";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/component/Toast/Toast";
import { useRouter } from "next/navigation";
import Navbar from "@/app/component/Navbar/Navbar";
import Features from "@/app/component/main/Features/Features";
import Footer from "@/app/component/main/footer/footer";
import { addressAPI } from "@/app/lib/api";
import { getImageUrl } from "@/app/utils/imageUrl";

interface ShippingAddress {
  _id?: string;
  fullName: string;
  phone: string;
  phoneNumber?: string;
  address: string;
  province: string;
  district: string;
  subdistrict?: string;
  postalCode: string;
  isDefault?: boolean;
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
    clearSelectedItems,
  } = useCart();
  const { user, refreshUser } = useAuth();
  const { showToast, showSuccessToast, showErrorToast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");

  // Handler for removing item with toast
  const handleRemoveFromCart = (itemId: string, itemName?: string) => {
    removeFromCart(itemId);
    showToast('ลบสินค้าออกจากตะกร้าแล้ว', 'error', 2500);
  };

  // Handler for clearing cart with toast
  const handleClearCart = () => {
    clearCart();
    showToast('ล้างตะกร้าสินค้าแล้ว', 'error', 2500);
  };

  // Saved addresses from database
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);

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

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);

  // Fetch saved addresses when component mounts
  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  // Re-fetch addresses when returning to step 2
  useEffect(() => {
    if (currentStep === 2) {
      fetchSavedAddresses();
    }
  }, [currentStep]);

  const fetchSavedAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressAPI.getAddresses();
      if (response.success && response.data) {
        setSavedAddresses(response.data);
        // Auto-select default address if exists and no address currently selected
        if (!selectedAddressId) {
          const defaultAddress = response.data.find((addr: ShippingAddress) => addr.isDefault);
          if (defaultAddress && defaultAddress._id) {
            setSelectedAddressId(defaultAddress._id);
            setShippingAddress({
              fullName: defaultAddress.fullName,
              phone: defaultAddress.phoneNumber || defaultAddress.phone || "",
              address: defaultAddress.address,
              province: defaultAddress.province,
              district: defaultAddress.district,
              subdistrict: defaultAddress.subdistrict || "",
              postalCode: defaultAddress.postalCode,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Handle address selection
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selected = savedAddresses.find((addr) => addr._id === addressId);
    if (selected) {
      setShippingAddress({
        fullName: selected.fullName,
        phone: selected.phoneNumber || selected.phone || "",
        address: selected.address,
        province: selected.province,
        district: selected.district,
        subdistrict: selected.subdistrict || "",
        postalCode: selected.postalCode,
      });
    }
  };

  // Get items to display (selected items or all if none selected)
  const displayItems = selectedItemIds.length > 0 ? getSelectedItems() : cart;

  // Calculate subtotal and total based on displayed items
  const subtotal = displayItems.reduce((total, item) => {
    const price = Number(item.price) || 0;
    return total + price * item.quantity;
  }, 0);
  const total = subtotal - discount;

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
      showErrorToast("กรุณาเลือกสินค้าก่อนดำเนินการต่อ");
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
        showErrorToast("กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน");
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

  const handleCompleteOrder = async () => {
    if (!paymentMethod) {
      showErrorToast("กรุณาเลือกช่องทางการชำระเงิน");
      return;
    }
    if (!acceptTerms) {
      showErrorToast("กรุณายอมรับเงื่อนไขและข้อตกลงในการใช้บริการ");
      return;
    }

    if (paymentMethod === 'coin_payment') {
      const userCoins = user?.coins || 0;
      if (userCoins < total) {
        setShowInsufficientCoinsModal(true);
        return;
      }
    }

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        showErrorToast('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
        router.push('/');
        return;
      }

      // Prepare order items
      const orderItems = displayItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: Number(item.price) || 0,
        name: item.name,
        image: item.image
      }));

      // Create order
      const orderData = {
        items: orderItems,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phoneNumber: shippingAddress.phone,
          address: shippingAddress.address,
          district: shippingAddress.district,
          province: shippingAddress.province,
          postalCode: shippingAddress.postalCode,
        },
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        discount: discount,
        total: total,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        // Store order details
        setOrderNumber(result.data.order.orderNumber);
        setOrderTotal(total);

        // Clear cart and selected items
        displayItems.forEach(item => removeFromCart(item.id));
        clearSelectedItems();

        // Create Coin Transaction
        if (paymentMethod === 'coin_payment') {
          await refreshUser();
        }

        // Show success modal
        setShowSuccessModal(true);
      } else {
        showErrorToast(`เกิดข้อผิดพลาด: ${result.message || 'ไม่สามารถสร้างคำสั่งซื้อได้'}`);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      showErrorToast(`เกิดข้อผิดพลาด: ${error.message || 'ไม่สามารถสร้างคำสั่งซื้อได้'}`);
    }
  };

  return (
    <>
      <Navbar showBanner={false} showPromotion={false} />
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 overflow-x-auto pb-2">
            <div className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${currentStep >= 1 ? "bg-red-600" : "bg-gray-300"
                    } text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base cursor-pointer`}
                  onClick={() => setCurrentStep(1)}
                >
                  1
                </div>
                <span
                  className={`ml-1.5 sm:ml-2 font-semibold text-xs sm:text-sm ${currentStep >= 1 ? "text-red-600" : "text-gray-400"
                    }`}
                >
                  ตะกร้าสินค้า
                </span>
              </div>
              <div
                className={`w-10 sm:w-16 lg:w-20 h-1 ${currentStep >= 2 ? "bg-red-600" : "bg-gray-300"
                  } mx-2 sm:mx-4`}
              ></div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${currentStep >= 2 ? "bg-red-600" : "bg-gray-300"
                    } text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base cursor-pointer`}
                  onClick={() => currentStep >= 2 && setCurrentStep(2)}
                >
                  2
                </div>
                <span
                  className={`ml-1.5 sm:ml-2 text-xs sm:text-sm ${currentStep >= 2
                    ? "text-red-600 font-semibold"
                    : "text-gray-400"
                    }`}
                >
                  รายละเอียด
                </span>
              </div>
              <div
                className={`w-10 sm:w-16 lg:w-20 h-1 ${currentStep >= 3 ? "bg-red-600" : "bg-gray-300"
                  } mx-2 sm:mx-4`}
              ></div>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${currentStep >= 3 ? "bg-red-600" : "bg-gray-300"
                    } text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base cursor-pointer`}
                  onClick={() => currentStep >= 3 && setCurrentStep(3)}
                >
                  3
                </div>
                <span
                  className={`ml-1.5 sm:ml-2 text-xs sm:text-sm ${currentStep >= 3
                    ? "text-red-600 font-semibold"
                    : "text-gray-400"
                    }`}
                >
                  ชำระเงิน
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Side - Cart Items / Shipping / Payment */}
            <div className="lg:col-span-2">
              {/* Step 1: Cart Items */}
              {currentStep === 1 && (
                <>
                  {/* Selected Items Info */}
                  {selectedItemIds.length > 0 && cart.length > 0 && (
                    <div className="bg-white border rounded-lg p-4 mb-4">
                      <p className="text-black font-medium">
                        แสดงสินค้าที่เลือก: {displayItems.length} จาก{" "}
                        {cart.length} รายการ
                      </p>
                    </div>
                  )}

                  {displayItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-6 sm:p-12 text-center">
                      <p className="text-gray-500 text-base sm:text-xl mb-4">
                        {cart.length > 0
                          ? "กรุณาเลือกสินค้าที่ต้องการสั่งซื้อ"
                          : "ตะกร้าสินค้าว่างเปล่า"}
                      </p>
                      <button
                        onClick={() => router.push("/")}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                      >
                        เริ่มช็อปปิ้ง
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow">
                      {displayItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="flex gap-3 sm:gap-4 lg:gap-6">
                            {/* Product Image */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <Image
                                src={getImageUrl(item.image) || "/placeholder-product.jpg"}
                                alt={item.name}
                                width={128}
                                height={128}
                                className="object-contain"
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base lg:text-lg font-medium text-gray-800 mb-1 sm:mb-2 line-clamp-2">
                                {item.name}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2 sm:mb-4">
                                <span className="text-red-600 font-bold text-base sm:text-lg lg:text-xl">
                                  {Number(item.price).toLocaleString()} coins
                                </span>
                                {item.oldPrice && (
                                  <span className="text-gray-400 text-xs sm:text-sm line-through">
                                    {Number(item.oldPrice).toLocaleString()} coins
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
                                    className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 hover:bg-gray-100 transition-colors"
                                  >
                                    <FaMinus
                                      size={12}
                                      className="text-gray-600 sm:w-3.5 sm:h-3.5"
                                    />
                                  </button>
                                  <span className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 font-bold text-sm sm:text-base lg:text-lg border-x-2 border-gray-300 text-gray-800">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.id, item.quantity + 1)
                                    }
                                    className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 hover:bg-gray-100 transition-colors"
                                  >
                                    <FaPlus size={12} className="text-gray-600 sm:w-3.5 sm:h-3.5" />
                                  </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={() => handleRemoveFromCart(item.id, item.name)}
                                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <FaTrash size={14} className="sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Clear Cart Button */}
                      <div className="p-6 bg-gray-50 flex justify-between items-center">
                        <button
                          onClick={handleClearCart}
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
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <FaMapMarkerAlt className="text-red-600 text-lg sm:text-xl" />
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                      เลือกที่อยู่สำหรับจัดส่ง
                    </h2>
                  </div>

                  {/* Saved Addresses */}
                  {loadingAddresses ? (
                    <div className="text-center py-8 text-gray-500">
                      กำลังโหลดที่อยู่...
                    </div>
                  ) : savedAddresses.length > 0 ? (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-black">ที่อยู่ที่บันทึกไว้</h3>
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr._id}
                            onClick={() => addr._id && handleSelectAddress(addr._id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAddressId === addr._id
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-gray-800">
                                    {addr.fullName}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                                      ค่าเริ่มต้น
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{addr.phoneNumber || addr.phone}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {addr.address}, {addr.district}, {addr.province} {addr.postalCode}
                                </p>
                              </div>
                              {selectedAddressId === addr._id && (
                                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                        <button
                          onClick={() => {
                            if (!selectedAddressId) {
                              const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                              if (defaultAddr && defaultAddr._id) {
                                handleSelectAddress(defaultAddr._id);
                              }
                            } else {
                              setSelectedAddressId("");
                              setShippingAddress({
                                fullName: "",
                                phone: "",
                                address: "",
                                province: "",
                                district: "",
                                subdistrict: "",
                                postalCode: "",
                              });
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                            !selectedAddressId 
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          {!selectedAddressId ? (
                            <>
                              <FaMinus size={12} /> ยกเลิก
                            </>
                          ) : (
                            <>
                              <FaPlus size={12} /> เพิ่มที่อยู่ใหม่
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
                      ไม่พบที่อยู่ที่บันทึกไว้ กรุณากรอกที่อยู่ใหม่
                    </div>
                  )}

                  {/* Address Form - Show when no address selected or using new address */}
                  {(!selectedAddressId || savedAddresses.length === 0) && (
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

                      {/* Save Address Button - Show when using new address */}
                      {!selectedAddressId && (
                        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                          <button
                            onClick={async () => {
                              try {
                                if (
                                  !shippingAddress.fullName ||
                                  !shippingAddress.phone ||
                                  !shippingAddress.address ||
                                  !shippingAddress.district ||
                                  !shippingAddress.province ||
                                  !shippingAddress.postalCode
                                ) {
                                  showErrorToast("กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วนก่อนบันทึก");
                                  return;
                                }

                                await addressAPI.addAddress({
                                  fullName: shippingAddress.fullName,
                                  phoneNumber: shippingAddress.phone,
                                  address: shippingAddress.address,
                                  district: shippingAddress.district,
                                  province: shippingAddress.province,
                                  postalCode: shippingAddress.postalCode,
                                  isDefault: savedAddresses.length === 0,
                                });

                                showSuccessToast("บันทึกที่อยู่สำเร็จ!");
                                fetchSavedAddresses();
                              } catch (error: any) {
                                showErrorToast(error.message || "เกิดข้อผิดพลาดในการบันทึกที่อยู่");
                              }
                            }}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
                          >
                            <FaMapMarkerAlt /> บันทึกที่อยู่ใหม่
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                              src={item.image || "/placeholder-product.jpg"}
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
                              {(Number(item.price) * item.quantity).toLocaleString()} coins
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
                      {/* Coin Payment */}
                      <label
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "coin_payment"
                          ? "border-yellow-500 bg-yellow-50 shadow-md"
                          : "border-gray-300 hover:border-yellow-300 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="coin_payment"
                          checked={paymentMethod === "coin_payment"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-yellow-600 cursor-pointer"
                        />
                        <div className="ml-4 flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                              <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">฿</text>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-800 text-lg">
                                จ่ายผ่านสมดุลโปรไฟล์ (Coin)
                              </span>
                              <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-200">
                                <span className="text-sm text-yellow-800 font-medium">ยอดคงเหลือ:</span>
                                <span className="text-yellow-700 font-bold">{(user?.coins || 0).toLocaleString()}</span>
                                <span className="text-xs text-yellow-800">Coins</span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 mt-1 block">
                              ชำระเงินสะดวกรวดเร็วด้วย Coin ในระบบ
                            </span>
                            {paymentMethod === "coin_payment" && (user?.coins || 0) < total && (
                              <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                ยอด Coin ไม่เพียงพอ (ขาด {(total - (user?.coins || 0)).toLocaleString()} Coins)
                              </p>
                            )}
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
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 sticky top-[60px] sm:top-20 lg:top-24">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                    ยอดรวมทั้งหมด
                  </h2>

                  {/* Promo Code Input */}
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${appliedPromo
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
                      <span>{subtotal.toLocaleString()} coins</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>ส่วนลด ({appliedPromo}):</span>
                        <span>-{discount.toLocaleString()} coins</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3 sm:pt-4 mb-4 sm:mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-bold text-gray-800">
                        ยอดรวม
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-red-600">
                        {total.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })} coins
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      ยอดรวมทั้งหมด
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
                  <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                    {currentStep < 3 ? (
                      <button
                        onClick={handleNextStep}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm sm:text-base lg:text-lg"
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
                        disabled={!acceptTerms}
                        className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all font-bold text-sm sm:text-base lg:text-lg ${acceptTerms
                          ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer shadow-md hover:shadow-lg"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                          }`}
                      >
                        ยืนยันการสั่งซื้อ
                      </button>
                    )}

                    {currentStep > 1 && (
                      <button
                        onClick={handlePreviousStep}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-bold text-sm sm:text-base"
                      >
                        ย้อนกลับ
                      </button>
                    )}
                  </div>

                  {/* Service Information */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaShippingFast className="text-red-600" size={20} />
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
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaShoppingBag className="text-red-600" size={20} />
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
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaComments className="text-red-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          ดูแลลูกค้าทางออนไลน์
                        </p>
                        <p className="text-gray-600 text-xs">
                          เราดูแลลูกค้าทางออนไลน์ในเวลาทำการ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              {/* Success Icon */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">สั่งซื้อสำเร็จ!</h2>
                <p className="text-green-50">เลขที่คำสั่งซื้อ: {orderNumber}</p>
              </div>

              {/* Payment Details */}
              <div className="p-6">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                  <h3 className="font-bold text-green-900 text-lg mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    ชำระเงินสำเร็จ
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ช่องทางชำระเงิน:</span>
                      <span className="font-semibold text-gray-900">ระบบ Coin</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">สถานะ:</span>
                      <span className="font-semibold text-green-600">ชำระเงินเรียบร้อยแล้ว</span>
                    </div>
                    <div className="border-t border-green-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-semibold">ยอดที่ชำระ:</span>
                        <span className="text-2xl font-bold text-red-600">{orderTotal.toLocaleString()} coins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push('/orders');
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    คำสั่งซื้อของฉัน
                  </button>
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      router.push('/');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    กลับหน้าหลัก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insufficient Coins Modal */}
        {showInsufficientCoinsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden relative animate-fade-in-up">
              <div className="bg-red-500 p-6 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h3 className="text-xl font-bold text-white">ยอด Coin ไม่เพียงพอ</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-center mb-6">
                  กรุณาเติม Coin เพื่อดำเนินการชำระเงินต่อ
                  หรือเลือกช่องทางการชำระเงินอื่น
                </p>

                <div className="bg-gray-100 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">ยอดที่ต้องชำระ</span>
                    <span className="font-bold text-gray-800">{total.toLocaleString()} Coins</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">ยอดคงเหลือของคุณ</span>
                    <span className="font-bold text-green-600">{(user?.coins || 0).toLocaleString()} Coins</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                    <span className="text-sm font-semibold text-red-500">ยอดที่ขาด</span>
                    <span className="font-bold text-red-600">{(total - (user?.coins || 0)).toLocaleString()} Coins</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowInsufficientCoinsModal(false);
                    }}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shadow-md"
                  >
                    ปิดหน้าต่าง
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div >
      <Features />
      <Footer />
    </>
  );
};

export default CartPage;
