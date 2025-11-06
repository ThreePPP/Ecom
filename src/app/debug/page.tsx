"use client";

import { useState, useEffect } from "react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Stats {
  users: number;
  products: number;
  carts: number;
  orders: number;
}

export default function DebugPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/debug/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/debug/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const searchUserByEmail = async () => {
    if (!searchEmail) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/debug/users/${searchEmail}`);
      const data = await response.json();
      if (data.success) {
        setSearchResult(data.data);
      } else {
        setSearchResult(null);
        alert("ไม่พบผู้ใช้");
      }
    } catch (error) {
      console.error("Error searching user:", error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const deleteAllUsers = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ทั้งหมด?")) return;

    try {
      const response = await fetch("http://localhost:5000/api/debug/users", {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert("ลบผู้ใช้ทั้งหมดแล้ว");
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting users:", error);
      alert("เกิดข้อผิดพลาด");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          🔍 Debug Dashboard
        </h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold">{stats.users}</div>
              <div className="text-sm">ผู้ใช้ทั้งหมด</div>
            </div>
            <div className="bg-green-500 text-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold">{stats.products}</div>
              <div className="text-sm">สินค้าทั้งหมด</div>
            </div>
            <div className="bg-yellow-500 text-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold">{stats.carts}</div>
              <div className="text-sm">ตะกร้าทั้งหมด</div>
            </div>
            <div className="bg-purple-500 text-white p-6 rounded-lg shadow">
              <div className="text-3xl font-bold">{stats.orders}</div>
              <div className="text-sm">ออเดอร์ทั้งหมด</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            ค้นหาผู้ใช้ด้วยอีเมล
          </h2>
          <div className="flex gap-4">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="กรอกอีเมล..."
              className="flex-1 border border-gray-300 rounded px-4 py-2"
              onKeyPress={(e) => e.key === "Enter" && searchUserByEmail()}
            />
            <button
              onClick={searchUserByEmail}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              ค้นหา
            </button>
          </div>

          {searchResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-bold text-lg mb-2">ผลการค้นหา:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>ชื่อ:</strong> {searchResult.firstName}{" "}
                  {searchResult.lastName}
                </div>
                <div>
                  <strong>อีเมล:</strong> {searchResult.email}
                </div>
                <div>
                  <strong>เบอร์โทร:</strong> {searchResult.phoneNumber}
                </div>
                <div>
                  <strong>Role:</strong> {searchResult.role}
                </div>
                <div>
                  <strong>สร้างเมื่อ:</strong>{" "}
                  {new Date(searchResult.createdAt).toLocaleString("th-TH")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              รายชื่อผู้ใช้ทั้งหมด ({users.length})
            </h2>
            <button
              onClick={deleteAllUsers}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              ลบทั้งหมด
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              ยังไม่มีผู้ใช้ในระบบ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3">อีเมล</th>
                    <th className="px-4 py-3">เบอร์โทร</th>
                    <th className="px-4 py-3">วันเกิด</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">สร้างเมื่อ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.phoneNumber}</td>
                      <td className="px-4 py-3">
                        {new Date(user.dateOfBirth).toLocaleDateString("th-TH")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(user.createdAt).toLocaleString("th-TH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block bg-gray-800 text-white px-6 py-3 rounded hover:bg-gray-700"
          >
            ← กลับไปหน้าแรก
          </a>
        </div>
      </div>
    </div>
  );
}
