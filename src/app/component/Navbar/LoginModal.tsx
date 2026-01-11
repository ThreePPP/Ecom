import React, { useState } from 'react';
import RegisterModal from './RegisterModal';
import type { types } from '@/app/util/types';
import { useAuth } from '@/app/context/AuthContext';


const LoginModal: React.FC<types> = ({ isOpen, onClose, onOpen }) => {
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  if (!isOpen && !isRegisterOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      onClose?.();
      window.location.reload(); // Reload to update user state
    } catch (err: any) {
      setError(err.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Login Modal */}
      {isOpen && !showEmailForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-[95vw] sm:max-w-[400px] lg:max-w-[420px] relative flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 text-xl sm:text-2xl"
              onClick={onClose}
              aria-label="close"
            >
              &times;
            </button>
            <img src="/Logo/logo_B.png" alt="Logo" className="w-40 sm:w-48 lg:w-60 h-auto mb-3 sm:mb-4" />
            <div className="text-blue-600 text-xs sm:text-sm mb-3 sm:mb-4 text-center select-none">ศูนย์รวมสินค้าไอทีมือสองครบครบจบที่เดียว</div>
            <h2 className="text-base sm:text-lg text-black font-semibold mb-4 sm:mb-6 text-center">ยินดีต้อนรับ</h2>
            <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-xs">
              <button className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-full bg-white hover:bg-gray-50 shadow-sm font-medium text-gray-800 text-sm sm:text-base">
                <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C35.64 2.36 30.13 0 24 0 14.61 0 6.48 5.74 2.69 14.09l8.06 6.27C12.6 13.13 17.87 9.5 24 9.5z" /><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.5c-.54 2.9-2.17 5.36-4.62 7.03l7.19 5.59C43.98 37.36 46.1 31.44 46.1 24.5z" /><path fill="#FBBC05" d="M10.75 28.36c-.62-1.86-.98-3.84-.98-5.86s.36-4 .98-5.86l-8.06-6.27C1.64 13.61 0 18.57 0 24c0 5.43 1.64 10.39 4.69 14.63l8.06-6.27z" /><path fill="#EA4335" d="M24 48c6.13 0 11.64-2.02 15.89-5.5l-7.19-5.59c-2.01 1.35-4.59 2.16-7.7 2.16-6.13 0-11.3-4.13-13.17-9.66l-8.06 6.27C6.48 42.26 14.61 48 24 48z" /></g></svg>
                ดำเนินการต่อด้วยบัญชี Google
              </button>
            </div>
            <div className="flex items-center w-full max-w-xs my-3 sm:my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="mx-2 text-gray-400 text-xs sm:text-sm">หรือ</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <button
              onClick={() => setShowEmailForm(true)}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-full bg-white hover:bg-gray-50 shadow-sm font-medium text-gray-800 text-sm sm:text-base w-full max-w-xs mb-2">
              <svg width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 48 48"><g><rect width="48" height="48" rx="24" fill="#F2F2F2" /><path d="M14 18v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V18c0-1.1-.9-2-2-2H16c-1.1 0-2 .9-2 2zm16 0l-8 5-8-5" fill="#333" /></g></svg>
              เข้าสู่ระบบด้วย Email
            </button>
            <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
              ยังไม่ได้เป็นสมาชิก ? <button className="text-blue-600 font-medium hover:underline" onClick={() => { setRegisterOpen(true); onClose(); }}>สมัครสมาชิกเลย</button>
            </div>
            <div className="text-center mt-2 text-[10px] sm:text-xs text-gray-400 px-2">
              เมื่อเข้าสู่ระบบ ถือว่าคุณได้ยอมรับและรับทราบ <a href="#" className="text-blue-600 hover:underline">นโยบายความเป็นส่วนตัว</a> ของ favorpc.top แล้ว
            </div>
          </div>
        </div>
      )}

      {/* Email Login Form */}
      {isOpen && showEmailForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full max-w-[95vw] sm:max-w-[400px] lg:max-w-[420px] relative flex flex-col items-center max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 text-xl sm:text-2xl"
              onClick={() => {
                setShowEmailForm(false);
                setError("");
              }}
              aria-label="close"
            >
              &times;
            </button>
            <button
              className="absolute top-3 left-3 sm:top-4 sm:left-4 text-gray-400 hover:text-gray-700 text-lg sm:text-xl"
              onClick={() => setShowEmailForm(false)}
            >
              ←
            </button>
            <img src="/Logo/logo_B.png" alt="Logo" className="w-40 sm:w-48 lg:w-60 h-auto mb-3 sm:mb-4" />
            <h2 className="text-base sm:text-lg text-black font-semibold mb-4 sm:mb-6 text-center">เข้าสู่ระบบด้วย Email</h2>

            {error && (
              <div className="w-full max-w-xs bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 rounded mb-3 sm:mb-4 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-black font-medium mb-1">อีเมล</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 sm:py-2.5 text-black text-sm sm:text-base"
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-black font-medium mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 sm:py-2.5 text-black text-sm sm:text-base"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white font-bold py-2 sm:py-2.5 rounded-full text-sm sm:text-base hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
              ยังไม่ได้เป็นสมาชิก ? <button className="text-blue-600 font-medium hover:underline" onClick={() => { setShowEmailForm(false); setRegisterOpen(true); onClose(); }}>สมัครสมาชิกเลย</button>
            </div>
          </div>
        </div>
      )}
      {/* Register Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setRegisterOpen(false)}
        onOpen={() => {
          setRegisterOpen(false);
          onOpen?.();
        }}
      />
    </>
  );
};

export default LoginModal;
