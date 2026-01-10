"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FaBox, FaCalendar, FaChevronLeft, FaMapMarkerAlt, FaCreditCard, FaTruck, FaFileInvoice, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'

import { useAuth } from '@/app/context/AuthContext'
import Navbar from '@/app/component/Navbar/Navbar'
import Footer from '@/app/component/main/footer/footer'
import { orderAPI } from '@/app/lib/api'
import { getImageUrl } from "@/app/utils/imageUrl";

// Reuse interfaces or import if possible, but for page file it's okay to define locally or stick to 'any' for speed if types aren't shared. 
// Ideally should be in a types file.
interface OrderDetail {
    _id: string
    orderNumber: string
    createdAt: string
    orderStatus: string
    paymentStatus: string
    paymentMethod: string
    shippingAddress: {
        fullName: string
        phoneNumber: string
        address: string
        district: string;
        province: string;
        postalCode: string;
    }
    items: Array<{
        product: {
            _id: string
            name: string
            price: number
            images: string[]
        }
        name: string
        quantity: number
        price: number
        image: string
    }>
    subtotal: number
    shippingFee: number
    discount: number
    total: number
}

export default function OrderDetailPage() {
    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const router = useRouter()
    const params = useParams()
    const [order, setOrder] = useState<OrderDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [authLoading, isAuthenticated, router])

    useEffect(() => {
        if (isAuthenticated && params.id) {
            fetchOrderDetail(params.id as string)
        }
    }, [isAuthenticated, params.id])

    const fetchOrderDetail = async (id: string) => {
        try {
            setLoading(true)
            const response = await orderAPI.getOrderById(id)
            if (response.success) {
                setOrder(response.data.order)
            } else {
                // Handle not found
                router.push('/orders')
            }
        } catch (error) {
            console.error('Failed to fetch order:', error)
            router.push('/orders')
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

    const getPaymentMethodText = (method: string) => {
        switch (method) {
            case 'credit_card': return 'บัตรเครดิต/เดบิต'
            case 'promptpay': return 'PromptPay QR'
            case 'cod': return 'เก็บเงินปลายทาง'
            case 'coin_payment': return 'ชำระด้วย Coin'
            default: return method
        }
    }

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

    if (!order) return null

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar showBanner={false} />

            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/orders" className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                            <FaChevronLeft className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">รายละเอียดคำสั่งซื้อ</h1>
                            <p className="text-gray-500 text-sm">หมายเลขสั่งซื้อ #{order.orderNumber}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">สถานะคำสั่งซื้อ</p>
                                    <div className={`px-4 py-1.5 rounded-full font-bold inline-flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
                                        <FaBox />
                                        <span>{getStatusText(order.orderStatus)}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 mb-1">วันที่สั่งซื้อ</p>
                                    <p className="font-semibold text-gray-900">
                                        {new Date(order.createdAt).toLocaleDateString('th-TH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Shipping & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Address */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-blue-500" />
                                    ที่อยู่จัดส่ง
                                </h3>
                                <div className="flex-grow text-gray-600 text-sm leading-relaxed">
                                    <p className="font-bold text-gray-800 mb-1">{order.shippingAddress.fullName}</p>
                                    <p className="mb-2">{order.shippingAddress.phoneNumber}</p>
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.district} {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaCreditCard className="text-purple-500" />
                                    การชำระเงิน
                                </h3>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-gray-600 text-sm">ช่องทาง</span>
                                        <span className="font-medium text-gray-900">{getPaymentMethodText(order.paymentMethod)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm">สถานะ</span>
                                        <div className="flex items-center gap-2">
                                            {order.paymentStatus === 'paid' ? (
                                                <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                                                    <FaCheckCircle /> ชำระแล้ว
                                                </span>
                                            ) : (
                                                <span className="text-orange-500 font-bold text-sm flex items-center gap-1">
                                                    <FaClock /> รอชำระเงิน
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {order.paymentStatus !== 'paid' && order.orderStatus !== 'cancelled' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <Link
                                                href={`/payment/${order._id}`}
                                                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition-colors"
                                            >
                                                ชำระเงินตอนนี้
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FaFileInvoice className="text-gray-500" />
                                    รายการสินค้า
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item, index) => (
                                    <div key={index} className="p-6 flex gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                            <img
                                                src={getImageUrl(item.image || item.product?.images?.[0]) || '/placeholder.jpg'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/product/${item.product?._id}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1">จำนวน: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">฿{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-50/50 p-6 border-t border-gray-100">
                                <div className="space-y-2 max-w-xs ml-auto">
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>ยอดรวมสินค้า</span>
                                        <span>฿{order.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>ลดราคา</span>
                                        <span className="text-red-500">-฿{order.discount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>ค่าจัดส่ง</span>
                                        <span>฿{order.shippingFee.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                                        <span>ยอดสุทธิ</span>
                                        <span className="text-blue-600">฿{order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
