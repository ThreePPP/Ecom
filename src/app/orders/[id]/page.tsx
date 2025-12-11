"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { orderAPI } from "@/app/lib/api";
import Navbar from "@/app/component/Navbar/Navbar";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";
import Image from "next/image";

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
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
    };
    return methods[method] || method;
  };

  if (loading || loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">กำลังโหลด...</div>
      </div>
    );
  }

  if (!isAuthenticated || !order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBanner={false} showPromotion={false} />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Breadcrumb
          items={[
            { label: "คำสั่งซื้อของฉัน", href: "/orders" },
            { label: `คำสั่งซื้อ ${order.orderNumber}` },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            คำสั่งซื้อ: <span className="text-gray-900">{order.orderNumber}</span>
          </h1>
          <p className="text-gray-600">
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

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            สถานะคำสั่งซื้อ
          </h2>
          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                order.orderStatus
              )}`}
            >
              {getStatusText(order.orderStatus)}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                order.paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.paymentStatus === "paid"
                ? "ชำระเงินแล้ว"
                : "รอชำระเงิน"}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            รายการสินค้า
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <Image
                    src={item.image || "/placeholder-product.jpg"}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">
                    จำนวน: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    ฿{item.price.toLocaleString()} / ชิ้น
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            ที่อยู่จัดส่ง
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-900">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-gray-600 mt-1">
              {order.shippingAddress.phoneNumber}
            </p>
            <p className="text-gray-600 mt-1">
              {order.shippingAddress.address}
            </p>
            <p className="text-gray-600">
              {order.shippingAddress.district} {order.shippingAddress.province}{" "}
              {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Payment & Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            สรุปคำสั่งซื้อ
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>วิธีการชำระเงิน:</span>
              <span className="font-medium text-gray-900">
                {getPaymentMethodText(order.paymentMethod)}
              </span>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>ราคาสินค้า:</span>
                <span>฿{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ค่าจัดส่ง:</span>
                <span className="text-green-600">
                  {order.shippingFee === 0
                    ? "ฟรี"
                    : `฿${order.shippingFee.toLocaleString()}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>ส่วนลด:</span>
                  <span>-฿{order.discount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                ยอดรวมทั้งหมด:
              </span>
              <span className="text-2xl font-bold text-red-600">
                ฿{order.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.push("/orders")}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            ← กลับไปหน้าคำสั่งซื้อ
          </button>
        </div>
      </div>
    </div>
  );
}
