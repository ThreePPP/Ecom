"use client"

import React from 'react'
import Navbar from '@/app/component/Navbar/Navbar'
import Breadcrumb from '@/app/component/Breadcrumb/Breadcrumb'
import Footer from '@/app/component/main/footer/footer'
import Features from '@/app/component/main/Features/Features'
import { FaPhone, FaEnvelope, FaLine, FaFacebook, FaYoutube, FaTiktok, FaMapMarkerAlt } from 'react-icons/fa'

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBanner={false} showPromotion={false} />
      
      <div className="max-w-7xl mx-auto px-10 py-12">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'ติดต่อเรา' }]} />
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-500 rounded-full p-3">
            <FaPhone className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">ติดต่อเรา</h1>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ช่องทางการติดต่อ</h2>
          
          {/* Main Office */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">บริษัท ไอ แอฟ ซีพียู จำกัด (สำนักงานใหญ่)</h3>
            
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-red-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">ที่อยู่ :</p>
                  <p className="text-gray-600">เลขที่ 252 ตำบล หนองแสง อำเภอบางพลี นครปฐม 26130</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <FaPhone className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">โทรศัพท์ :</p>
                  <a href="tel:021054757" className="text-blue-600 hover:underline">02 105 4757</a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-purple-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">อีเมล :</p>
                  <a href="mailto:info@ihavecpu.com" className="text-blue-600 hover:underline">info@ihavecpu.com</a>
                </div>
              </div>

              {/* Line ID */}
              <div className="flex items-start gap-3">
                <FaLine className="text-green-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">ไลน์ไอดี :</p>
                  <a href="https://line.me/ti/p/~ihavecpu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@ihavecpu</a>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">ช่องทางโซเชียลมีเดีย</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaFacebook className="text-blue-600 text-2xl" />
                <div>
                  <p className="font-semibold text-gray-700">Facebook :</p>
                  <a href="https://www.facebook.com/IHAVECPU" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">IHAVECPU</a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <div>
                  <p className="font-semibold text-gray-700">Instagram :</p>
                  <a href="https://www.instagram.com/ihavecpu_official" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ihavecpu_official</a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaYoutube className="text-red-600 text-2xl" />
                <div>
                  <p className="font-semibold text-gray-700">Youtube :</p>
                  <a href="https://www.youtube.com/@IHAVECPU_" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@IHAVECPU_</a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FaTiktok className="text-gray-800 text-2xl" />
                <div>
                  <p className="font-semibold text-gray-700">Tiktok :</p>
                  <a href="https://www.tiktok.com/@IHAVECPU" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@IHAVECPU</a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Contact Sections */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ติดต่อสอบถามข้อมูลสินค้าเพิ่มเติม</h3>
              <p className="text-gray-600">อีเมล : <a href="mailto:services@ihavecpu.com" className="text-blue-600 hover:underline">services@ihavecpu.com</a></p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ติดต่อซื้อสินค้าสำหรับองค์กร</h3>
              <p className="text-gray-600">อีเมล : <a href="mailto:commercial@ihavecpu.com" className="text-blue-600 hover:underline">commercial@ihavecpu.com</a></p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">ติดต่อฝ่ายการตลาด</h3>
              <p className="text-gray-600">อีเมล : <a href="mailto:mkt@ihavecpu.com" className="text-blue-600 hover:underline">mkt@ihavecpu.com</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ContactPage
