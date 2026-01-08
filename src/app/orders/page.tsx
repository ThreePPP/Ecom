"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBox, FaCalendar, FaChevronLeft, FaSearch, FaFilter, FaMoneyBillWave, FaTruck, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'

import { useAuth } from '@/app/context/AuthContext'
import Navbar from '@/app/component/Navbar/Navbar'
import Footer from '@/app/component/main/footer/footer'
import { orderAPI } from '@/app/lib/api'

// Order interface based on what we see in controller and expected UI needs
interface OrderItem {
    _id: string
    name: string
    quantity: number
    price: number
    image: string
    product?: any
}

interface Order {
    _id: string
    orderNumber: string
    createdAt: string
    orderStatus: string
    paymentStatus: string
    total: number
    items: OrderItem[]
    trackingNumber?: string
    carrier?: string
}

export default function MyOrdersPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders()
        }
    }, [isAuthenticated])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await orderAPI.getMyOrders()
            if (response.success) {
                setOrders(response.data.orders)
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            case 'processing': return 'text-blue-600 bg-blue-100'
            case 'shipped': return 'text-indigo-600 bg-indigo-100'
            case 'delivered': return 'text-green-600 bg-green-100'
            case 'cancelled': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'รอดำเนินการ'
            case 'processing': return 'กำลังเตรียมจัดส่ง'
            case 'shipped': return 'อยู่ระหว่างจัดส่ง'
            case 'delivered': return 'จัดส่งสำเร็จ'
            case 'cancelled': return 'ยกเลิกแล้ว'
            default: return status
        }
    }

    const getPaymentStatusIcon = (status: string) => {
        if (status === 'paid') return <FaCheckCircle className="text-green-500" />
        return <FaClock className="text-yellow-500" />
    }

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(order => order.orderStatus === filterStatus)

    if (authLoading || loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <Footer />
            </>
        )
    }

    if (!isAuthenticated) return null

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar showBanner={false} />

            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header with Breadcrumb-ish return */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/profile" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                            <FaChevronLeft className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">คำสั่งซื้อของฉัน</h1>
                            <p className="text-gray-500 text-sm">รายการคำสั่งซื้อทั้งหมดของคุณ</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2 min-w-max">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'pending', label: 'ที่ต้องชำระ' },
                                { id: 'processing', label: 'ที่ต้องจัดส่ง' },
                                { id: 'delivered', label: 'สำเร็จ' },
                                { id: 'cancelled', label: 'ยกเลิก' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterStatus(tab.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filterStatus === tab.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaBox className="text-gray-300 text-3xl" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">ไม่พบคำสั่งซื้อ</h3>
                            <p className="text-gray-500 mt-1 mb-6">คุณยังไม่มีประวัติการสั่งซื้อในหมวดหมู่นี้</p>
                            <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
                                ไปเลือกซื้อสินค้า
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-blue-200 transition-all">
                                    {/* Order Header */}
                                    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex flex-wrap gap-4 justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                                <FaBox className="text-blue-500" />
                                                <span>{order.orderNumber}</span>
                                            </div>
                                            <span className="text-gray-400 text-sm">|</span>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <FaCalendar size={12} />
                                                <span>{new Date(order.createdAt).toLocaleDateString('th-TH', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}</span>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                                            {getStatusText(order.orderStatus)}
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    <div className="p-6">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex gap-4 mb-4 last:mb-0">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">x {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">฿{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>ยอดคำสั่งซื้อรวม:</span>
                                                <span className="text-xl font-bold text-blue-600">฿{order.total.toLocaleString()}</span>
                                            </div>
                                            {order.trackingNumber && (
                                                <div className="flex flex-col gap-1 w-fit">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 px-0 py-1.5">
                                                        <FaTruck className="text-gray-500" />
                                                        <span className="font-medium">
                                                            {order.carrier ? `${order.carrier}: ` : 'เลขพัสดุ: '}
                                                            {order.trackingNumber}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3 w-full sm:w-auto justify-end">
                                            {order.paymentStatus === 'pending' && order.orderStatus !== 'cancelled' && (
                                                <Link
                                                    href={`/payment/${order._id}`}
                                                    className="px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-lg shadow-sm shadow-orange-200 hover:bg-orange-600 transition-colors"
                                                >
                                                    ชำระเงิน
                                                </Link>
                                            )}
                                            <Link
                                                href={`/orders/${order._id}`}
                                                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                            >
                                                ดูรายละเอียด
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
