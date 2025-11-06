'use client';

import { useState, useRef } from 'react';
import { uploadAPI } from '@/app/lib/api';

interface MultipleImageUploadProps {
  onUploadSuccess: (imageUrls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
  label?: string;
}

export default function MultipleImageUpload({ 
  onUploadSuccess, 
  currentImages = [], 
  maxImages = 10,
  label = 'อัพโหลดรูปภาพหลายรูป'
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // ตรวจสอบจำนวนรูป
    if (previews.length + files.length > maxImages) {
      setError(`สามารถอัพโหลดได้สูงสุด ${maxImages} รูป`);
      return;
    }

    // ตรวจสอบขนาดและประเภทไฟล์
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        return;
      }
    }

    setError('');
    setUploading(true);

    try {
      // แสดง preview
      const newPreviews: string[] = [];
      for (const file of files) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === files.length) {
            setPreviews([...previews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }

      // Upload ไฟล์
      const response = await uploadAPI.uploadMultipleImages(files);
      
      if (response.success) {
        const imageUrls = response.data.images.map((img: any) => img.url);
        onUploadSuccess([...currentImages, ...imageUrls]);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลด');
      setPreviews(currentImages);
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onUploadSuccess(newPreviews);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} ({previews.length}/{maxImages})
      </label>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-300"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {previews.length < maxImages && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={uploading}
            className={`w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 ${
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
                <span>เลือกรูปภาพ (เลือกได้หลายรูป)</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            รองรับ: JPG, PNG, GIF, WebP (สูงสุด 5MB ต่อรูป)
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
