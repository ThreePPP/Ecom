'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../component/ImageUpload/ImageUpload';
import MultipleImageUpload from '../component/ImageUpload/MultipleImageUpload';

export default function TestUploadPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [singleImageUrl, setSingleImageUrl] = useState('');
  const [multipleImageUrls, setMultipleImageUrls] = useState<string[]>([]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h2>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ทดสอบอัพโหลดรูปภาพ</h1>
          <p className="text-gray-600">ทดสอบระบบอัพโหลดรูปภาพและแปลงเป็น URL</p>
        </div>

        <div className="space-y-8">
          {/* Single Image Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">อัพโหลดรูปเดี่ยว</h2>
            
            <ImageUpload
              label="เลือกรูปภาพ"
              currentImage={singleImageUrl}
              onUploadSuccess={(url) => {
                setSingleImageUrl(url);
                console.log('Single image URL:', url);
              }}
            />

            {singleImageUrl && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">URL ที่ได้:</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={singleImageUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(singleImageUrl);
                      alert('คัดลอกแล้ว!');
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    คัดลอก
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Multiple Images Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">อัพโหลดหลายรูป</h2>
            
            <MultipleImageUpload
              label="เลือกรูปภาพหลายรูป"
              currentImages={multipleImageUrls}
              maxImages={10}
              onUploadSuccess={(urls) => {
                setMultipleImageUrls(urls);
                console.log('Multiple image URLs:', urls);
              }}
            />

            {multipleImageUrls.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  URL ทั้งหมด ({multipleImageUrls.length} รูป):
                </h3>
                <div className="space-y-2">
                  {multipleImageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-gray-600 text-sm w-8">{index + 1}.</span>
                      <input
                        type="text"
                        value={url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(url);
                          alert('คัดลอกแล้ว!');
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        คัดลอก
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(multipleImageUrls.join('\n'));
                    alert('คัดลอกทั้งหมดแล้ว!');
                  }}
                  className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  คัดลอกทั้งหมด
                </button>
              </div>
            )}
          </div>

          {/* API Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">API Endpoints</h2>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 rounded">
                <div className="font-mono font-semibold text-blue-900">POST /api/upload</div>
                <p className="text-gray-600 mt-1">อัพโหลดรูปเดี่ยว (field: image)</p>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="font-mono font-semibold text-green-900">POST /api/upload/multiple</div>
                <p className="text-gray-600 mt-1">อัพโหลดหลายรูป (field: images, สูงสุด 10 รูป)</p>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <div className="font-mono font-semibold text-red-900">DELETE /api/upload/:filename</div>
                <p className="text-gray-600 mt-1">ลบรูปภาพ</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <div className="font-mono font-semibold text-purple-900">GET /uploads/:filename</div>
                <p className="text-gray-600 mt-1">เข้าถึงไฟล์รูปภาพที่อัพโหลด</p>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ข้อกำหนด</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>รองรับไฟล์: JPEG, JPG, PNG, GIF, WebP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>ขนาดไฟล์สูงสุด: 5MB ต่อรูป</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>อัพโหลดพร้อมกันได้สูงสุด: 10 รูป</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>ต้องเข้าสู่ระบบก่อนใช้งาน</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>ไฟล์จะถูกเก็บใน server/uploads/</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>ชื่อไฟล์จะถูกสร้างแบบ unique อัตโนมัติ</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    </div>
  );
}
