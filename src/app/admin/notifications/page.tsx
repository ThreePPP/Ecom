'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../lib/api';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';
import { useToast } from '@/app/component/Toast/Toast';
import { 
  FaBell, 
  FaCoins, 
  FaShoppingCart, 
  FaBox, 
  FaUser, 
  FaMoneyBillWave,
  FaCheck,
  FaExternalLinkAlt,
  FaTimes
} from 'react-icons/fa';

interface AdminNotification {
  _id: string;
  type: 'coin_redeem' | 'new_order' | 'low_stock' | 'new_user' | 'topup_request' | 'other';
  title: string;
  message: string;
  isRead: boolean;
  data?: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    orderId?: string;
    productId?: string;
    productName?: string;
    amount?: number;
    topupRequestId?: string;
    receiptImage?: string;
  };
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const { showSuccessToast, showErrorToast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchNotifications();
    }
  }, [isAdmin, authLoading, router, currentPage]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNotifications(currentPage, 50, false);

      if (response.success) {
        setNotifications(response.data.notifications || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (err: any) {
      showErrorToast(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await adminAPI.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err: any) {
      showErrorToast(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminAPI.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showSuccessToast('ทำเครื่องหมายว่าอ่านแล้วทั้งหมด');
    } catch (err: any) {
      showErrorToast(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'coin_redeem':
        return <FaCoins className="text-yellow-500" size={20} />;
      case 'new_order':
        return <FaShoppingCart className="text-green-500" size={20} />;
      case 'low_stock':
        return <FaBox className="text-red-500" size={20} />;
      case 'new_user':
        return <FaUser className="text-blue-500" size={20} />;
      case 'topup_request':
        return <FaMoneyBillWave className="text-green-600" size={20} />;
      default:
        return <FaBell className="text-gray-500" size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'coin_redeem':
        return 'แลก Coins';
      case 'new_order':
        return 'คำสั่งซื้อใหม่';
      case 'low_stock':
        return 'สินค้าใกล้หมด';
      case 'new_user':
        return 'สมาชิกใหม่';
      case 'topup_request':
        return 'คำขอเติมเงิน';
      default:
        return 'อื่นๆ';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterRead === 'unread' && n.isRead) return false;
    if (filterRead === 'read' && !n.isRead) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: 'Admin', href: '/admin' },
            { label: 'การแจ้งเตือนทั้งหมด' }
          ]} />
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-xl text-white">
                <FaBell size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">การแจ้งเตือนทั้งหมด</h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 ? `มี ${unreadCount} รายการยังไม่ได้อ่าน` : 'อ่านทั้งหมดแล้ว'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
              >
                <FaCheck className="inline mr-2" size={14} />
                อ่านทั้งหมด
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-500 mb-1">กรองตามประเภท</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="new_order">คำสั่งซื้อใหม่</option>
                <option value="topup_request">คำขอเติมเงิน</option>
                <option value="coin_redeem">แลก Coins</option>
                <option value="new_user">สมาชิกใหม่</option>
                <option value="low_stock">สินค้าใกล้หมด</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-500 mb-1">สถานะการอ่าน</label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="unread">ยังไม่ได้อ่าน</option>
                <option value="read">อ่านแล้ว</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FaBell size={48} className="mx-auto mb-4 opacity-30" />
              <p>ไม่พบการแจ้งเตือน</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-orange-50/50' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                          
                          {/* Action Buttons */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {notification.type === 'new_order' && notification.data?.orderId && (
                              <button
                                onClick={() => router.push(`/admin/orders?orderId=${notification.data?.orderId}`)}
                                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                              >
                                <FaExternalLinkAlt className="inline mr-1" size={10} />
                                ดูคำสั่งซื้อ
                              </button>
                            )}
                            {notification.type === 'topup_request' && notification.data?.topupRequestId && (
                              <>
                                {notification.data.receiptImage && (
                                  <a
                                    href={notification.data.receiptImage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                                  >
                                    <FaExternalLinkAlt className="inline mr-1" size={10} />
                                    ดูใบเสร็จ
                                  </a>
                                )}
                                <button
                                  onClick={() => router.push(`/admin/topup-requests?requestId=${notification.data?.topupRequestId}&action=approve`)}
                                  className="text-xs px-3 py-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                >
                                  <FaCheck className="inline mr-1" size={10} />
                                  อนุมัติ
                                </button>
                                <button
                                  onClick={() => router.push(`/admin/topup-requests?requestId=${notification.data?.topupRequestId}&action=reject`)}
                                  className="text-xs px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                  <FaTimes className="inline mr-1" size={10} />
                                  ปฏิเสธ
                                </button>
                              </>
                            )}
                            {notification.type === 'new_user' && notification.data?.userId && (
                              <button
                                onClick={() => router.push(`/admin/users?userId=${notification.data?.userId}`)}
                                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                              >
                                <FaExternalLinkAlt className="inline mr-1" size={10} />
                                ดูโปรไฟล์
                              </button>
                            )}
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400">{formatDate(notification.createdAt)}</p>
                          {notification.data?.amount && (
                            <p className="text-sm font-bold text-green-600 mt-1">
                              {notification.type === 'coin_redeem' ? '-' : '+'}฿{notification.data.amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium"
                        >
                          <FaCheck className="inline mr-1" size={10} />
                          ทำเครื่องหมายว่าอ่านแล้ว
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <span className="px-4 py-2">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
            >
              ถัดไป
            </button>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600 text-center">
          แสดง {filteredNotifications.length} จาก {notifications.length} การแจ้งเตือน
        </div>
      </div>
    </div>
  );
}
