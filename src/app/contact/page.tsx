"use client"

import React from 'react'
import Navbar from '@/app/component/Navbar/Navbar'
import Breadcrumb from '@/app/component/Breadcrumb/Breadcrumb'
import Footer from '@/app/component/main/footer/footer'
import Features from '@/app/component/main/Features/Features'
import { FaPhone, FaEnvelope, FaLine, FaFacebook, FaMapMarkerAlt, FaHeadset } from 'react-icons/fa'

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBanner={false} showPromotion={false} />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Breadcrumb - Optional to keep or remove for pure minimalism, sticking to user request I'll keep it but make it subtle */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'ติดต่อเรา' }]} />
        </div>

        {/* Minimal Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            ช่องทางติดต่อเรา
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
            ปรึกษา สอบถาม หรือแจ้งปัญหาการใช้งาน เราพร้อมดูแลคุณทุกช่องทาง
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Address Card */}
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-default">
            <div className="bg-red-50 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaMapMarkerAlt className="text-2xl text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">ที่อยู่</h3>
            <p className="text-gray-500 leading-relaxed text-sm">
              เลขที่ XXX <br />
              (Location details)
            </p>
          </div>

          {/* Phone Card */}
          <a href="tel:06XXXXXXX" className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaPhone className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">โทรศัพท์</h3>
            <p className="text-gray-500 text-sm mb-1">ติดต่อสอบถามได้ที่</p>
            <span className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              06X XXX XXXX
            </span>
          </a>

          {/* Email Card */}
          <a href="mailto:Favorpc@gmail.com" className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <div className="bg-red-50 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaEnvelope className="text-2xl text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">อีเมล</h3>
            <p className="text-gray-500 text-sm mb-1">ส่งข้อความหาเรา</p>
            <span className="text-lg font-medium text-gray-900 group-hover:text-red-600 transition-colors">
              Favorpc@gmail.com
            </span>
          </a>

          {/* Socials Card */}
          <div className="flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-transparent hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-default">
            <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
              <FaHeadset className="text-2xl text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">โซเชียลมีเดีย</h3>
            <div className="flex flex-col gap-2 mt-2 w-full px-4">
              <a href="https://line.me/ti/p/~ihavecpu" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#00B900] transition-colors py-1">
                <FaLine className="text-xl" />
                <span className="font-medium">@Favorpc</span>
              </a>
              <a href="https://www.facebook.com/IHAVECPU" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-gray-600 hover:text-[#1877F2] transition-colors py-1">
                <FaFacebook className="text-xl" />
                <span className="font-medium">Favorpc</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      <Features />
      <Footer />
    </div>
  )
}

export default ContactPage
