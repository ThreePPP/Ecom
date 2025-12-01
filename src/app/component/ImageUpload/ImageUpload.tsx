'use client';

import { useState, useRef } from 'react';
import { uploadAPI } from '@/app/lib/api';

interface ImageUploadProps {
  onUploadSuccess: (imageUrl: string) => void;
  currentImage?: string;
  label?: string;
}

export default function ImageUpload({ onUploadSuccess, currentImage, label = 'อัพโหลดรูปภาพ' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ฟังก์ชันบีบอัดรูปภาพ
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // คงขนาดรูปเดิม
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('ไม่สามารถสร้าง canvas context'));
            return;
          }

          // วาดรูปลงบน canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // แปลงเป็น blob โดยบีบอัดที่ quality 0.7 (70%)
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('ไม่สามารถบีบอัดรูปภาพ'));
                return;
              }
              
              // สร้าง File object ใหม่จาก blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              
              resolve(compressedFile);
            },
            'image/jpeg',
            0.7 // คุณภาพ 70%
          );
        };
        img.onerror = () => reject(new Error('ไม่สามารถโหลดรูปภาพ'));
      };
      reader.onerror = () => reject(new Error('ไม่สามารถอ่านไฟล์'));
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // บีบอัดรูปภาพ
      const compressedFile = await compressImage(file);

      // แสดง preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Upload ไฟล์ที่บีบอัดแล้ว
      const response = await uploadAPI.uploadImage(compressedFile);
      
      if (response.success) {
        onUploadSuccess(response.data.url);
      }
    } catch (err: any) {
      // จัดการกับ 401 Unauthorized errors
      if (err.message?.includes('401') || err.message?.includes('ยืนยันตัวตน') || err.message?.includes('เข้าสู่ระบบ')) {
        setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลด');
      }
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview('');
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex flex-col gap-4">
        {/* Preview */}
        {preview && (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className={`px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex items-center gap-2 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                <span>กำลังอัพโหลด...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{preview ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            รองรับ: JPG, PNG, GIF, WebP (รูปจะถูกบีบอัดอัตโนมัติ)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
