import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ช้อปสินค้า */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4 pb-2 border-b-1 border-gray-400">ช้อปสินค้า</h3>
            <ul className="space-y-2 mt-4">
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  สินค้าใหม่
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  โปรโมชั่นออนไลน์
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  Flash Sales
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  คู่มือซื้อปั้ง
                </Link>
              </li>
            </ul>
          </div>

          {/* บริการของเรา */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4 pb-2 border-b-1 border-gray-400">บริการของเรา</h3>
            <ul className="space-y-2 mt-4">
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  การจัดส่งสินค้า
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  การยกเลิกการสั่งซื้อสินค้า
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  การคืนสินค้าและการคืนเงิน
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  เช็คสถานะการจัดส่ง
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  เงื่อนไขการจัดส่งสินค้า
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                  เงื่อนไขการรับประกัน
                </Link>
              </li>
            </ul>
          </div>

          {/* ติดต่อเรา */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4 pb-2 border-b-1 border-gray-400">ติดต่อเรา</h3>
            <div className="space-y-3 mt-4">
              <Link href="tel:02-xxx-xxxx" className="text-blue-600 hover:text-blue-700 text-base block">
                โทร.XXXX หรือ XX-XXX-XXXX
              </Link>
              <p className="text-gray-800 font-semibold text-base">ติดตามเราได้ทุกช่องทาง</p>
              <div className="flex gap-3">
                <Link href="#" className="hover:opacity-80">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                </Link>
                <Link href="#" className="hover:opacity-80">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                  </div>
                </Link>
                <Link href="#" className="hover:opacity-80">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-blue-900 py-4 flex justify-center">
        <div className="max-w-7xl mx-auto px-10">
          <p className="text-white text-sm">
            Copyright © 2025 www.favorpc.com All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
