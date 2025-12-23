'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../lib/api';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';

interface Order {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    product: {
      name: string;
      price: number;
      image: string;
    };
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    address: string;
    district: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentStatus: string;
  paidAt?: string;
  orderStatus: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin, authLoading, router]);

  // Handle order selection from URL
  const searchParams = useSearchParams();
  const orderIdFromQuery = searchParams.get('orderId');

  useEffect(() => {
    if (orderIdFromQuery && orders.length > 0) {
      const order = orders.find(o => o._id === orderIdFromQuery);
      if (order) {
        setSelectedOrder(order);
      }
    }
  }, [orderIdFromQuery, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getAllOrders();

      if (response.success) {
        setOrders(response.data.orders);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`ต้องการเปลี่ยนสถานะเป็น "${getStatusText(newStatus)}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const response = await orderAPI.updateOrderStatus(orderId, newStatus);

      if (response.success) {
        alert('อัพเดทสถานะสำเร็จ');
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`ต้องการลบคำสั่งซื้อนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      return;
    }

    try {
      const response = await orderAPI.deleteOrder(orderId);

      if (response.success) {
        alert('ลบคำสั่งซื้อสำเร็จ');
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบคำสั่งซื้อ');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'processing':
        return 'กำลังดำเนินการ';
      case 'shipped':
        return 'จัดส่งแล้ว';
      case 'delivered':
        return 'สำเร็จ';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.orderStatus === filterStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: 'Admin', href: '/admin' },
            { label: 'จัดการคำสั่งซื้อ' }
          ]} />
          <h1 className="text-3xl font-bold text-gray-900">จัดการคำสั่งซื้อ</h1>
          <p className="text-gray-600 mt-2">จัดการและติดตามคำสั่งซื้อทั้งหมด</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              ทั้งหมด ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'pending'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              รอดำเนินการ ({orders.filter(o => o.orderStatus === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('processing')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'processing'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              กำลังดำเนินการ ({orders.filter(o => o.orderStatus === 'processing').length})
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'shipped'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              จัดส่งแล้ว ({orders.filter(o => o.orderStatus === 'shipped').length})
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'delivered'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              สำเร็จ ({orders.filter(o => o.orderStatus === 'delivered').length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    รหัสคำสั่งซื้อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ลูกค้า
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ยอดรวม
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การชำระเงิน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      ไม่พบคำสั่งซื้อ
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user.firstName} {order.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {order.total.toLocaleString()} coins
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.items.length} รายการ
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {order.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                          {getStatusText(order.orderStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            รายละเอียด
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 text-sm text-gray-600">
          แสดง {filteredOrders.length} จาก {orders.length} คำสั่งซื้อ
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all duration-300">
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 animate-in fade-in zoom-in-95 duration-200"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-gray-100/50 bg-white/60 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  คำสั่งซื้อ #{selectedOrder._id.slice(-8)}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${selectedOrder.orderStatus === 'delivered' ? 'bg-green-500' :
                      selectedOrder.orderStatus === 'cancelled' ? 'bg-red-500' :
                        'bg-orange-500'
                    }`} />
                  <p className="text-sm text-gray-500">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Customer & Shipping Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/50 border border-white/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">ข้อมูลลูกค้า</h3>
                  </div>
                  <div className="space-y-1 ml-11">
                    <p className="text-gray-900 font-medium">
                      {selectedOrder.user.firstName} {selectedOrder.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/50 border border-white/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">ที่อยู่จัดส่ง</h3>
                  </div>
                  <div className="space-y-1 ml-11">
                    <p className="text-gray-900 font-medium">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-sm text-gray-500">{selectedOrder.shippingAddress.phoneNumber}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedOrder.shippingAddress.address}<br />
                      {selectedOrder.shippingAddress.district} {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.postalCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">รายการสินค้า</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-xl bg-white/40 border border-white/60 hover:bg-white/60 transition-colors">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-gray-900 font-medium line-clamp-2">{item.product.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-500">จำนวน: {item.quantity}</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-orange-600 font-semibold">
                            {item.price.toLocaleString()} coins
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center px-4 text-right">
                        <p className="font-bold text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} <span className="text-xs font-normal text-gray-500">coins</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100/50">
                {/* Status Update */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">อัพเดทสถานะ</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'processing', label: 'กำลังดำเนินการ', color: 'blue' },
                      { value: 'shipped', label: 'จัดส่งแล้ว', color: 'purple' },
                      { value: 'delivered', label: 'สำเร็จ', color: 'green' },
                      { value: 'cancelled', label: 'ยกเลิก', color: 'red' }
                    ].map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleUpdateStatus(selectedOrder._id, status.value)}
                        disabled={
                          selectedOrder.orderStatus === status.value ||
                          selectedOrder.orderStatus === 'delivered' ||
                          (selectedOrder.orderStatus === 'cancelled' && status.value !== 'cancelled')
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform active:scale-95 ${selectedOrder.orderStatus === status.value
                            ? `bg-${status.color}-100 text-${status.color}-700 ring-2 ring-${status.color}-500 ring-offset-2 ring-offset-white/80`
                            : selectedOrder.orderStatus === 'delivered' || selectedOrder.orderStatus === 'cancelled'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : `bg-white border border-gray-200 text-gray-600 hover:bg-${status.color}-50 hover:text-${status.color}-600 hover:border-${status.color}-200`
                          }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/60 rounded-2xl p-6 border border-white/60 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">สรุปคำสั่งซื้อ</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>ราคาสินค้า</span>
                      <span>{selectedOrder.subtotal?.toLocaleString() ?? 0} coins</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>ค่าจัดส่ง</span>
                      <span>{selectedOrder.shippingFee?.toLocaleString() ?? 0} coins</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>วิธีชำระเงิน</span>
                      <span className="font-medium text-gray-900 uppercase">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">ยอดรวมทั้งหมด</span>
                      <span className="text-xl font-bold text-orange-600">
                        {selectedOrder.total.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500 ml-1">coins</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 p-6 bg-white/60 backdrop-blur-md border-t border-gray-100/50 flex gap-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                ปิด
              </button>
              <button
                onClick={() => handleDeleteOrder(selectedOrder._id)}
                className="flex-[0.3] px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 font-medium transition-colors"
              >
                ลบคำสั่งซื้อ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
