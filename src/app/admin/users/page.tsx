'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, coinAPI } from '../../lib/api';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';
import { FaCoins, FaPlus, FaMinus } from 'react-icons/fa';

interface CoinStats {
  totalSpent: number;
  totalEarned: number;
  lastTransaction: {
    createdAt: string;
    type: 'earn' | 'spend' | 'topup';
    amount: number;
  } | null;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  coins: number;
  coinStats?: CoinStats;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightUserId = searchParams.get('highlight');
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const highlightedRef = useRef<HTMLTableRowElement>(null);

  // Add coins modal state
  const [showAddCoinsModal, setShowAddCoinsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [addCoinsAmount, setAddCoinsAmount] = useState('');
  const [addCoinsDescription, setAddCoinsDescription] = useState('');
  const [addingCoins, setAddingCoins] = useState(false);

  // Remove coins modal state
  const [showRemoveCoinsModal, setShowRemoveCoinsModal] = useState(false);
  const [removeCoinsAmount, setRemoveCoinsAmount] = useState('');
  const [removeCoinsDescription, setRemoveCoinsDescription] = useState('');
  const [removingCoins, setRemovingCoins] = useState(false);

  // Scroll to highlighted user
  useEffect(() => {
    if (highlightUserId && highlightedRef.current && !loading) {
      setTimeout(() => {
        highlightedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlightUserId, loading]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, authLoading, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllUsers();

      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'user' | 'admin') => {
    if (!confirm(`ต้องการเปลี่ยนสิทธิ์เป็น ${newRole === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'} ใช่หรือไม่?`)) {
      return;
    }

    try {
      const response = await adminAPI.updateUserRole(userId, newRole);

      if (response.success) {
        alert('เปลี่ยนสิทธิ์สำเร็จ');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`ต้องการลบผู้ใช้ "${userName}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      return;
    }

    try {
      const response = await adminAPI.deleteUser(userId);

      if (response.success) {
        alert('ลบผู้ใช้สำเร็จ');
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleOpenAddCoinsModal = (user: User) => {
    setSelectedUser(user);
    setAddCoinsAmount('');
    setAddCoinsDescription('');
    setShowAddCoinsModal(true);
  };

  const handleAddCoins = async () => {
    if (!selectedUser) return;

    const amount = parseInt(addCoinsAmount);
    if (!amount || amount <= 0) {
      alert('กรุณาระบุจำนวน coins ที่ถูกต้อง');
      return;
    }

    try {
      setAddingCoins(true);
      const response = await coinAPI.adminAddCoins({
        userId: selectedUser._id,
        amount,
        description: addCoinsDescription || undefined,
      });

      if (response.success) {
        alert(response.message || 'เพิ่ม coins สำเร็จ');
        setShowAddCoinsModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเพิ่ม coins');
    } finally {
      setAddingCoins(false);
    }
  };

  const handleOpenRemoveCoinsModal = (user: User) => {
    setSelectedUser(user);
    setRemoveCoinsAmount('');
    setRemoveCoinsDescription('');
    setShowRemoveCoinsModal(true);
  };

  const handleRemoveCoins = async () => {
    if (!selectedUser) return;

    const amount = parseInt(removeCoinsAmount);
    if (!amount || amount <= 0) {
      alert('กรุณาระบุจำนวน coins ที่ถูกต้อง');
      return;
    }

    if (amount > (selectedUser.coins || 0)) {
      alert(`ไม่สามารถหัก coins ได้เกินยอดปัจจุบัน (${(selectedUser.coins || 0).toLocaleString()} coins)`);
      return;
    }

    try {
      setRemovingCoins(true);
      const response = await coinAPI.adminRemoveCoins({
        userId: selectedUser._id,
        amount,
        description: removeCoinsDescription || undefined,
      });

      if (response.success) {
        alert(response.message || 'หัก coins สำเร็จ');
        setShowRemoveCoinsModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการหัก coins');
    } finally {
      setRemovingCoins(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRole = filterRole === 'all' || user.role === filterRole;

    return matchSearch && matchRole;
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
            { label: 'จัดการผู้ใช้' }
          ]} />
          <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้</h1>
          <p className="text-gray-600 mt-2">จัดการข้อมูลผู้ใช้และสิทธิ์การเข้าถึง</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ค้นหา
              </label>
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือ อีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทผู้ใช้
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'all' | 'user' | 'admin')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
              >
                <option value="all">ทั้งหมด</option>
                <option value="user">ผู้ใช้ทั่วไป</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้ใช้
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    อีเมล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    🪙 Coins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สิทธิ์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สมัคร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      ไม่พบข้อมูลผู้ใช้
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      ref={user._id === highlightUserId ? highlightedRef : null}
                      className={`hover:bg-gray-50 transition-all duration-500 ${user._id === highlightUserId
                        ? 'bg-yellow-100 ring-2 ring-yellow-400 ring-inset animate-pulse'
                        : ''
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${user._id === highlightUserId ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}>
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                              {user._id === highlightUserId && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                                  📍 ลูกค้าที่แจ้งเตือน
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.phoneNumber || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500 font-bold">{(user.coins || 0).toLocaleString()}</span>
                            <span className="text-xs text-gray-400">coins</span>
                            <button
                              onClick={() => handleOpenAddCoinsModal(user)}
                              className="p-1 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                              title="เพิ่ม coins"
                            >
                              <FaPlus size={10} />
                            </button>
                            <button
                              onClick={() => handleOpenRemoveCoinsModal(user)}
                              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                              title="หัก coins"
                              disabled={(user.coins || 0) <= 0}
                            >
                              <FaMinus size={10} />
                            </button>
                          </div>
                          {user.coinStats && (
                            <div className="text-xs space-y-0.5">
                              <div className="text-green-600">+{user.coinStats.totalEarned.toLocaleString()} สะสม</div>
                              <div className="text-red-600">-{user.coinStats.totalSpent.toLocaleString()} ใช้ไป</div>
                              {user.coinStats.lastTransaction && (
                                <div className="text-gray-400 text-[10px]">
                                  ล่าสุด: {new Date(user.coinStats.lastTransaction.createdAt).toLocaleDateString('th-TH')}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}>
                          {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {user.isVerified ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateRole(
                              user._id,
                              user.role === 'admin' ? 'user' : 'admin'
                            )}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            {user.role === 'admin' ? 'ลดสิทธิ์' : 'เพิ่มสิทธิ์'}
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
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
          แสดง {filteredUsers.length} จาก {users.length} ผู้ใช้
        </div>
      </div>

      {/* Add Coins Modal */}
      {showAddCoinsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaCoins className="text-white text-xl" />
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-bold">เพิ่ม Coins</h3>
                  <p className="text-sm opacity-90">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Current Balance */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-gray-600">ยอด Coins ปัจจุบัน</span>
                <span className="text-2xl font-bold text-yellow-500">
                  {(selectedUser.coins || 0).toLocaleString()}
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวน Coins ที่ต้องการเพิ่ม <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={addCoinsAmount}
                  onChange={(e) => setAddCoinsAmount(e.target.value)}
                  placeholder="เช่น 100, 500, 1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg text-black"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {[50, 100, 200, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAddCoinsAmount(amount.toString())}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 hover:text-orange-600 rounded-lg text-sm font-medium transition-colors text-black"
                  >
                    +{amount}
                  </button>
                ))}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={addCoinsDescription}
                  onChange={(e) => setAddCoinsDescription(e.target.value)}
                  placeholder="เช่น โบนัสพิเศษ, ชดเชย..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                />
              </div>

              {/* Preview */}
              {addCoinsAmount && parseInt(addCoinsAmount) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ยอดหลังเพิ่ม</span>
                    <span className="text-xl font-bold text-green-600">
                      {((selectedUser.coins || 0) + parseInt(addCoinsAmount)).toLocaleString()} coins
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowAddCoinsModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddCoins}
                disabled={addingCoins || !addCoinsAmount || parseInt(addCoinsAmount) <= 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {addingCoins ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    กำลังเพิ่ม...
                  </>
                ) : (
                  <>
                    <FaCoins />
                    เพิ่ม Coins
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Coins Modal */}
      {showRemoveCoinsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaMinus className="text-white text-xl" />
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-bold">หัก Coins</h3>
                  <p className="text-sm opacity-90">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Current Balance */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <span className="text-gray-600">ยอด Coins ปัจจุบัน</span>
                <span className="text-2xl font-bold text-yellow-500">
                  {(selectedUser.coins || 0).toLocaleString()}
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวน Coins ที่ต้องการหัก <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedUser.coins || 0}
                  value={removeCoinsAmount}
                  onChange={(e) => setRemoveCoinsAmount(e.target.value)}
                  placeholder="เช่น 50, 100, 500"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg text-black"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {[50, 100, 200, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setRemoveCoinsAmount(Math.min(amount, selectedUser.coins || 0).toString())}
                    disabled={amount > (selectedUser.coins || 0)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-lg text-sm font-medium transition-colors text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -{amount}
                  </button>
                ))}
                <button
                  onClick={() => setRemoveCoinsAmount((selectedUser.coins || 0).toString())}
                  disabled={(selectedUser.coins || 0) <= 0}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ทั้งหมด
                </button>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุ (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={removeCoinsDescription}
                  onChange={(e) => setRemoveCoinsDescription(e.target.value)}
                  placeholder="เช่น คืนสินค้า, ปรับยอด..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                />
              </div>

              {/* Preview */}
              {removeCoinsAmount && parseInt(removeCoinsAmount) > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ยอดหลังหัก</span>
                    <span className="text-xl font-bold text-red-600">
                      {((selectedUser.coins || 0) - parseInt(removeCoinsAmount)).toLocaleString()} coins
                    </span>
                  </div>
                </div>
              )}

              {/* Warning */}
              {removeCoinsAmount && parseInt(removeCoinsAmount) > (selectedUser.coins || 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
                  ⚠️ จำนวนที่ระบุเกินยอด coins ปัจจุบัน
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveCoinsModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRemoveCoins}
                disabled={removingCoins || !removeCoinsAmount || parseInt(removeCoinsAmount) <= 0 || parseInt(removeCoinsAmount) > (selectedUser.coins || 0)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {removingCoins ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    กำลังหัก...
                  </>
                ) : (
                  <>
                    <FaMinus />
                    หัก Coins
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
