import React, { useState } from 'react';
import RegisterModal from './RegisterModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  if (!isOpen && !isRegisterOpen) return null;

  return (
    <>
      {/* Login Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-8 min-w-[350px] max-w-[95vw] relative flex flex-col items-center">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={onClose}
              aria-label="close"
            >
              &times;
            </button>
            <h1 className="text-3xl font-bold text-blue-700 mb-1 tracking-wide select-none">Favcom</h1>
            <div className="text-blue-600 text-sm mb-4 text-center select-none">ศูนย์รวมสินค้าไอทีมือสองครบครบจบที่เดียว</div>
            <h2 className="text-lg text-black font-semibold mb-6 text-center">ยินดีต้อนรับ</h2>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <button className="flex items-center gap-3 px-4 py-2 border rounded-full bg-white hover:bg-gray-50 shadow-sm font-medium text-gray-800">
                <svg width="24" height="24" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C35.64 2.36 30.13 0 24 0 14.61 0 6.48 5.74 2.69 14.09l8.06 6.27C12.6 13.13 17.87 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.5c0-1.64-.15-3.22-.43-4.75H24v9h12.5c-.54 2.9-2.17 5.36-4.62 7.03l7.19 5.59C43.98 37.36 46.1 31.44 46.1 24.5z"/><path fill="#FBBC05" d="M10.75 28.36c-.62-1.86-.98-3.84-.98-5.86s.36-4 .98-5.86l-8.06-6.27C1.64 13.61 0 18.57 0 24c0 5.43 1.64 10.39 4.69 14.63l8.06-6.27z"/><path fill="#EA4335" d="M24 48c6.13 0 11.64-2.02 15.89-5.5l-7.19-5.59c-2.01 1.35-4.59 2.16-7.7 2.16-6.13 0-11.3-4.13-13.17-9.66l-8.06 6.27C6.48 42.26 14.61 48 24 48z"/></g></svg>
                ดำเนินการต่อด้วยบัญชี Google
              </button>
            </div>
            <div className="flex items-center w-full max-w-xs my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="mx-2 text-gray-400 text-sm">หรือ</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <button className="flex items-center gap-3 px-4 py-2 border rounded-full bg-white hover:bg-gray-50 shadow-sm font-medium text-gray-800 w-full max-w-xs mb-2">
              <svg width="24" height="24" viewBox="0 0 48 48"><g><rect width="48" height="48" rx="24" fill="#F2F2F2"/><path d="M14 18v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V18c0-1.1-.9-2-2-2H16c-1.1 0-2 .9-2 2zm16 0l-8 5-8-5" fill="#333"/></g></svg>
              เข้าสู่ระบบด้วย Email
            </button>
            <div className="text-center mt-4 text-sm text-gray-500">
              ยังไม่ได้เป็นสมาชิก ? <button className="text-blue-600 font-medium hover:underline" onClick={() => { setRegisterOpen(true); onClose(); }}>สมัครสมาชิกเลย</button>
            </div>
            <div className="text-center mt-2 text-xs text-gray-400">
              เมื่อเข้าสู่ระบบ ถือว่าคุณได้ยอมรับและรับทราบ <a href="#" className="text-blue-600 hover:underline">นโยบายความเป็นส่วนตัว</a> ของ Favcom แล้ว
            </div>
          </div>
        </div>
      )}
      {/* Register Modal */}
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setRegisterOpen(false)} />
    </>
  );
};

export default LoginModal;
