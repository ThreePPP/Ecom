"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { addressAPI } from "@/app/lib/api";
import {
  FaMapMarkerAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">กำลังโหลด...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ข้อมูลของฉัน</h1>

        {/* User Information */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">ข้อมูลส่วนตัว</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ
              </label>
              <div className="text-lg text-gray-900">{user?.firstName}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                นามสกุล
              </label>
              <div className="text-lg text-gray-900">{user?.lastName}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <div className="text-lg text-gray-900">{user?.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เบอร์โทรศัพท์
              </label>
              <div className="text-lg text-gray-900">{user?.phoneNumber}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                สิทธิ์การใช้งาน
              </label>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-red-600 text-2xl" />
              <h2 className="text-xl font-semibold">ที่อยู่สำหรับจัดส่ง</h2>
            </div>
            <button
              onClick={handleAddAddress}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaPlus /> เพิ่มที่อยู่ใหม่
            </button>
          </div>

          {loadingAddresses ? (
            <div className="text-center py-8 text-gray-500">
              กำลังโหลดที่อยู่...
            </div>
          ) : addresses.length === 0 ? (
            <div className="text-center py-12">
              <FaMapMarkerAlt className="mx-auto text-gray-300 text-5xl mb-4" />
              <p className="text-gray-500 mb-4">ยังไม่มีที่อยู่จัดส่ง</p>
              <button
                onClick={handleAddAddress}
                className="text-red-600 hover:text-red-700 font-medium"
              >
                เพิ่มที่อยู่แรกของคุณ
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                            <FaStar className="text-xs" /> ค่าเริ่มต้น
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {addr.phoneNumber}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {addr.address}, {addr.district}, {addr.province}{" "}
                        {addr.postalCode}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!addr.isDefault && (
                        <button
                          onClick={() => addr._id && handleSetDefault(addr._id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="ตั้งเป็นค่าเริ่มต้น"
                        >
                          <FaStar />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditAddress(addr)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => addr._id && handleDeleteAddress(addr._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบ"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">
                  {editingAddress ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
                </h3>

                <div className="space-y-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                      placeholder="กรุณากรอกชื่อ - นามสกุล"
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
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                      placeholder="0812345678"
                    />
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                      placeholder="บ้านเลขที่ หมู่บ้าน ซอย ถนน"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                        placeholder="อำเภอ / เขต"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                        placeholder="จังหวัด"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                      placeholder="10260"
                    />
                  </div>

                  <div className="flex items-center gap-2">
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
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700">
                      ตั้งเป็นที่อยู่เริ่มต้น
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            กลับหน้าแรก
          </a>
        </div>
      </div>
    </div>
  );
}
