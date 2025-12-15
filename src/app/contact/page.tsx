"use client"

import React from 'react'
import Navbar from '@/app/component/Navbar/Navbar'
import Breadcrumb from '@/app/component/Breadcrumb/Breadcrumb'
import Footer from '@/app/component/main/footer/footer'
import Features from '@/app/component/main/Features/Features'
import { FaPhone, FaEnvelope, FaLine, FaFacebook, FaYoutube, FaTiktok, FaMapMarkerAlt, FaHeadset } from 'react-icons/fa'

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
            <FaHeadset className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800">ติดต่อเรา</h1>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ช่องทางการติดต่อ</h2>
          
          {/* Main Office */}
          <div className="mb-8">
  
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-red-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">ที่อยู่ :</p>
                  <p className="text-gray-600">เลขที่ XXX</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <FaPhone className="text-blue-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">โทรศัพท์ :</p>
                  <a href="tel:021054757" className="text-blue-600 hover:underline">06X XXX XXXX</a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <FaEnvelope className="text-purple-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">อีเมล :</p>
                  <a href="mailto:info@ihavecpu.com" className="text-blue-600 hover:underline">Favorpc@gmail.com</a>
                </div>
              </div>

              {/* Line ID */}
              <div className="flex items-start gap-3">
                <FaLine className="text-green-500 text-xl mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-700">ไลน์ไอดี :</p>
                  <a href="https://line.me/ti/p/~ihavecpu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@Favorpc</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaFacebook className="text-blue-600 text-2xl" />
                <div>
                  <p className="font-semibold text-gray-700">Facebook :</p>
                  <a href="https://www.facebook.com/IHAVECPU" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Favorpc</a>
                </div>
              </div>
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
