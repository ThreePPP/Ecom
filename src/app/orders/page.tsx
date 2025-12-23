"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { orderAPI } from "@/app/lib/api";
import Navbar from "@/app/component/Navbar/Navbar";
import Features from "@/app/component/main/Features/Features";
import Footer from "@/app/component/main/footer/footer";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: any[];
}

export default function OrdersPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
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

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar showBanner={false} showPromotion={false} />
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: 'หน้าแรก', href: '/' }, { label: 'คำสั่งซื้อของฉัน' }]} />

          <div className="mt-8 mb-10">
            <h1 className="text-3xl font-bold text-gray-900">
              คำสั่งซื้อของฉัน
            </h1>
            <p className="text-gray-500 mt-2">ตรวจสอบสถานะและประวัติการสั่งซื้อของคุณ</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีคำสั่งซื้อ</h3>
              <p className="text-gray-500 mb-8">เริ่มช้อปปิ้งสินค้าไอทีและคอมพิวเตอร์ประกอบที่คุณถูกใจ</p>
              <a
                href="/"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                เลือกซื้อสินค้า
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusStyle = getStatusColor(order.orderStatus);
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition-all duration-200 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                            คำสั่งซื้อ: {order.orderNumber}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                            {getStatusText(order.orderStatus)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(order.createdAt).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          สินค้า {order.items.length} รายการ
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">ยอดรวมทั้งหมด</p>
                          <div className="text-2xl font-bold text-gray-900">
                            {order.total.toLocaleString()} <span className="text-sm font-normal text-gray-600">coins</span>
                          </div>
                        </div>

                        <a
                          href={`/orders/${order._id}`}
                          className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium px-4 py-2 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          ดูรายละเอียด
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition-colors shadow-lg shadow-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับหน้าแรก
            </a>
          </div>
        </div>
      </div>
      <Features />
      <Footer />
    </>
  );
}
