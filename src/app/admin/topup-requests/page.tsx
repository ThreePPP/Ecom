'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { coinAPI } from '../../lib/api';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';
import { useToast } from '@/app/component/Toast/Toast';
import { FaCheck, FaTimes, FaMoneyBillWave, FaExternalLinkAlt, FaUser, FaCalendar, FaImage } from 'react-icons/fa';

interface TopupRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  amount: number;
  receiptImage: string;
  username: string;
  note?: string;
  status: 'pending' | 'approved' | 'rejected';
  processedAt?: string;
  processedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  adminNote?: string;
  createdAt: string;
}

export default function AdminTopupRequestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
      </div>
    }>
      <TopupRequestsContent />
    </Suspense>
  );
}

function TopupRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, loading: authLoading } = useAuth();
  const { showSuccessToast, showErrorToast } = useToast();
  const [requests, setRequests] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<TopupRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Handle request selection from URL
  const requestIdFromQuery = searchParams.get('requestId');
  const actionFromQuery = searchParams.get('action');

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (requestIdFromQuery && requests.length > 0) {
      const request = requests.find(r => r._id === requestIdFromQuery);
      if (request) {
        setSelectedRequest(request);
        if (actionFromQuery === 'approve') {
          handleApprove(request._id);
        } else if (actionFromQuery === 'reject') {
          setShowRejectModal(true);
        }
      }
    }
  }, [requestIdFromQuery, requests, actionFromQuery]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await coinAPI.getAllTopupRequests(1, 100);

      if (response.success) {
        setRequests(response.data.topupRequests || []);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('ยืนยันอนุมัติคำขอเติมเงินนี้?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await coinAPI.approveTopupRequest(requestId);

      if (response.success) {
        showSuccessToast('อนุมัติคำขอสำเร็จ! เหรียญถูกเพิ่มให้ผู้ใช้แล้ว');
        fetchRequests();
        setSelectedRequest(null);
      }
    } catch (err: any) {
      showErrorToast(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(true);
      const response = await coinAPI.rejectTopupRequest(requestId, rejectReason);

      if (response.success) {
        showSuccessToast('ปฏิเสธคำขอสำเร็จ');
        fetchRequests();
        setSelectedRequest(null);
        setShowRejectModal(false);
        setRejectReason('');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอตรวจสอบ';
      case 'approved':
        return 'อนุมัติแล้ว';
      case 'rejected':
        return 'ปฏิเสธ';
      default:
        return status;
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

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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
            { label: 'คำขอเติมเงิน' }
          ]} />
          <div className="flex items-center gap-3 mt-4">
            <div className="p-3 bg-green-500 rounded-xl text-white">
              <FaMoneyBillWave size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการคำขอเติมเงิน</h1>
              <p className="text-gray-600 mt-1">ตรวจสอบและอนุมัติคำขอเติม Coins</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">คำขอทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow p-5 border border-yellow-100">
            <p className="text-sm text-yellow-600">รอตรวจสอบ</p>
            <p className="text-2xl font-bold text-yellow-700">
              {requests.filter(r => r.status === 'pending').length}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl shadow p-5 border border-green-100">
            <p className="text-sm text-green-600">อนุมัติแล้ว</p>
            <p className="text-2xl font-bold text-green-700">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl shadow p-5 border border-red-100">
            <p className="text-sm text-red-600">ปฏิเสธ</p>
            <p className="text-2xl font-bold text-red-700">
              {requests.filter(r => r.status === 'rejected').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'all'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              ทั้งหมด ({requests.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              รอตรวจสอบ ({requests.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'approved'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              อนุมัติแล้ว ({requests.filter(r => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-lg font-medium ${filterStatus === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              ปฏิเสธ ({requests.filter(r => r.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้ขอ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จำนวนเงิน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อผู้โอน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่ขอ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      ไม่พบคำขอเติมเงิน
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request._id} className={`hover:bg-gray-50 ${request.status === 'pending' ? 'bg-yellow-50/50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {request.userId ? `${request.userId.firstName} ${request.userId.lastName}` : 'ผู้ใช้ที่ถูกลบ'}
                            </div>
                            <div className="text-sm text-gray-500">{request.userId?.email || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-green-600">
                          ฿{request.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            รายละเอียด
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(request._id)}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                อนุมัติ
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectModal(true);
                                }}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                ปฏิเสธ
                              </button>
                            </>
                          )}
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
          แสดง {filteredRequests.length} จาก {requests.length} คำขอ
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && !showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaMoneyBillWave className="text-green-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">รายละเอียดคำขอเติมเงิน</h2>
                  <p className="text-sm text-gray-500">#{selectedRequest._id.slice(-8)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount & Status */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div>
                  <p className="text-sm text-green-600">จำนวนเงิน</p>
                  <p className="text-3xl font-bold text-green-700">฿{selectedRequest.amount.toLocaleString()}</p>
                </div>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusText(selectedRequest.status)}
                </span>
              </div>

              {/* User Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FaUser className="text-gray-400" />
                  <h3 className="font-semibold text-gray-900">ข้อมูลผู้ขอ</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">ชื่อ-นามสกุล</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.userId ? `${selectedRequest.userId.firstName} ${selectedRequest.userId.lastName}` : 'ผู้ใช้ที่ถูกลบ'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">อีเมล</p>
                    <p className="font-medium text-gray-900">{selectedRequest.userId?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ชื่อผู้โอน</p>
                    <p className="font-medium text-gray-900">{selectedRequest.username}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">วันที่ขอ</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>
                {selectedRequest.note && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-gray-500 text-sm">หมายเหตุ</p>
                    <p className="text-gray-900">{selectedRequest.note}</p>
                  </div>
                )}
              </div>

              {/* Receipt Image */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <FaImage className="text-gray-400" />
                  <h3 className="font-semibold text-gray-900">ใบเสร็จหลักฐาน</h3>
                </div>
                <div className="relative">
                  <img
                    src={selectedRequest.receiptImage}
                    alt="Receipt"
                    className="w-full max-h-96 object-contain rounded-lg border bg-white"
                  />
                  <a
                    href={selectedRequest.receiptImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur rounded-lg text-blue-600 hover:bg-white transition-colors"
                  >
                    <FaExternalLinkAlt size={14} />
                  </a>
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedRequest.status === 'rejected' && selectedRequest.adminNote && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm text-red-600 font-semibold">เหตุผลที่ปฏิเสธ</p>
                  <p className="text-red-800 mt-1">{selectedRequest.adminNote}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {selectedRequest.status === 'pending' && (
              <div className="sticky bottom-0 z-10 p-4 bg-white border-t flex gap-3">
                <button
                  onClick={() => handleApprove(selectedRequest._id)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium transition-colors disabled:opacity-50"
                >
                  <FaCheck />
                  {actionLoading ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium transition-colors disabled:opacity-50"
                >
                  <FaTimes />
                  ปฏิเสธ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">ปฏิเสธคำขอเติมเงิน</h2>
              <p className="text-sm text-gray-500 mt-1">
                ยอด ฿{selectedRequest.amount.toLocaleString()} จาก {selectedRequest.userId?.firstName || 'ผู้ใช้'}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เหตุผลที่ปฏิเสธ (ไม่บังคับ)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุเหตุผล..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleReject(selectedRequest._id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium disabled:opacity-50"
              >
                {actionLoading ? 'กำลังดำเนินการ...' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
