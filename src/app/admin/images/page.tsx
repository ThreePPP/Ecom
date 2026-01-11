'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../lib/api';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';
import { useToast } from '@/app/component/Toast/Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface Product {
  _id: string;
  name: string;
  images?: string[];
  coverImage?: string;
  detailCoverImage?: string;
}

interface ImageCheckResult {
  url: string;
  exists: boolean;
  productId: string;
  productName: string;
  imageType: 'images' | 'coverImage' | 'detailCoverImage';
  index?: number;
}

interface OrphanImage {
  filename: string;
  url: string;
  size?: number;
  lastModified?: string;
}

export default function AdminImagesPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const { showSuccessToast, showErrorToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkResults, setCheckResults] = useState<ImageCheckResult[]>([]);
  const [orphanImages, setOrphanImages] = useState<OrphanImage[]>([]);
  const [activeTab, setActiveTab] = useState<'broken' | 'orphan'>('broken');
  const [checkProgress, setCheckProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');
  const [selectedBroken, setSelectedBroken] = useState<Set<string>>(new Set());
  const [selectedOrphans, setSelectedOrphans] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllProducts();
      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Check if image URL exists
  const checkImageExists = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Check all product images
  const checkAllImages = async () => {
    setChecking(true);
    setCheckResults([]);
    const results: ImageCheckResult[] = [];
    
    // Collect all image URLs to check
    const imagesToCheck: { url: string; productId: string; productName: string; imageType: 'images' | 'coverImage' | 'detailCoverImage'; index?: number }[] = [];
    
    products.forEach(product => {
      // Check images array
      if (product.images && product.images.length > 0) {
        product.images.forEach((url, index) => {
          if (url) {
            imagesToCheck.push({
              url,
              productId: product._id,
              productName: product.name,
              imageType: 'images',
              index
            });
          }
        });
      }
      
      // Check cover image
      if (product.coverImage) {
        imagesToCheck.push({
          url: product.coverImage,
          productId: product._id,
          productName: product.name,
          imageType: 'coverImage'
        });
      }
      
      // Check detail cover image
      if (product.detailCoverImage) {
        imagesToCheck.push({
          url: product.detailCoverImage,
          productId: product._id,
          productName: product.name,
          imageType: 'detailCoverImage'
        });
      }
    });

    setCheckProgress({ current: 0, total: imagesToCheck.length });

    // Check images in batches
    const batchSize = 10;
    for (let i = 0; i < imagesToCheck.length; i += batchSize) {
      const batch = imagesToCheck.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (img) => {
          const exists = await checkImageExists(img.url);
          return {
            ...img,
            exists
          };
        })
      );
      results.push(...batchResults);
      setCheckProgress({ current: Math.min(i + batchSize, imagesToCheck.length), total: imagesToCheck.length });
    }

    // Filter to show only broken images
    const brokenImages = results.filter(r => !r.exists);
    setCheckResults(brokenImages);
    setChecking(false);
  };

  // Check for orphan images (images in uploads folder not used by any product)
  const checkOrphanImages = async () => {
    setChecking(true);
    setOrphanImages([]);
    
    try {
      const token = localStorage.getItem('token');
      // Get list of uploaded files from server
      const response = await fetch(`${API_URL}/upload/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงรายการไฟล์ได้');
      }
      const data = await response.json();
      const uploadedFiles: { filename: string; size: number; createdAt: string; modifiedAt: string }[] = data.data?.files || [];

      // Collect all image URLs used by products
      const usedImages = new Set<string>();
      products.forEach(product => {
        if (product.images) {
          product.images.forEach(url => {
            if (url) {
              // Extract filename from URL
              const filename = url.split('/').pop();
              if (filename) usedImages.add(filename);
            }
          });
        }
        if (product.coverImage) {
          const filename = product.coverImage.split('/').pop();
          if (filename) usedImages.add(filename);
        }
        if (product.detailCoverImage) {
          const filename = product.detailCoverImage.split('/').pop();
          if (filename) usedImages.add(filename);
        }
      });

      // Find orphan images
      const orphans: OrphanImage[] = uploadedFiles
        .filter(file => !usedImages.has(file.filename))
        .map(file => ({
          filename: file.filename,
          url: `${API_URL.replace('/api', '')}/uploads/${file.filename}`,
          size: file.size,
          lastModified: file.modifiedAt
        }));

      setOrphanImages(orphans);
    } catch (err: any) {
      console.error('Error checking orphan images:', err);
      showErrorToast(err.message || 'ไม่สามารถตรวจสอบรูปภาพที่ไม่ได้ใช้งานได้');
    } finally {
      setChecking(false);
    }
  };

  // Remove broken image reference from product
  const removeBrokenImage = async (result: ImageCheckResult) => {
    if (!confirm(`ต้องการลบรูปภาพนี้ออกจากสินค้า "${result.productName}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const product = products.find(p => p._id === result.productId);
      if (!product) return;

      let updateData: any = {};

      if (result.imageType === 'images' && result.index !== undefined) {
        // Remove from images array
        const newImages = [...(product.images || [])];
        newImages.splice(result.index, 1);
        updateData.images = newImages;
      } else if (result.imageType === 'coverImage') {
        updateData.coverImage = '';
      } else if (result.imageType === 'detailCoverImage') {
        updateData.detailCoverImage = '';
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/products/${result.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        // Remove from results
        setCheckResults(prev => prev.filter(r => 
          !(r.productId === result.productId && r.url === result.url)
        ));
        // Refresh products
        fetchProducts();
        showSuccessToast('ลบรูปภาพที่เสียออกจากสินค้าแล้ว');
      } else {
        throw new Error('ไม่สามารถอัพเดทสินค้าได้');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  // Delete orphan image file
  const deleteOrphanImage = async (orphan: OrphanImage) => {
    if (!confirm(`ต้องการลบไฟล์ "${orphan.filename}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/upload/${orphan.filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setOrphanImages(prev => prev.filter(o => o.filename !== orphan.filename));
        showSuccessToast('ลบไฟล์รูปภาพแล้ว');
      } else {
        throw new Error('ไม่สามารถลบไฟล์ได้');
      }
    } catch (err: any) {
      showErrorToast(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  // Delete all broken images
  const removeAllBrokenImages = async () => {
    if (checkResults.length === 0) return;
    
    if (!confirm(`ต้องการลบรูปภาพที่เสียทั้งหมด ${checkResults.length} รูปใช่หรือไม่?`)) {
      return;
    }

    for (const result of checkResults) {
      await removeBrokenImage(result);
    }
  };

  // Toggle selection for broken image
  const toggleBrokenSelection = (key: string) => {
    setSelectedBroken(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Toggle selection for orphan image
  const toggleOrphanSelection = (filename: string) => {
    setSelectedOrphans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return newSet;
    });
  };

  // Select/Deselect all broken images
  const toggleAllBroken = () => {
    if (selectedBroken.size === checkResults.length) {
      setSelectedBroken(new Set());
    } else {
      setSelectedBroken(new Set(checkResults.map(r => `${r.productId}-${r.url}`)));
    }
  };

  // Select/Deselect all orphan images
  const toggleAllOrphans = () => {
    if (selectedOrphans.size === orphanImages.length) {
      setSelectedOrphans(new Set());
    } else {
      setSelectedOrphans(new Set(orphanImages.map(o => o.filename)));
    }
  };

  // Delete selected broken images
  const deleteSelectedBroken = async () => {
    if (selectedBroken.size === 0) return;
    
    if (!confirm(`ต้องการลบรูปภาพที่เลือก ${selectedBroken.size} รูปใช่หรือไม่?`)) {
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;

    for (const key of selectedBroken) {
      const result = checkResults.find(r => `${r.productId}-${r.url}` === key);
      if (!result) continue;

      try {
        const product = products.find(p => p._id === result.productId);
        if (!product) continue;

        let updateData: any = {};

        if (result.imageType === 'images' && result.index !== undefined) {
          const newImages = [...(product.images || [])];
          newImages.splice(result.index, 1);
          updateData.images = newImages;
        } else if (result.imageType === 'coverImage') {
          updateData.coverImage = '';
        } else if (result.imageType === 'detailCoverImage') {
          updateData.detailCoverImage = '';
        }

        const response = await fetch(`${API_URL}/products/${result.productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    // Update state
    setCheckResults(prev => prev.filter(r => !selectedBroken.has(`${r.productId}-${r.url}`)));
    setSelectedBroken(new Set());
    fetchProducts();
    setIsDeleting(false);
    showSuccessToast(`ลบสำเร็จ ${successCount} รูป${failCount > 0 ? `, ล้มเหลว ${failCount} รูป` : ''}`);
  };

  // Delete selected orphan images
  const deleteSelectedOrphans = async () => {
    if (selectedOrphans.size === 0) return;
    
    if (!confirm(`ต้องการลบไฟล์ที่เลือก ${selectedOrphans.size} ไฟล์ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      return;
    }

    setIsDeleting(true);
    const token = localStorage.getItem('token');
    let successCount = 0;
    let failCount = 0;

    for (const filename of selectedOrphans) {
      try {
        const response = await fetch(`${API_URL}/upload/${filename}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }

    // Update state
    setOrphanImages(prev => prev.filter(o => !selectedOrphans.has(o.filename)));
    setSelectedOrphans(new Set());
    setIsDeleting(false);
    showSuccessToast(`ลบสำเร็จ ${successCount} ไฟล์${failCount > 0 ? `, ล้มเหลว ${failCount} ไฟล์` : ''}`);
  };

  // Get image type label
  const getImageTypeLabel = (type: string) => {
    switch (type) {
      case 'images': return 'รูปภาพสินค้า';
      case 'coverImage': return 'รูปปก';
      case 'detailCoverImage': return 'รูปปกหน้ารายละเอียด';
      default: return type;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'ตรวจสอบรูปภาพ' }]} />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🖼️ ตรวจสอบรูปภาพสินค้า</h1>
          <p className="text-gray-600 mt-2">ตรวจสอบและจัดการรูปภาพที่เสียหายหรือไม่ได้ใช้งาน</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-blue-600">{products.length}</div>
            <div className="text-gray-600 text-sm">สินค้าทั้งหมด</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-green-600">
              {products.reduce((sum, p) => sum + (p.images?.length || 0), 0)}
            </div>
            <div className="text-gray-600 text-sm">รูปภาพสินค้าทั้งหมด</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-red-600">{checkResults.length}</div>
            <div className="text-gray-600 text-sm">รูปภาพที่เสีย</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-3xl font-bold text-yellow-600">{orphanImages.length}</div>
            <div className="text-gray-600 text-sm">รูปภาพที่ไม่ได้ใช้</div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🔍 ตรวจสอบรูปภาพ</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={checkAllImages}
              disabled={checking}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                checking
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {checking ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  กำลังตรวจสอบ... ({checkProgress.current}/{checkProgress.total})
                </>
              ) : (
                <>
                  🔍 ตรวจสอบรูปภาพที่เสีย
                </>
              )}
            </button>

            <button
              onClick={checkOrphanImages}
              disabled={checking}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                checking
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }`}
            >
              🗑️ ตรวจสอบรูปภาพที่ไม่ได้ใช้
            </button>

            {checkResults.length > 0 && (
              <button
                onClick={removeAllBrokenImages}
                className="px-6 py-3 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
              >
                🗑️ ลบรูปที่เสียทั้งหมด ({checkResults.length})
              </button>
            )}

            {orphanImages.length > 0 && activeTab === 'orphan' && (
              <button
                onClick={deleteSelectedOrphans}
                disabled={selectedOrphans.size === 0 || isDeleting}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  selectedOrphans.size === 0 || isDeleting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    กำลังลบ...
                  </>
                ) : (
                  <>🗑️ ลบไฟล์ที่เลือก ({selectedOrphans.size})</>
                )}
              </button>
            )}

            {checkResults.length > 0 && activeTab === 'broken' && (
              <button
                onClick={deleteSelectedBroken}
                disabled={selectedBroken.size === 0 || isDeleting}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                  selectedBroken.size === 0 || isDeleting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    กำลังลบ...
                  </>
                ) : (
                  <>🗑️ ลบรูปที่เลือก ({selectedBroken.size})</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('broken')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'broken'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ❌ รูปภาพที่เสีย ({checkResults.length})
              </button>
              <button
                onClick={() => setActiveTab('orphan')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'orphan'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🗂️ รูปภาพที่ไม่ได้ใช้ ({orphanImages.length})
              </button>
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'broken' && (
              <>
                {checkResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    {checking ? (
                      <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p>กำลังตรวจสอบรูปภาพ...</p>
                        <p className="text-sm mt-2">{checkProgress.current} / {checkProgress.total}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-5xl mb-4">✅</p>
                        <p>ไม่พบรูปภาพที่เสีย</p>
                        <p className="text-sm mt-2">กดปุ่ม "ตรวจสอบรูปภาพที่เสีย" เพื่อเริ่มตรวจสอบ</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedBroken.size === checkResults.length && checkResults.length > 0}
                        onChange={toggleAllBroken}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">
                        {selectedBroken.size === checkResults.length && checkResults.length > 0 ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                        {selectedBroken.size > 0 && ` (เลือก ${selectedBroken.size} รายการ)`}
                      </span>
                    </div>
                    {checkResults.map((result, index) => {
                      const key = `${result.productId}-${result.url}`;
                      return (
                      <div key={index} className={`flex items-center gap-4 p-4 rounded-lg border ${selectedBroken.has(key) ? 'bg-red-100 border-red-400' : 'bg-red-50 border-red-200'}`}>
                        <input
                          type="checkbox"
                          checked={selectedBroken.has(key)}
                          onChange={() => toggleBrokenSelection(key)}
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          <span className="text-3xl">❌</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{result.productName}</h3>
                          <p className="text-sm text-gray-500">
                            {getImageTypeLabel(result.imageType)}
                            {result.index !== undefined && ` (ลำดับที่ ${result.index + 1})`}
                          </p>
                          <p className="text-xs text-red-600 truncate mt-1" title={result.url}>
                            {result.url}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/admin/products?edit=${result.productId}`)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                          >
                            แก้ไขสินค้า
                          </button>
                          <button
                            onClick={() => removeBrokenImage(result)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                          >
                            ลบรูปนี้
                          </button>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </>
            )}

            {activeTab === 'orphan' && (
              <>
                {orphanImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-5xl mb-4">📁</p>
                    <p>ไม่พบรูปภาพที่ไม่ได้ใช้งาน</p>
                    <p className="text-sm mt-2">กดปุ่ม "ตรวจสอบรูปภาพที่ไม่ได้ใช้" เพื่อเริ่มตรวจสอบ</p>
                    <p className="text-xs mt-4 text-yellow-600">
                      หมายเหตุ: ฟีเจอร์นี้ต้องมี API endpoint สำหรับดึงรายการไฟล์จาก server
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg mb-4">
                      <input
                        type="checkbox"
                        checked={selectedOrphans.size === orphanImages.length && orphanImages.length > 0}
                        onChange={toggleAllOrphans}
                        className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                      <span className="font-medium text-gray-700">
                        {selectedOrphans.size === orphanImages.length && orphanImages.length > 0 ? 'ยกเลิกเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                        {selectedOrphans.size > 0 && ` (เลือก ${selectedOrphans.size} ไฟล์)`}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {orphanImages.map((orphan, index) => (
                      <div key={index} className={`rounded-lg border p-2 ${selectedOrphans.has(orphan.filename) ? 'bg-yellow-100 border-yellow-400' : 'bg-yellow-50 border-yellow-200'}`}>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedOrphans.has(orphan.filename)}
                            onChange={() => toggleOrphanSelection(orphan.filename)}
                            className="absolute top-1 left-1 w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 z-10"
                          />
                        </div>
                        <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden cursor-pointer" onClick={() => toggleOrphanSelection(orphan.filename)}>
                          <img
                            src={orphan.url}
                            alt={orphan.filename}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.jpg';
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 truncate mb-2" title={orphan.filename}>
                          {orphan.filename}
                        </p>
                        <button
                          onClick={() => deleteOrphanImage(orphan)}
                          className="w-full px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          ลบไฟล์
                        </button>
                      </div>
                    ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">ℹ️ คำอธิบาย</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>รูปภาพที่เสีย</strong> - รูปภาพที่ URL ไม่สามารถเข้าถึงได้ (ไฟล์ถูกลบหรือย้าย)</li>
            <li>• <strong>รูปภาพที่ไม่ได้ใช้</strong> - ไฟล์รูปภาพที่อยู่ใน server แต่ไม่ได้ถูกใช้งานโดยสินค้าใดๆ</li>
            <li>• การลบรูปภาพที่เสียจะลบเฉพาะ reference ในฐานข้อมูล ไม่ได้ลบไฟล์จริง</li>
            <li>• การลบรูปภาพที่ไม่ได้ใช้จะลบไฟล์ออกจาก server ถาวร</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
