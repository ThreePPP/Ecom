"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { orderAPI } from "@/app/lib/api";
import Navbar from "@/app/component/Navbar/Navbar";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";
import Image from "next/image";
import Features from "@/app/component/main/Features/Features";
import Footer from "@/app/component/main/footer/footer";

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    address: string;
    district: string;
    province: string;
    postalCode: string;
  };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchOrder();
    }
  }, [isAuthenticated, params.id]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrderById(params.id as string);
      if (response.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
    } finally {
      setLoadingOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
      processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      shipped: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      delivered: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    };
    return colors[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: "รอดำเนินการ",
      processing: "กำลังดำเนินการ",
      shipped: "จัดส่งแล้ว",
      delivered: "สำเร็จ",
      cancelled: "ยกเลิก",
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methods: Record<string, string> = {
      "credit-card": "บัตรเครดิต/เดบิต",
      installment: "ผ่อนชำระ 0%",
      "mobile-banking": "โมบายแบงก์กิ้ง",
      "internet-banking": "อินเทอร์เน็ตแบงก์กิ้ง",
      promptpay: "พร้อมเพย์",
      truemoney: "ทรูมันนี่ วอลเล็ท",
      linepay: "ไลน์เพย์",
      cod: "เก็บเงินปลายทาง",
      "coin_payment": "ชำระด้วย Coin",
    };
    return methods[method] || method;
  };

  if (loading || loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !order) {
    return null;
  }

  const statusStyle = getStatusColor(order.orderStatus);

  return (
    <>
      <Navbar showBanner={false} showPromotion={false} />
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: "หน้าแรก", href: "/" },
              { label: "คำสั่งซื้อของฉัน", href: "/orders" },
              { label: order.orderNumber },
            ]}
          />

          <div className="mt-8 mb-8 flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-gray-400 font-light text-2xl">#</span>
                {order.orderNumber}
              </h1>
              <p className="text-gray-500 mt-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                สั่งซื้อเมื่อ:{" "}
                {new Date(order.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2 self-start md:self-center ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.text.replace('text-', 'bg-')}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusStyle.text.replace('text-', 'bg-')}`}></span>
              </span>
              {getStatusText(order.orderStatus)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    รายการสินค้า
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                          <Image
                            src={item.image || "/placeholder-product.jpg"}
                            alt={item.name}
                            width={100}
                            height={100}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{item.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              จำนวน: <span className="text-gray-900 font-medium">{item.quantity}</span> ชิ้น
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-500">ราคาต่อชิ้น</p>
                            <p className="font-bold text-gray-900">
                              {item.price.toLocaleString()} coins
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ที่อยู่จัดส่ง
                  </h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-lg text-gray-900">{order.shippingAddress.fullName}</p>
                    <p className="text-gray-600">{order.shippingAddress.phoneNumber}</p>
                    <hr className="my-3 border-gray-100" />
                    <p className="text-gray-700 leading-relaxed">
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.district} {order.shippingAddress.province} {order.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    สรุปยอดชำระ
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>วิธีการชำระเงิน</span>
                      <span className="font-medium text-gray-900 text-right">
                        {getPaymentMethodText(order.paymentMethod)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>สถานะการชำระเงิน</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {order.paymentStatus === "paid" ? "ชำระเงินแล้ว" : "รอชำระเงิน"}
                      </span>
                    </div>
                  </div>

                  <hr className="border-dashed border-gray-200" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>ยอดรวมสินค้า</span>
                      <span>{order.subtotal.toLocaleString()} coins</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ค่าจัดส่ง</span>
                      <span className="text-green-600">
                        {order.shippingFee === 0 ? "ฟรี" : `${order.shippingFee.toLocaleString()} coins`}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>ส่วนลด</span>
                        <span>-{order.discount.toLocaleString()} coins</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-200" />

                  <div className="flex justify-between items-end">
                    <span className="text-gray-900 font-bold">ยอดสุทธิ</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {order.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">coins</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => router.push("/orders")}
                    className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับหน้ารายการ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Features />
      <Footer />
    </>
  );
}
