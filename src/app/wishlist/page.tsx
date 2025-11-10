"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaHeart } from "react-icons/fa";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";

export default function WishlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

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
        <Breadcrumb items={[{ label: 'รายการโปรด' }]} />
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <FaHeart className="text-red-500" />
          รายการโปรด
        </h1>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">
            ยังไม่มีสินค้าในรายการโปรด
          </p>
          <p className="text-gray-400 text-sm mb-6">
            คลิกที่ไอคอนหัวใจบนสินค้าที่คุณชอบเพื่อเพิ่มในรายการโปรด
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            เริ่มช้อปปิ้ง
          </a>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            ← กลับหน้าแรก
          </a>
        </div>
      </div>
    </div>
  );
}
