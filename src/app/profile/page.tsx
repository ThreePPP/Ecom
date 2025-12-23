"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { addressAPI } from "@/app/lib/api";
import Navbar from "@/app/component/Navbar/Navbar";
import Features from "@/app/component/main/Features/Features";
import Footer from "@/app/component/main/footer/footer";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaUser,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

interface Address {
  _id?: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}

export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // States for addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Address>({
    fullName: "",
    phoneNumber: "",
    address: "",
    district: "",
    province: "",
    postalCode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, loading, router]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await addressAPI.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      fullName: user?.firstName + " " + user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      address: "",
      district: "",
      province: "",
      postalCode: "",
      isDefault: addresses.length === 0,
    });
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowAddressForm(true);
  };

  const handleSaveAddress = async () => {
    try {
      if (
        !formData.fullName ||
        !formData.phoneNumber ||
        !formData.address ||
        !formData.district ||
        !formData.province ||
        !formData.postalCode
      ) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      if (editingAddress && editingAddress._id) {
        // Update existing address
        await addressAPI.updateAddress(editingAddress._id, formData);
        alert("แก้ไขที่อยู่สำเร็จ");
      } else {
        // Add new address
        await addressAPI.addAddress(formData);
        alert("เพิ่มที่อยู่สำเร็จ");
      }

      setShowAddressForm(false);
      fetchAddresses();
    } catch (error: any) {
      alert(error.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("คุณต้องการลบที่อยู่นี้หรือไม่?")) return;

    try {
      await addressAPI.deleteAddress(addressId);
      alert("ลบที่อยู่สำเร็จ");
      fetchAddresses();
    } catch (error: any) {
      alert(error.message || "เกิดข้อผิดพลาด");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressAPI.setDefaultAddress(addressId);
      fetchAddresses();
    } catch (error: any) {
      alert(error.message || "เกิดข้อผิดพลาด");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <p className="text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar showBanner={false} showPromotion={false} />
      <div className="min-h-screen bg-[#F9FAFB] pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Breadcrumb items={[{ label: 'ข้อมูลของฉัน' }]} />
              <h1 className="text-3xl font-bold text-gray-900 mt-4 tracking-tight">ข้อมูลของฉัน</h1>
              <p className="text-gray-500 mt-1 text-sm">จัดการข้อมูลส่วนตัวและที่อยู่สำหรับจัดส่งสินค้า</p>
            </div>

            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
            >
              กลับหน้าแรก
            </a>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* User Information */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <FaUser className="text-lg" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">ข้อมูลส่วนตัว</h2>
                  <p className="text-xs text-gray-400">รายละเอียดบัญชีผู้ใช้ของคุณ</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 group-hover:text-blue-600 transition-colors">
                    ชื่อ
                  </label>
                  <div className="text-lg font-medium text-gray-900 border-b border-transparent group-hover:border-gray-100 pb-1 transition-all">
                    {user?.firstName}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 group-hover:text-blue-600 transition-colors">
                    นามสกุล
                  </label>
                  <div className="text-lg font-medium text-gray-900 border-b border-transparent group-hover:border-gray-100 pb-1 transition-all">
                    {user?.lastName}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 group-hover:text-blue-600 transition-colors">
                    อีเมล
                  </label>
                  <div className="flex items-center gap-3 text-lg font-medium text-gray-900 border-b border-transparent group-hover:border-gray-100 pb-1 transition-all">
                    <FaEnvelope className="text-gray-300 text-sm" />
                    {user?.email}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 group-hover:text-blue-600 transition-colors">
                    เบอร์โทรศัพท์
                  </label>
                  <div className="flex items-center gap-3 text-lg font-medium text-gray-900 border-b border-transparent group-hover:border-gray-100 pb-1 transition-all">
                    <FaPhone className="text-gray-300 text-sm" />
                    {user?.phoneNumber}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    สิทธิ์การใช้งาน
                  </label>
                  <div>
                    <span
                      className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${user?.role === "admin"
                          ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                          : "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                        }`}
                    >
                      {user?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Addresses Section */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <FaMapMarkerAlt className="text-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">ที่อยู่สำหรับจัดส่ง</h2>
                    <p className="text-xs text-gray-400">จัดการที่อยู่สำหรับการจัดส่งสินค้าของคุณ</p>
                  </div>
                </div>
                <button
                  onClick={handleAddAddress}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-200 font-medium text-sm"
                >
                  <FaPlus className="text-xs" /> เพิ่มที่อยู่ใหม่
                </button>
              </div>

              {loadingAddresses ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mb-4"></div>
                  <span>กำลังโหลดข้อมูลที่อยู่...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <FaMapMarkerAlt className="text-gray-300 text-2xl" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-1">ยังไม่มีที่อยู่จัดส่ง</h3>
                  <p className="text-gray-500 text-sm mb-6">เริ่มเพิ่มที่อยู่ของคุณเพื่อความสะดวกในการสั่งซื้อ</p>
                  <button
                    onClick={handleAddAddress}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                  >
                    เพิ่มที่อยู่แรกของคุณ
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`group relative rounded-2xl p-5 border transition-all duration-200 ${addr.isDefault
                          ? "bg-white border-blue-200 shadow-sm ring-1 ring-blue-50"
                          : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm"
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                              ค่าเริ่มต้น
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {!addr.isDefault && (
                            <button
                              onClick={() => addr._id && handleSetDefault(addr._id)}
                              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors"
                              title="ตั้งเป็นค่าเริ่มต้น"
                            >
                              <FaStar />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddress(addr)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="แก้ไข"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => addr._id && handleDeleteAddress(addr._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบ"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-start gap-2">
                          <span className="text-gray-400 min-w-[20px] pt-1"><FaPhone className="text-xs" /></span>
                          {addr.phoneNumber}
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-gray-400 min-w-[20px] pt-1"><FaMapMarkerAlt className="text-xs" /></span>
                          <span className="leading-relaxed">
                            {addr.address}, {addr.district}, {addr.province} {addr.postalCode}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Address Form Modal */}
          {showAddressForm && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all scale-100">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingAddress ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
                    </h3>
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ชื่อ - นามสกุล *
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                          placeholder="เช่น สมชาย ใจดี"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          เบอร์โทรศัพท์ *
                        </label>
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, phoneNumber: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                          placeholder="เช่น 0812345678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ที่อยู่ *
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="บ้านเลขที่, ซอย, ถนน, หมู่บ้าน..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          อำเภอ / เขต *
                        </label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) =>
                            setFormData({ ...formData, district: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          จังหวัด *
                        </label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={(e) =>
                            setFormData({ ...formData, province: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        รหัสไปรษณีย์ *
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postalCode: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isDefault: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      />
                      <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                        ตั้งเป็นที่อยู่เริ่มต้นสำหรับการจัดส่ง
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-10">
                    <button
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-medium rounded-xl hover:shadow-lg hover:to-slate-800 transition-all shadow-md"
                    >
                      บันทึกข้อมูล
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Features />
      <Footer />
    </>
  );
}
