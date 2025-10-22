import React, { useState } from "react";
import type { types } from "@/app/util/types";

const RegisterModal: React.FC<types> = ({ isOpen, onClose, onOpen }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[400px] max-w-[95vw] relative flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="close"
        >
          &times;
        </button>
        <div className="w-full max-w-lg">
          <button
            className="mb-4 text-gray-500 hover:text-blue-700 flex items-center gap-2 text-sm"
            onClick={() => { onClose?.(); onOpen?.(); }}
          >
            <span className="text-lg">&#8592;</span> ย้อนกลับ
          </button>
          <h2 className="text-2xl text-black font-bold text-center mb-2">
            สมัครสมาชิกด้วย Email
          </h2>
          <form className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-black font-medium mb-1">
                  ชื่อ*
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-black font-medium mb-1">
                  นามสกุล*
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-black font-medium mb-1">
                  เบอร์โทรศัพท์มือถือ*
                </label>
                <input
                  type="tel"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-black font-medium mb-1">
                  วัน/เดือน/ปีเกิด*
                </label>
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-black font-medium mb-1">
                อีเมล*
              </label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-black font-medium mb-1">
                รหัสผ่าน*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full border rounded px-3 py-2 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                <span>รหัสผ่านต้องมีความยาว 8 ตัวอักษรขึ้นไป</span>
                <span>1 ตัวอักษรพิมพ์ใหญ่ (A-Z)</span>
                <span>1 ตัวอักษรพิมพ์เล็ก (a-z)</span>
                <span>1 ตัวเลข (0-9)</span>
                <span>1 สัญลักษณ์พิเศษ (@ # $ % &amp; * ( ) !)</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-black font-medium mb-1">
                ยืนยันรหัสผ่าน*
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full border rounded px-3 py-2 pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-400"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="accept"
                className="accent-blue-600"
                required
              />
              <label htmlFor="accept" className="text-xs text-gray-600">
                ฉันได้อ่านและยอมรับ รวมถึงยินยอมให้ใช้{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  นโยบายข้อมูลส่วนบุคคล
                </a>{" "}
                ของ Favcom แล้ว
              </label>
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-1/2 bg-blue-400 text-white font-bold py-2 rounded-full mt-2"
              >
                สมัครสมาชิก
              </button>
            </div>
          </form>
          <div className="text-center my-4 text-sm text-gray-500">
            หรือ สมัครสมาชิกด้วย
          </div>
          <div className="flex justify-center gap-4 mb-2">
            <button className="bg-white border rounded-full p-2 shadow-sm">
              <svg width="28" height="28" viewBox="0 0 48 48">
                <g>
                  <path
                    fill="#4285F4"
                    d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C35.64 2.36 30.13 0 24 0 14.61 0 6.48 5.74 2.69 14.09l8.06 6.27C12.6 13.13 17.87 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.1 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.5c-.54 2.9-2.17 5.36-4.62 7.03l7.19 5.59C43.98 37.36 46.1 31.44 46.1 24.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.75 28.36c-.62-1.86-.98-3.84-.98-5.86s.36-4 .98-5.86l-8.06-6.27C1.64 13.61 0 18.57 0 24c0 5.43 1.64 10.39 4.69 14.63l8.06-6.27z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 48c6.13 0 11.64-2.02 15.89-5.5l-7.19-5.59c-2.01 1.35-4.59 2.16-7.7 2.16-6.13 0-11.3-4.13-13.17-9.66l-8.06 6.27C6.48 42.26 14.61 48 24 48z"
                  />
                </g>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
