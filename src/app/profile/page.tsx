"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { FaUser, FaEnvelope, FaPhone, FaCoins, FaEdit, FaMapMarkerAlt, FaShoppingBag, FaHeart, FaHistory, FaPlus, FaTrash } from 'react-icons/fa'
import Link from 'next/link'
import { addressAPI } from '@/app/lib/api'
import EditProfileModal from '../component/Profile/EditProfileModal'
import AddressModal from '../component/Profile/AddressModal'
import { useToast } from '../component/Toast/Toast'
import Navbar from '@/app/component/Navbar/Navbar'
import Features from '@/app/component/main/Features/Features'
import Footer from '@/app/component/main/footer/footer'

interface Address {
    _id: string
    fullName: string
    phoneNumber: string
    address: string
    province: string
    district: string
    subdistrict?: string
    postalCode: string
    isDefault?: boolean
}

export default function ProfilePage() {
    const { user, isAuthenticated, loading } = useAuth()
    const { showErrorToast } = useToast()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState('info')
    const [addresses, setAddresses] = useState<Address[]>([])
    const [loadingAddresses, setLoadingAddresses] = useState(false)

    // Modal States
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/')
        }
    }, [loading, isAuthenticated, router])

    // Fetch addresses when tab is active or just initially
    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses()
        }
    }, [isAuthenticated])

    const fetchAddresses = async () => {
        try {
            setLoadingAddresses(true)
            const response = await addressAPI.getAddresses()
            if (response.success) {
                setAddresses(response.data)
            }
        } catch (error) {
            console.error('Error fetching addresses:', error)
        } finally {
            setLoadingAddresses(false)
        }
    }

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('คุณต้องการลบที่อยู่นี้ใช่หรือไม่?')) return
        try {
            await addressAPI.deleteAddress(id)
            fetchAddresses() // Refresh list
        } catch (error) {
            showErrorToast('เกิดข้อผิดพลาดในการลบที่อยู่')
        }
    }

    const handleSetDefaultAddress = async (id: string) => {
        try {
            await addressAPI.setDefaultAddress(id)
            fetchAddresses() // Refresh list
        } catch (error) {
            showErrorToast('เกิดข้อผิดพลาดในการตั้งค่าที่อยู่เริ่มต้น')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) return null

    // Helper to format currency/coins
    const formatNumber = (num: number) => {
        return num.toLocaleString()
    }

    return (
        <>
            <Navbar showBanner={false} showPromotion={false} />
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">

                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">บัญชีของฉัน</h1>
                        <p className="mt-2 text-gray-600">จัดการข้อมูลส่วนตัวและตรวจสอบสถานะบัญชีของคุณ</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                            <FaUser size={24} className="text-white" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-lg truncate">{user.firstName} {user.lastName}</p>
                                            <p className="text-blue-100 text-sm truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 bg-blue-800/30 px-3 py-1.5 rounded-lg w-fit">
                                        <FaCoins className="text-yellow-400" />
                                        <span className="font-semibold">{formatNumber(user.coins)} Coins</span>
                                    </div>
                                </div>

                                <nav className="p-2">
                                    <button
                                        onClick={() => setActiveTab('info')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'info' ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <FaUser size={18} />
                                        <span>ข้อมูลส่วนตัว</span>
                                    </button>

                                    <Link href="/orders" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200">
                                        <FaHistory size={18} />
                                        <span>ประวัติการสั่งซื้อ</span>
                                    </Link>

                                    <Link href="/wishlist" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200">
                                        <FaHeart size={18} />
                                        <span>รายการโปรด</span>
                                    </Link>

                                    <button
                                        onClick={() => setActiveTab('address')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'address' ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <FaMapMarkerAlt size={18} />
                                        <span>สมุดที่อยู่</span>
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3">
                            {activeTab === 'info' && (
                                <div className="space-y-6">

                                    {/* Personal Info Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                <FaUser className="text-blue-500" />
                                                ข้อมูลพื้นฐาน
                                            </h2>
                                            <button
                                                onClick={() => setIsEditProfileModalOpen(true)}
                                                className="text-sm px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-full text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 flex items-center gap-2 font-medium"
                                            >
                                                <FaEdit size={14} />
                                                แก้ไขข้อมูล
                                            </button>
                                        </div>

                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            {/* Name Group */}
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</label>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500 group-hover:scale-110 transition-transform duration-200">
                                                        <FaUser size={16} />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                                                </div>
                                            </div>

                                            {/* Email Group */}
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">อีเมล</label>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500 group-hover:scale-110 transition-transform duration-200">
                                                        <FaEnvelope size={16} />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.email}</span>
                                                </div>
                                            </div>

                                            {/* Phone Group */}
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">เบอร์โทรศัพท์</label>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500 group-hover:scale-110 transition-transform duration-200">
                                                        <FaPhone size={16} />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.phoneNumber || "-"}</span>
                                                </div>
                                            </div>

                                            {/* User Role Group (Optional showcase) */}
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-500 uppercase tracking-wider">สถานะสมาชิก</label>
                                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                                    <div className="bg-white p-2 rounded-lg shadow-sm text-blue-500 group-hover:scale-110 transition-transform duration-200">
                                                        <FaUser size={16} />
                                                    </div>
                                                    <span className="font-medium text-gray-900 capitalize">{user.role}</span>
                                                    {user.role === 'admin' && (
                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-bold ml-auto">Admin</span>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    {/* Account Stats / Quick Links - Optional but good for "My Page" */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <FaShoppingBag size={80} />
                                            </div>
                                            <p className="text-purple-100 font-medium">คำสั่งซื้อ</p>
                                            <h3 className="text-3xl font-bold mt-1">ดูประวัติ</h3>
                                            <Link href="/orders" className="mt-4 inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors">
                                                ตรวจสอบ
                                            </Link>
                                        </div>

                                        <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-pink-200 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <FaHeart size={80} />
                                            </div>
                                            <p className="text-pink-100 font-medium">รายการโปรด</p>
                                            <h3 className="text-3xl font-bold mt-1">สินค้าที่ชอบ</h3>
                                            <Link href="/wishlist" className="mt-4 inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors">
                                                ดูรายการ
                                            </Link>
                                        </div>

                                        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <FaCoins size={80} />
                                            </div>
                                            <p className="text-yellow-100 font-medium">Coin Balance</p>
                                            <h3 className="text-3xl font-bold mt-1">{formatNumber(user.coins)}</h3>
                                            <Link href="/coins" className="mt-4 inline-block px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold backdrop-blur-sm transition-colors">
                                                เติมเงิน
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            )}

                            {activeTab === 'address' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-gray-800">สมุดที่อยู่</h2>
                                        <button
                                            onClick={() => {
                                                setEditingAddress(null)
                                                setIsAddressModalOpen(true)
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            <FaPlus size={14} />
                                            เพิ่มที่อยู่ใหม่
                                        </button>
                                    </div>

                                    {loadingAddresses ? (
                                        <div className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            <p className="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
                                        </div>
                                    ) : addresses.length === 0 ? (
                                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FaMapMarkerAlt size={24} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">ยังไม่มีที่อยู่</h3>
                                            <p className="text-gray-50 mt-1 mb-6">คุณยังไม่ได้เพิ่มที่อยู่สำหรับจัดส่งสินค้า</p>
                                            <button
                                                onClick={() => {
                                                    setEditingAddress(null)
                                                    setIsAddressModalOpen(true)
                                                }}
                                                className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full font-medium hover:bg-blue-100 transition-colors"
                                            >
                                                เพิ่มที่อยู่ตอนนี้
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {addresses.map((addr) => (
                                                <div key={addr._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group relative">
                                                    {addr.isDefault && (
                                                        <span className="absolute top-4 right-4 px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                                                            ค่าเริ่มต้น
                                                        </span>
                                                    )}
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 mt-1">
                                                            <FaMapMarkerAlt className="text-gray-400 group-hover:text-blue-500 transition-colors" size={20} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-900">{addr.fullName}</h3>
                                                            <p className="text-gray-500 text-sm mt-1">{addr.phoneNumber}</p>
                                                            <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                                                                {addr.address} {addr.subdistrict} <br />
                                                                {addr.district} {addr.province} {addr.postalCode}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 pt-4 border-t border-gray-50 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!addr.isDefault && (
                                                            <button
                                                                onClick={() => handleSetDefaultAddress(addr._id)}
                                                                className="text-xs text-gray-500 hover:text-blue-600 font-medium"
                                                            >
                                                                ตั้งเป็นค่าเริ่มต้น
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setEditingAddress(addr)
                                                                setIsAddressModalOpen(true)
                                                            }}
                                                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                                            title="แก้ไข"
                                                        >
                                                            <FaEdit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAddress(addr._id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                            title="ลบ"
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                <EditProfileModal
                    isOpen={isEditProfileModalOpen}
                    onClose={() => setIsEditProfileModalOpen(false)}
                    user={user}
                />

                <AddressModal
                    isOpen={isAddressModalOpen}
                    onClose={() => setIsAddressModalOpen(false)}
                    addressToEdit={editingAddress}
                    onSuccess={fetchAddresses}
                />
            </div>
            <Features />
            <Footer />
        </>
    )
}
