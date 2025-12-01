'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { coinAPI } from '../lib/api';
import Navbar from '../component/Navbar/Navbar';
import Breadcrumb from '../component/Breadcrumb/Breadcrumb';

interface CoinTransaction {
  _id: string;
  referenceNumber: string;
  type: 'earn' | 'spend' | 'topup';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export default function CoinsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    totalSpent: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      fetchCoinData();
    }
  }, [isAuthenticated, authLoading, router, currentPage]);

  const fetchCoinData = async () => {
    try {
      setLoading(true);

      // Fetch transactions and summary in parallel
      const [transactionsRes, summaryRes] = await Promise.all([
        coinAPI.getTransactions(currentPage, 10),
        coinAPI.getSummary(),
      ]);

      if (transactionsRes.success) {
        setTransactions(transactionsRes.data.transactions);
        setCurrentBalance(transactionsRes.data.currentBalance);
        setTotalPages(transactionsRes.data.pagination.totalPages);
      }

      if (summaryRes.success) {
        setSummary({
          totalEarned: summaryRes.data.totalEarned,
          totalSpent: summaryRes.data.totalSpent,
        });
        setCurrentBalance(summaryRes.data.currentBalance);
      }
    } catch (error) {
      console.error('Error fetching coin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'earn':
        return { label: 'ได้รับ', color: 'text-green-600', bg: 'bg-green-100' };
      case 'topup':
        return { label: 'เติมเงิน', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'spend':
        return { label: 'ใช้จ่าย', color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { label: type, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar showBanner={false} showPromotion={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar showBanner={false} showPromotion={false} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'หน้าแรก', href: '/' }, { label: 'FavorPC Coins' }]} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
              <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400e">
                ฿
              </text>
            </svg>
            FavorPC Coins
          </h1>
          <p className="text-gray-600 mt-2">จัดการคอยน์ของคุณและดูประวัติการทำรายการ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Balance & Bank Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="9" fill="white" />
                    <text x="10" y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#d97706">
                      ฿
                    </text>
                  </svg>
                </div>
                <div>
                  <p className="text-white/80 text-sm">ยอดคอยน์คงเหลือ</p>
                  <p className="text-3xl font-bold">{currentBalance.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
                <div>
                  <p className="text-white/70 text-xs">สะสมทั้งหมด</p>
                  <p className="text-lg font-semibold text-green-200">+{summary.totalEarned.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">ใช้ไปทั้งหมด</p>
                  <p className="text-lg font-semibold text-red-200">-{summary.totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Bank Information Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  ข้อมูลการชำระเงิน
                </h2>
                <p className="text-blue-100 text-sm mt-1">สำหรับเติมเงินหรือชำระค่าสินค้า</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">ชื่อบัญชี</span>
                  <span className="font-semibold text-gray-900">FavorPC</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-500">ธนาคาร</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">K</span>
                    </div>
                    <span className="font-semibold text-gray-900">กสิกรไทย</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-500">เลขที่บัญชี</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600 text-lg">123-4-56789-0</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('1234567890');
                        alert('คัดลอกเลขบัญชีแล้ว!');
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="คัดลอก"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>หลังโอนเงินแล้ว กรุณาแจ้งหลักฐานการโอนที่หน้าคำสั่งซื้อ หรือติดต่อ Admin</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/orders')}
                className="flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                คำสั่งซื้อ
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center justify-center gap-2 px-4 py-4 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                หน้าหลัก
              </button>
            </div>
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  ประวัติการทำรายการ
                </h2>
              </div>

              {transactions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">ยังไม่มีประวัติการทำรายการ</p>
                  <p className="text-gray-400 text-sm mt-2">รายการคอยน์จะแสดงที่นี่</p>
                </div>
              ) : (
                <>
                  {/* Transaction Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            No.
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            เลขที่อ้างอิง
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            วันที่ทำรายการ
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            ประเภท
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            จำนวนคอยน์
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transactions.map((transaction, index) => {
                          const typeInfo = getTransactionTypeLabel(transaction.type);
                          return (
                            <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-medium text-gray-500">
                                  {(currentPage - 1) * 10 + index + 1}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-mono text-gray-900">{transaction.referenceNumber}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${typeInfo.bg} ${typeInfo.color}`}>
                                  {typeInfo.label}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span
                                  className={`text-sm font-bold ${
                                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {transaction.amount >= 0 ? '+' : ''}
                                  {transaction.amount.toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ก่อนหน้า
                      </button>
                      <span className="text-sm text-gray-600">
                        หน้า {currentPage} จาก {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ถัดไป
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
