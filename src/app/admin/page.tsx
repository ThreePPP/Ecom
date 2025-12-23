"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";
import AdminNotificationBell from "@/app/component/Admin/AdminNotificationBell";
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartLine,
  FaClipboardList,
  FaCog,
  FaHome
} from "react-icons/fa";

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  user: {
    firstName: string;
    lastName: string;
  };
  total: number;
  orderStatus: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/");
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch stats from admin API
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const statsData = await statsResponse.json();

      // Fetch recent orders
      const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const ordersData = await ordersResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (ordersData.success) {
        const orders = ordersData.data.orders.slice(0, 5);
        setRecentOrders(orders);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">กำลังโหลด...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: 'Admin Dashboard' }]} theme="white" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100 mt-1">ยินดีต้อนรับ, {user?.firstName}</p>
            </div>
            <div className="flex items-center gap-4">
              <AdminNotificationBell />
              <a
                href="/"
                className="flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 font-semibold"
              >
                <FaHome />
                กลับหน้าแรก
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ผู้ใช้ทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">สินค้าทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaBox className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">คำสั่งซื้อทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalOrders}
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  รอดำเนินการ: {stats.pendingOrders}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaShoppingCart className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">ยอดขายรวม</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalRevenue.toLocaleString()} coins
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FaMoneyBillWave className="text-yellow-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <a
            href="/admin/products"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaBox className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">จัดการสินค้า</h3>
                <p className="text-sm text-gray-500">เพิ่ม แก้ไข ลบสินค้า</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/orders"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaClipboardList className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">จัดการคำสั่งซื้อ</h3>
                <p className="text-sm text-gray-500">ดูและอัพเดทสถานะ</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaUsers className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">จัดการผู้ใช้</h3>
                <p className="text-sm text-gray-500">ดูรายชื่อผู้ใช้</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/images"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <span className="text-yellow-600 text-xl">🖼️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ตรวจสอบรูปภาพ</h3>
                <p className="text-sm text-gray-500">ตรวจสอบและลบรูปที่เสีย</p>
              </div>
            </div>
          </a>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              คำสั่งซื้อล่าสุด
            </h2>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                ยังไม่มีคำสั่งซื้อ
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      เลขที่คำสั่งซื้อ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ลูกค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ยอดรวม
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      วันที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.user.firstName} {order.user.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.total.toLocaleString()} coins
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {getStatusText(order.orderStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={`/admin/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          ดูรายละเอียด
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
