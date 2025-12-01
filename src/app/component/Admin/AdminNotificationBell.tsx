'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaBell, FaCoins, FaShoppingCart, FaUser, FaBox, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { adminAPI } from '@/app/lib/api';

interface AdminNotification {
  _id: string;
  type: 'coin_redeem' | 'new_order' | 'low_stock' | 'new_user';
  title: string;
  message: string;
  data?: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    amount?: number;
    orderId?: string;
    productId?: string;
  };
  isRead: boolean;
  createdAt: string;
}

const AdminNotificationBell: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    // Polling every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications(1, 10);
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await adminAPI.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await adminAPI.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'coin_redeem':
        return <FaCoins className="text-yellow-500" />;
      case 'new_order':
        return <FaShoppingCart className="text-green-500" />;
      case 'low_stock':
        return <FaBox className="text-red-500" />;
      case 'new_user':
        return <FaUser className="text-blue-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'เมื่อกี้';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return date.toLocaleDateString('th-TH');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <FaBell />
              การแจ้งเตือน
              {unreadCount > 0 && (
                <span className="bg-white text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} ใหม่
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs hover:underline flex items-center gap-1"
              >
                <FaCheck size={10} />
                อ่านทั้งหมด
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaBell className="mx-auto text-4xl mb-2 text-gray-300" />
                <p>ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-orange-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        )}
                      </div>
                      
                      {/* Customer Info */}
                      {notification.data?.userName && (
                        <div className="mt-1 p-2 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {notification.data.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-900">
                                {notification.data.userName}
                              </p>
                              {notification.data.userEmail && (
                                <p className="text-xs text-blue-600">{notification.data.userEmail}</p>
                              )}
                            </div>
                            {notification.data.userId && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!notification.isRead) {
                                    handleMarkAsRead(notification._id);
                                  }
                                  setIsOpen(false);
                                  router.push(`/admin/users?highlight=${notification.data?.userId}`);
                                }}
                                className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                <FaExternalLinkAlt size={10} />
                                ดูข้อมูล
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                      
                      {notification.data?.amount && notification.type === 'coin_redeem' && (
                        <p className="text-xs text-yellow-600 font-semibold mt-1">
                          💰 แลกไป {notification.data.amount.toLocaleString()} coins
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                      
                      {/* Mark as read button */}
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                        >
                          <FaCheck size={10} />
                          ทำเครื่องหมายว่าอ่านแล้ว
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <a
                href="/admin/notifications"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                ดูการแจ้งเตือนทั้งหมด →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotificationBell;
