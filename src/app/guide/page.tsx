"use client"
import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../component/Navbar/Navbar'
import Footer from '../component/main/footer/footer'
import { FaShoppingCart, FaCreditCard, FaTruck, FaShieldAlt, FaChevronRight, FaCoins } from 'react-icons/fa'

function GuideContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState('order');

    useEffect(() => {
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const tabs = [
        { id: 'order', label: 'วิธีการสั่งซื้อ', icon: FaShoppingCart },
        { id: 'payment', label: 'วิธีการชำระเงิน', icon: FaCreditCard },
        { id: 'shipping', label: 'เงื่อนไขการจัดส่งสินค้า', icon: FaTruck },
        { id: 'warranty', label: 'เงื่อนไขการรับประกัน', icon: FaShieldAlt },
    ];

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Navbar showBanner={false} />

            {/* Header Banner */}
            <div className="bg-white text-gray-900 py-12">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h1>
                    <p className="text-gray-600">ศูนย์ช่วยเหลือและคู่มือการใช้งาน</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 -mt-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full lg:w-1/4">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-24">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between p-4 transition-all duration-200 border-b border-gray-100 last:border-b-0
                    ${activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-l-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <tab.icon size={20} />
                                        <span>{tab.label}</span>
                                    </div>
                                    {activeTab === tab.id && <FaChevronRight size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="w-full lg:w-3/4">
                        <div className="bg-white rounded-xl shadow-sm p-6 md:p-10 min-h-[500px]">

                            {/* How to Order */}
                            {activeTab === 'order' && (
                                <div className="animate-fade-in space-y-8">
                                    <div className="text-center mb-10">
                                        <h2 className="text-2xl font-bold text-black mb-4">ขั้นตอนการสั่งซื้อสินค้า FavorPC Online</h2>
                                        <p className="text-gray-600">ช้อปง่ายๆ เพียง 4 ขั้นตอน</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">1</div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2 text-black">สมัครสมาชิก / เข้าสู่ระบบ</h3>
                                                <p className="text-gray-600 text-sm">คลิกที่ปุ่ม "เข้าสู่ระบบ" มุมขวาบน สามารถใช้อีเมลหรือบัญชี Google ในการสมัครได้ทันที</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">2</div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2 text-black">เลือกสินค้าลงตะกร้า</h3>
                                                <p className="text-gray-600 text-sm">ค้นหาสินค้าที่คุณต้องการ กดปุ่ม "ใส่ตะกร้า" เมื่อได้สินค้าครบแล้ว กดที่ไอคอนตะกร้าเพื่อตรวจสอบรายการ</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">3</div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2 text-black">ชำระเงิน</h3>
                                                <p className="text-gray-600 text-sm">ตรวจสอบที่อยู่จัดส่ง เลือกวิธีการชำระเงินระบบเติม Coins (กรุณาเติม Coins ก่อนสั่งซื้อสินค้า) และยืนยันการสั่งซื้อ</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">4</div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2 text-black">รอรับสินค้า</h3>
                                                <p className="text-gray-600 text-sm">หลังจากชำระเงินเรียบร้อย รอรับยืนยันและเลขติดตามพัสดุ สินค้าจะถูกจัดส่งถึงหน้าบ้านคุณลูกค้า</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center gap-3">
                                        <div className="flex-shrink-0 text-blue-500"><FaShoppingCart size={24} /></div>
                                        <p className="text-sm text-blue-800">
                                            ต้องการความช่วยเหลือเพิ่มเติม? ติดต่อฝ่ายบริการลูกค้าได้ที่ <span className="font-bold">06X-XXX-XXXX</span> หรือแชทกับเราได้ตลอด 24 ชม.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Methods */}
                            {activeTab === 'payment' && (
                                <div className="animate-fade-in space-y-8">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-black">ช่องทางการชำระเงิน</h2>
                                        <p className="text-gray-600 mt-2">สะดวก ปลอดภัย ใช้งานง่ายด้วยระบบ Coins</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-white to-orange-50 border border-yellow-200 rounded-2xl p-8 text-center shadow-sm">
                                        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg ring-4 ring-yellow-100">
                                            <FaCoins size={40} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-black mb-4">ระบบ Coins คืออะไร?</h3>
                                        <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto mb-8 text-lg">
                                            FavorPC ใช้ระบบ <strong>"Coins"</strong> เป็นสื่อกลางในการแลกเปลี่ยนสินค้า
                                            <br className="hidden md:block" />
                                            ช่วยให้การชำระเงินของคุณรวดเร็วและตรวจสอบยอดได้ทันที
                                        </p>

                                        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
                                            <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg mb-4">1</div>
                                                <h4 className="font-bold text-black text-lg mb-2">เติม Coins เข้าระบบ</h4>
                                                <p className="text-gray-600">
                                                    ไปที่เมนู <strong>"Coins ของฉัน"</strong> และเลือก <strong>"เติมเงิน"</strong>
                                                    <br />
                                                    รองรับการโอนผ่านธนาคารและ QR Code
                                                    <br />
                                                    <span className="text-yellow-600 font-medium">(1 Coin = 1 บาท)</span>
                                                </p>
                                            </div>
                                            <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg mb-4">2</div>
                                                <h4 className="font-bold text-black text-lg mb-2">ชำระค่าสินค้า</h4>
                                                <p className="text-gray-600">
                                                    เลือกสินค้าที่ต้องการลงตะกร้า แล้วกดชำระเงิน
                                                    <br />
                                                    ระบบจะตัด Coins จากบัญชีของคุณอัตโนมัติ
                                                    <br />
                                                    <span className="text-green-600 font-medium">ยืนยันคำสั่งซื้อได้ทันที!</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Shipping Conditions */}
                            {activeTab === 'shipping' && (
                                <div className="animate-fade-in space-y-8">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-black">เงื่อนไขการจัดส่งสินค้า</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-white border rounded-xl p-6">
                                            <div className="text-blue-600 mb-4"><FaTruck size={32} /></div>
                                            <h3 className="text-lg font-bold mb-2 text-black">Standard Delivery</h3>
                                            <p className="text-gray-600 text-sm mb-4">จัดส่งธรรมดาในประเทศ</p>
                                            <ul className="text-sm text-gray-600 space-y-2">
                                                <li>• กรุงเทพฯ และปริมณฑล 2-3 วันทำการ</li>
                                                <li>• ต่างจังหวัด 3-4 วันทำการ</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h3 className="font-bold text-lg mb-4 text-black">รอบการตัดส่งสินค้า</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-gray-500">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3">วันที่สั่งซื้อ</th>
                                                        <th className="px-6 py-3">เวลาที่ชำระเงิน</th>
                                                        <th className="px-6 py-3">รอบจัดส่ง</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-white border-b">
                                                        <td className="px-6 py-4">วันจันทร์ - ศุกร์</td>
                                                        <td className="px-6 py-4">หลัง 14:00 น.</td>
                                                        <td className="px-6 py-4">จัดส่งวันทำการถัดไป</td>
                                                    </tr>
                                                    <tr className="bg-white border-b">
                                                        <td className="px-6 py-4">วันจันทร์ - ศุกร์</td>
                                                        <td className="px-6 py-4">หลัง 14:00 น.</td>
                                                        <td className="px-6 py-4">จัดส่งวันทำการถัดไป</td>
                                                    </tr>
                                                    <tr className="bg-white border-b">
                                                        <td className="px-6 py-4">วันเสาร์ - อาทิตย์</td>
                                                        <td className="px-6 py-4">หลัง 14:00 น.</td>
                                                        <td className="px-6 py-4">จัดส่งวันจันทร์</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warranty Conditions */}
                            {activeTab === 'warranty' && (
                                <div className="animate-fade-in space-y-8">
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-bold text-black">เงื่อนไขการรับประกันสินค้า</h2>
                                        <p className="text-gray-600">อุ่นใจกับบริการหลังการขายมาตรฐานสากล</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex gap-6 items-start">
                                            <div className="flex-shrink-0 w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                <span className="text-2xl font-bold">15</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold mb-2 text-black">รับประกันเปลี่ยนสินค้าภายใน 15 วัน</h3>
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    หากพบสินค้ามีปัญหาจากการผลิต หรือเสียหายจากการขนส่ง สามารถแจ้งเปลี่ยนสินค้าตัวใหม่ได้ภายใน 15 วัน นับจากวันที่ได้รับสินค้า โดยสินค้าต้องอยู่ในสภาพที่สมบูรณ์ กล่องและอุปกรณ์ครบถ้วน
                                                </p>
                                            </div>
                                        </div>

                                        <div className="border-t pt-8">
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black">
                                                <FaShieldAlt className="text-blue-600" />
                                                เงื่อนไขการรับประกันของร้าน (Manufacturer Warranty)
                                            </h3>
                                            <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-600 space-y-4">
                                                <p>1. สินค้าทุกชิ้นที่ซื้อจากเรา มีการรับประกันศูนย์ไทยตามระยะเวลาที่ผู้ผลิตกำหนด (เช่น 1 ปี, 3 ปี, 5 ปี หรือ Lifetime)</p>
                                                <p>2. ลูกค้าสามารถส่งเคลมผ่านทางร้านผ่านขนส่งทั่วไปได้</p>
                                                <p>3. การรับประกันไม่ครอบคลุมความเสียหายที่เกิดจาก</p>
                                                <ul className="list-disc list-inside ml-4 space-y-1">
                                                    <li>การใช้งานผิดวิธี อุบัติเหตุ ตกหล่น โดนน้ำ</li>
                                                    <li>การดัดแปลงสภาพ หรือซ่อมแซมโดยช่างที่ไม่ได้รับอนุญาต</li>
                                                    <li>ภัยธรรมชาติ ไฟไหม้ ฟ้าผ่า</li>
                                                </ul>
                                                <p>4. เก็บหลักฐานการสั่งซื้อหรือใบเสร็จรับเงินไว้เพื่อใช้สิทธิ์ในการรับประกัน</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default function GuidePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GuideContent />
        </Suspense>
    )
}
