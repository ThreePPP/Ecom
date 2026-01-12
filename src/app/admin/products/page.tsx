'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { productAPI, adminAPI } from '../../lib/api';
import MultipleImageUpload from '../../component/ImageUpload/MultipleImageUpload';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';
import { useToast } from '@/app/component/Toast/Toast';
import { getImageUrl } from "@/app/utils/imageUrl";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  brand?: string;
  stock: number;
  image?: string; // for backward compatibility
  images?: string[]; // new format
  coverImage?: string; // cover image
  detailCoverImage?: string; // detail page cover image
  condition?: string;
  description: string;
  specifications?: Record<string, string>; // specifications data
  isFeatured: boolean;
  isFlashSale: boolean;
  showInCategory: boolean;
  flashSaleEndTime?: string;
  rating?: number;
  reviewCount?: number;
  sold?: number;
  isActive?: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const { showSuccessToast, showErrorToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailCoverModal, setShowDetailCoverModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filter states for modal
  const [modalFilterBrand, setModalFilterBrand] = useState('');
  const [modalFilterCondition, setModalFilterCondition] = useState('');
  const [modalFilterCategory, setModalFilterCategory] = useState('');
  const [modalSelectedSocket, setModalSelectedSocket] = useState('');
  const [modalSelectedModel, setModalSelectedModel] = useState('');
  const [modalSelectedMainboardSupport, setModalSelectedMainboardSupport] = useState('');
  const [modalSelectedCapacity, setModalSelectedCapacity] = useState('');
  const [modalSelectedMaxPower, setModalSelectedMaxPower] = useState('');
  // Additional specifications
  const [modalSelectedGpuSeries, setModalSelectedGpuSeries] = useState('');
  const [modalSelectedMemorySize, setModalSelectedMemorySize] = useState('');
  const [modalSelectedBusSpeed, setModalSelectedBusSpeed] = useState('');
  const [modalSelectedChipset, setModalSelectedChipset] = useState('');
  const [modalSelectedCoolerSocket, setModalSelectedCoolerSocket] = useState('');

  // Brand data by category
  const brandsByCategory: Record<string, string[]> = {
    'CPU': ['AMD', 'Intel'],
    'CPU Cooler': ['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'ID-COOLING', 'LIAN LI', 'MSI', 'NZXT', 'THERMALTAKE'],
    'Mainboard': ['ASROCK', 'ASUS', 'GIGABYTE', 'MSI'],
    'VGA': ['ASROCK', 'ASUS', 'COLORFUL', 'GALAX', 'GIGABYTE', 'INNO3D', 'MSI', 'PALIT', 'PNY'],
    'Memory': ['APACER', 'CORSAIR', 'G.SKILL', 'HIKSEMI', 'KINGSTON', 'KLEVV', 'PATRIOT'],
    'RAM': ['APACER', 'CORSAIR', 'G.SKILL', 'HIKSEMI', 'KINGSTON', 'KLEVV', 'PATRIOT'],
    'SSD': ['ADATA', 'KINGSTON', 'KLEVV', 'LEXAR', 'SAMSUNG', 'WD'],
    'Harddisk': ['WD', 'SEAGATE'],
    'Power Supply': ['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'MSI', 'SILVERSTONE', 'THERMALTAKE'],
    'Case': ['AEROCOOL', 'ANTEC', 'ASUS', 'BE QUIET', 'COOLER MASTER', 'CORSAIR', 'DEEPCOOL', 'GIGABYTE', 'LIAN LI', 'MONTECH', 'MSI', 'NZXT', 'THERMALTAKE'],
    'Accessories': [],
  };

  // Get brands for current category
  const getAvailableBrands = (category: string): string[] => {
    return brandsByCategory[category] || [];
  };

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: '',
    brand: '',
    stock: '',
    images: [] as string[],
    coverImage: '',
    detailCoverImage: '',
    condition: 'สภาพเหมือนใหม่',
    description: '',
    isFeatured: false,
    isFlashSale: false,
    showInCategory: true,
    flashSaleEndTime: '',
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
      return;
    }

    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin, authLoading, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      // ตรวจสอบว่ามี token หรือไม่
      const token = localStorage.getItem('token');
      if (!token) {
        setError('กรุณาเข้าสู่ระบบก่อน');
        router.push('/');
        return;
      }

      // ดึงสินค้าทั้งหมดผ่าน admin API (รวมถึง inactive)
      const response = await adminAPI.getAllProducts();

      if (response.success) {
        setProducts(response.data.products);
      }
    } catch (err: any) {
      // จัดการกับ 401 Unauthorized errors
      if (err.message?.includes('401') || err.message?.includes('ยืนยันตัวตน') || err.message?.includes('เข้าสู่ระบบ')) {
        setError('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => router.push('/'), 2000);
      } else {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      // Support both old (image) and new (images) format
      const imageUrls = product.images || (product.image ? [product.image] : []);
      // Format date to datetime-local format (YYYY-MM-DDTHH:mm)
      const flashSaleDate = product.flashSaleEndTime
        ? new Date(product.flashSaleEndTime).toISOString().slice(0, 16)
        : '';
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        discount: product.discount?.toString() || '',
        category: product.category || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        images: imageUrls,
        coverImage: product.coverImage || '',
        detailCoverImage: product.detailCoverImage || '',
        condition: product.condition || 'สภาพเหมือนใหม่',
        description: product.description || '',
        isFeatured: product.isFeatured || false,
        isFlashSale: product.isFlashSale || false,
        showInCategory: product.showInCategory !== undefined ? product.showInCategory : true,
        flashSaleEndTime: flashSaleDate,
      });
      setModalFilterBrand(product.brand || '');
      setModalFilterCondition(product.condition || 'สภาพเหมือนใหม่');
      setModalFilterCategory(product.category || '');
      // Load specifications
      const specs = product.specifications || {};
      setModalSelectedSocket(specs['Socket'] || '');
      setModalSelectedModel(specs['Model'] || '');
      setModalSelectedMainboardSupport(specs['Mainboard Support'] || '');
      setModalSelectedCapacity(specs['Capacity'] || '');
      setModalSelectedMaxPower(specs['Maximum Power'] || '');
      // Load additional specifications
      setModalSelectedGpuSeries(specs['GPU Series'] || '');
      setModalSelectedMemorySize(specs['Memory Size'] || '');
      setModalSelectedBusSpeed(specs['Bus Speed'] || '');
      setModalSelectedChipset(specs['Chipset'] || '');
      setModalSelectedCoolerSocket(specs['Socket Support'] || '');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        discount: '',
        category: '',
        brand: '',
        stock: '',
        images: [],
        coverImage: '',
        detailCoverImage: '',
        condition: 'สภาพเหมือนใหม่',
        description: '',
        isFeatured: false,
        isFlashSale: false,
        showInCategory: true,
        flashSaleEndTime: '',
      });
      setModalFilterBrand('');
      setModalFilterCondition('');
      setModalFilterCategory('');
      setModalSelectedSocket('');
      setModalSelectedModel('');
      setModalSelectedMainboardSupport('');
      setModalSelectedCapacity('');
      setModalSelectedMaxPower('');
      // Reset additional specifications
      setModalSelectedGpuSeries('');
      setModalSelectedMemorySize('');
      setModalSelectedBusSpeed('');
      setModalSelectedChipset('');
      setModalSelectedCoolerSocket('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData: any = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        category: formData.category,
        brand: formData.brand || undefined,
        stock: parseInt(formData.stock),
        images: formData.images,
        coverImage: formData.coverImage || undefined,
        detailCoverImage: formData.detailCoverImage || undefined,
        condition: formData.condition,
        description: formData.description,
        isFeatured: formData.isFeatured,
        isFlashSale: formData.isFlashSale,
        showInCategory: formData.showInCategory,
      };

      // Add flashSaleEndTime only if Flash Sale is checked and date is provided
      if (formData.isFlashSale && formData.flashSaleEndTime) {
        productData.flashSaleEndTime = new Date(formData.flashSaleEndTime).toISOString();
      }

      // Build specifications based on category
      const specifications: Record<string, string> = {};

      if (modalSelectedSocket) {
        specifications['Socket'] = modalSelectedSocket;
      }
      if (modalSelectedModel) {
        specifications['Model'] = modalSelectedModel;
      }
      if (modalSelectedMainboardSupport) {
        specifications['Mainboard Support'] = modalSelectedMainboardSupport;
      }
      if (modalSelectedCapacity) {
        specifications['Capacity'] = modalSelectedCapacity;
      }
      if (modalSelectedMaxPower) {
        specifications['Maximum Power'] = modalSelectedMaxPower;
      }
      // Additional specifications
      if (modalSelectedGpuSeries) {
        specifications['GPU Series'] = modalSelectedGpuSeries;
      }
      if (modalSelectedMemorySize) {
        specifications['Memory Size'] = modalSelectedMemorySize;
      }
      if (modalSelectedBusSpeed) {
        specifications['Bus Speed'] = modalSelectedBusSpeed;
      }
      if (modalSelectedChipset) {
        specifications['Chipset'] = modalSelectedChipset;
      }
      if (modalSelectedCoolerSocket) {
        specifications['Socket Support'] = modalSelectedCoolerSocket;
      }

      // Only add specifications if there are any
      if (Object.keys(specifications).length > 0) {
        productData.specifications = specifications;
      }

      let response;
      if (editingProduct) {
        response = await productAPI.updateProduct(editingProduct._id, productData);
      } else {
        response = await productAPI.createProduct(productData);
      }

      if (response.success) {
        showSuccessToast(editingProduct ? 'อัพเดทสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ');
        handleCloseModal();
        fetchProducts();
      }
    } catch (err: any) {
      // จัดการกับ 401 Unauthorized errors
      if (err.message?.includes('401') || err.message?.includes('ยืนยันตัวตน') || err.message?.includes('เข้าสู่ระบบ') || err.message?.includes('สิทธิ์')) {
        showErrorToast('เซสชันหมดอายุหรือไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      } else {
        showErrorToast(err.message || 'เกิดข้อผิดพลาด');
      }
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`ต้องการลบสินค้า "${productName}" ใช่หรือไม่?`)) {
      return;
    }

    try {
      const response = await productAPI.deleteProduct(productId);

      if (response.success) {
        showSuccessToast('ลบสินค้าสำเร็จ');
        fetchProducts();
      }
    } catch (err: any) {
      // จัดการกับ 401 Unauthorized errors
      if (err.message?.includes('401') || err.message?.includes('ยืนยันตัวตน') || err.message?.includes('เข้าสู่ระบบ') || err.message?.includes('สิทธิ์')) {
        showErrorToast('เซสชันหมดอายุหรือไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      } else {
        showErrorToast(err.message || 'เกิดข้อผิดพลาด');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchSearch && matchCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Breadcrumb items={[
            { label: 'Admin', href: '/admin' },
            { label: 'จัดการสินค้า' }
          ]} />
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการสินค้า</h1>
              <p className="text-gray-600 mt-2">จัดการข้อมูลสินค้าในระบบ</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-medium"
            >
              + เพิ่มสินค้าใหม่
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ค้นหา
              </label>
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หมวดหมู่
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
              >
                <option value="all">ทั้งหมด</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product) => {
            const imageUrl = getImageUrl(product.images?.[0] || product.image) || '/placeholder.png';
            return (
              <div key={product._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.stock < 10 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      สต็อกต่ำ
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-orange-500">
                      {product.price.toLocaleString()} coins
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {product.originalPrice.toLocaleString()} coins
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">
                      หมวดหมู่: {product.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-600">
                      คงเหลือ: {product.stock} ชิ้น
                    </span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    {product.isFeatured && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        แนะนำ
                      </span>
                    )}
                    {product.isFlashSale && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Flash Sale
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(product)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm font-medium"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 text-sm font-medium"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">ไม่พบสินค้า</p>
          </div>
        )}

        {/* Stats and Pagination */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                แสดง {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} จาก {filteredProducts.length} สินค้า (หน้า {currentPage}/{totalPages})
              </div>

              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">แสดง:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black bg-white"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">รายการ</span>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg font-medium text-sm ${currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                title="หน้าแรก"
              >
                ⏮
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium ${currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                ← ก่อนหน้า
              </button>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium ${currentPage === page
                              ? 'bg-orange-500 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
              )}

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-4 py-2 rounded-lg font-medium ${currentPage === totalPages || totalPages === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                ถัดไป →
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-2 rounded-lg font-medium text-sm ${currentPage === totalPages || totalPages === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                title="หน้าสุดท้าย"
              >
                ⏭
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              {/* Quick Filter Section */}
              <div className="rounded-lg p-4 mb-6 border border-gray-200">
                <h3 className="text-sm font-bold text-black mb-4">🔍 Quick Filter & Select</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Brand Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลือกยี่ห้อ (Brand)
                    </label>
                    <select
                      value={modalFilterBrand}
                      onChange={(e) => {
                        setModalFilterBrand(e.target.value);
                        setFormData({ ...formData, brand: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
                    >
                      <option value="">-- เลือกยี่ห้อ --</option>
                      {formData.category && getAvailableBrands(formData.category).length > 0 ? (
                        getAvailableBrands(formData.category).map((brand) => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))
                      ) : (
                        <option value="" disabled>เลือกหมวดหมู่ก่อน</option>
                      )}
                    </select>
                  </div>

                  {/* Condition Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลือกสภาพสินค้า
                    </label>
                    <select
                      value={modalFilterCondition}
                      onChange={(e) => {
                        setModalFilterCondition(e.target.value);
                        setFormData({ ...formData, condition: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
                    >
                      <option value="สภาพเหมือนใหม่">สภาพเหมือนใหม่</option>
                      <option value="สภาพดี">สภาพดี</option>
                      <option value="สภาพพอใช้">สภาพพอใช้</option>
                    </select>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลือกหมวดหมู่
                    </label>
                    <select
                      value={modalFilterCategory}
                      onChange={(e) => {
                        setModalFilterCategory(e.target.value);
                        setFormData({ ...formData, category: e.target.value, brand: '' });
                        setModalFilterBrand('');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-black"
                    >
                      <option value="">-- เลือกหมวดหมู่ --</option>
                      <option value="CPU">CPU</option>
                      <option value="CPU Cooler">CPU Cooler</option>
                      <option value="Mainboard">Mainboard</option>
                      <option value="VGA">VGA</option>
                      <option value="Memory">Memory</option>
                      <option value="Harddisk">Harddisk</option>
                      <option value="SSD">SSD</option>
                      <option value="Power Supply">Power Supply</option>
                      <option value="Case">Case</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category-Specific Filters Section */}
              {formData.category && (
                <div className="rounded-lg p-4 mb-6 border border-gray-200">
                  <h3 className="text-sm font-bold text-black mb-4">📋 {formData.category} - Specification & Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Socket - For CPU and Mainboard */}
                    {(formData.category === 'CPU' || formData.category === 'Mainboard') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Socket</label>
                        <select
                          value={modalSelectedSocket}
                          onChange={(e) => setModalSelectedSocket(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Socket --</option>
                          <option value="AMD AM4">AMD AM4</option>
                          <option value="AMD AM5">AMD AM5</option>
                          <option value="INTEL 1200">INTEL 1200</option>
                          <option value="INTEL 1700">INTEL 1700</option>
                          <option value="INTEL 1851">INTEL 1851</option>
                        </select>
                      </div>
                    )}

                    {/* Model - For CPU */}
                    {formData.category === 'CPU' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                        <select
                          value={modalSelectedModel}
                          onChange={(e) => setModalSelectedModel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Model --</option>
                          {/* Show models based on selected socket */}
                          {!modalSelectedSocket && (
                            <>
                              <option value="AMD Ryzen 3">AMD Ryzen 3</option>
                              <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                              <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                              <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                              <option value="Intel Core Ultra 5">Intel Core Ultra 5</option>
                              <option value="Intel Core Ultra 7">Intel Core Ultra 7</option>
                              <option value="Intel Core Ultra 9">Intel Core Ultra 9</option>
                              <option value="Intel Core i3">Intel Core i3</option>
                              <option value="Intel Core i5">Intel Core i5</option>
                              <option value="Intel Core i7">Intel Core i7</option>
                              <option value="Intel Core i9">Intel Core i9</option>
                            </>
                          )}
                          {/* AMD AM4 - Ryzen 3, 5, 7, 9 */}
                          {modalSelectedSocket === 'AMD AM4' && (
                            <>
                              <option value="AMD Ryzen 3">AMD Ryzen 3</option>
                              <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                              <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                              <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                            </>
                          )}
                          {/* AMD AM5 - Ryzen 5, 7, 9 */}
                          {modalSelectedSocket === 'AMD AM5' && (
                            <>
                              <option value="AMD Ryzen 5">AMD Ryzen 5</option>
                              <option value="AMD Ryzen 7">AMD Ryzen 7</option>
                              <option value="AMD Ryzen 9">AMD Ryzen 9</option>
                            </>
                          )}
                          {/* Intel 1200 - Core i3, i5, i7, i9 (10th, 11th Gen) */}
                          {modalSelectedSocket === 'INTEL 1200' && (
                            <>
                              <option value="Intel Core i3">Intel Core i3</option>
                              <option value="Intel Core i5">Intel Core i5</option>
                              <option value="Intel Core i7">Intel Core i7</option>
                              <option value="Intel Core i9">Intel Core i9</option>
                            </>
                          )}
                          {/* Intel 1700 - Core i3, i5, i7, i9 (12th, 13th, 14th Gen) */}
                          {modalSelectedSocket === 'INTEL 1700' && (
                            <>
                              <option value="Intel Core i3">Intel Core i3</option>
                              <option value="Intel Core i5">Intel Core i5</option>
                              <option value="Intel Core i7">Intel Core i7</option>
                              <option value="Intel Core i9">Intel Core i9</option>
                            </>
                          )}
                          {/* Intel 1851 - Core Ultra 5, 7, 9 (Arrow Lake) */}
                          {modalSelectedSocket === 'INTEL 1851' && (
                            <>
                              <option value="Intel Core Ultra 5">Intel Core Ultra 5</option>
                              <option value="Intel Core Ultra 7">Intel Core Ultra 7</option>
                              <option value="Intel Core Ultra 9">Intel Core Ultra 9</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}

                    {/* Mainboard Support - For Case */}
                    {formData.category === 'Case' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mainboard Support</label>
                        <select
                          value={modalSelectedMainboardSupport}
                          onChange={(e) => setModalSelectedMainboardSupport(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Mainboard Support --</option>
                          <option value="ATX">ATX</option>
                          <option value="E-ATX">E-ATX</option>
                          <option value="ITX">ITX</option>
                          <option value="Micro-ATX">Micro-ATX</option>
                          <option value="Mini-ITX">Mini-ITX</option>
                        </select>
                      </div>
                    )}

                    {/* Capacity - For SSD and Harddisk */}
                    {(formData.category === 'SSD' || formData.category === 'Harddisk') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                        <select
                          value={modalSelectedCapacity}
                          onChange={(e) => setModalSelectedCapacity(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Capacity --</option>
                          <option value="128 GB">128 GB</option>
                          <option value="256 GB">256 GB</option>
                          <option value="512 GB">512 GB</option>
                          <option value="1 TB">1 TB</option>
                          <option value="2 TB">2 TB</option>
                        </select>
                      </div>
                    )}

                    {/* Maximum Power - For Power Supply */}
                    {formData.category === 'Power Supply' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Power</label>
                        <select
                          value={modalSelectedMaxPower}
                          onChange={(e) => setModalSelectedMaxPower(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Wattage --</option>
                          <option value="550 Watt">550 Watt</option>
                          <option value="600 Watt">600 Watt</option>
                          <option value="650 Watt">650 Watt</option>
                          <option value="750 Watt">750 Watt</option>
                          <option value="850 Watt">850 Watt</option>
                          <option value="1000 Watt">1000 Watt</option>
                        </select>
                      </div>
                    )}

                    {/* GPU Series - For VGA */}
                    {formData.category === 'VGA' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GPU Series</label>
                        <select
                          value={modalSelectedGpuSeries}
                          onChange={(e) => setModalSelectedGpuSeries(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก GPU Series --</option>
                          <optgroup label="AMD Radeon">
                            <option value="RX 6000">RX 6000 Series</option>
                            <option value="RX 7000">RX 7000 Series</option>
                            <option value="RX 9000">RX 9000 Series</option>
                          </optgroup>
                          <optgroup label="Intel">
                            <option value="ARC">Intel ARC</option>
                          </optgroup>
                          <optgroup label="NVIDIA GeForce">
                            <option value="GTX 1000">GTX 1000 Series</option>
                            <option value="RTX 2000">RTX 2000 Series</option>
                            <option value="RTX 3000">RTX 3000 Series</option>
                            <option value="RTX 4000">RTX 4000 Series</option>
                            <option value="RTX 5000">RTX 5000 Series</option>
                          </optgroup>
                        </select>
                      </div>
                    )}

                    {/* Memory Size - For Memory */}
                    {formData.category === 'Memory' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Memory Size</label>
                        <select
                          value={modalSelectedMemorySize}
                          onChange={(e) => setModalSelectedMemorySize(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Memory Size --</option>
                          <option value="8 GB">8 GB</option>
                          <option value="16 GB">16 GB</option>
                          <option value="32 GB">32 GB</option>
                          <option value="64 GB">64 GB</option>
                          <option value="128 GB">128 GB</option>
                        </select>
                      </div>
                    )}

                    {/* Bus Speed - For Memory */}
                    {formData.category === 'Memory' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bus Speed</label>
                        <select
                          value={modalSelectedBusSpeed}
                          onChange={(e) => setModalSelectedBusSpeed(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Bus Speed --</option>
                          <optgroup label="DDR4">
                            <option value="DDR4 3200MHz">DDR4 3200MHz</option>
                            <option value="DDR4 3600MHz">DDR4 3600MHz</option>
                          </optgroup>
                          <optgroup label="DDR5">
                            <option value="DDR5 4800MHz">DDR5 4800MHz</option>
                            <option value="DDR5 5200MHz">DDR5 5200MHz</option>
                            <option value="DDR5 5600MHz">DDR5 5600MHz</option>
                            <option value="DDR5 6000MHz">DDR5 6000MHz</option>
                            <option value="DDR5 6200MHz">DDR5 6200MHz</option>
                            <option value="DDR5 6400MHz">DDR5 6400MHz</option>
                            <option value="DDR5 7200MHz">DDR5 7200MHz</option>
                          </optgroup>
                        </select>
                      </div>
                    )}

                    {/* Chipset - For Mainboard */}
                    {formData.category === 'Mainboard' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chipset</label>
                        <select
                          value={modalSelectedChipset}
                          onChange={(e) => setModalSelectedChipset(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Chipset --</option>
                          {/* Show chipsets based on selected socket */}
                          {!modalSelectedSocket && (
                            <>
                              <optgroup label="AMD AM4">
                                <option value="AMD AM4 (A320 - A520)">A320 - A520</option>
                                <option value="AMD AM4 (B450 - B550)">B450 - B550</option>
                              </optgroup>
                              <optgroup label="AMD AM5">
                                <option value="AMD AM5 (A620)">A620</option>
                                <option value="AMD AM5 (B650 - B850)">B650 - B850</option>
                                <option value="AMD AM5 (X670 - X870)">X670 - X870</option>
                              </optgroup>
                              <optgroup label="Intel LGA 1700">
                                <option value="INTEL 1700 (B660 - B760)">B660 - B760</option>
                                <option value="INTEL 1700 (H610 - H770)">H610 - H770</option>
                                <option value="INTEL 1700 (Z690 - Z790)">Z690 - Z790</option>
                              </optgroup>
                              <optgroup label="Intel LGA 1851">
                                <option value="INTEL 1851 (B860)">B860</option>
                                <option value="INTEL 1851 (H810)">H810</option>
                                <option value="INTEL 1851 (Z890)">Z890</option>
                              </optgroup>
                            </>
                          )}
                          {modalSelectedSocket === 'AMD AM4' && (
                            <>
                              <option value="AMD AM4 (A320 - A520)">A320 - A520</option>
                              <option value="AMD AM4 (B450 - B550)">B450 - B550</option>
                            </>
                          )}
                          {modalSelectedSocket === 'AMD AM5' && (
                            <>
                              <option value="AMD AM5 (A620)">A620</option>
                              <option value="AMD AM5 (B650 - B850)">B650 - B850</option>
                              <option value="AMD AM5 (X670 - X870)">X670 - X870</option>
                            </>
                          )}
                          {modalSelectedSocket === 'INTEL 1700' && (
                            <>
                              <option value="INTEL 1700 (B660 - B760)">B660 - B760</option>
                              <option value="INTEL 1700 (H610 - H770)">H610 - H770</option>
                              <option value="INTEL 1700 (Z690 - Z790)">Z690 - Z790</option>
                            </>
                          )}
                          {modalSelectedSocket === 'INTEL 1851' && (
                            <>
                              <option value="INTEL 1851 (B860)">B860</option>
                              <option value="INTEL 1851 (H810)">H810</option>
                              <option value="INTEL 1851 (Z890)">Z890</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}

                    {/* Socket Support - For CPU Cooler */}
                    {formData.category === 'CPU Cooler' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Socket Support</label>
                        <select
                          value={modalSelectedCoolerSocket}
                          onChange={(e) => setModalSelectedCoolerSocket(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-black"
                        >
                          <option value="">-- เลือก Socket Support --</option>
                          <option value="AMD AM4">AMD AM4</option>
                          <option value="AMD AM5">AMD AM5</option>
                          <option value="AMD AM4/AM5">AMD AM4/AM5</option>
                          <option value="INTEL 1200">Intel LGA 1200</option>
                          <option value="INTEL 1700">Intel LGA 1700</option>
                          <option value="INTEL 1851">Intel LGA 1851</option>
                          <option value="INTEL 1700/1851">Intel LGA 1700/1851</option>
                          <option value="Universal (AMD/Intel)">Universal (AMD/Intel)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อสินค้า *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคา *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคาเดิม (Original Price)
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    จำนวนสต็อก *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                {/* Multiple Image Upload Component */}
                <MultipleImageUpload
                  label="รูปภาพสินค้า *"
                  currentImages={formData.images}
                  onUploadSuccess={(urls) => setFormData({ ...formData, images: urls })}
                  maxImages={100}
                />

                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รูปหน้าปก (รูปที่จะแสดงบนหน้า Main)
                  </label>
                  <div className="space-y-2">
                    {formData.coverImage && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-orange-300">
                        <img
                          src={getImageUrl(formData.coverImage)}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, coverImage: '' })}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                          หน้าปก
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData({ ...formData, coverImage: img })}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${formData.coverImage === img
                              ? 'border-orange-500 ring-2 ring-orange-300'
                              : 'border-gray-300 hover:border-orange-300'
                            }`}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt={`Option ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {formData.coverImage === img && (
                            <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center">
                              <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      คลิกที่รูปภาพเพื่อตั้งเป็นรูปหน้าปก (ถ้าไม่เลือกจะใช้รูปแรกอัตโนมัติ)
                    </p>
                  </div>
                </div>

                {/* Detail Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รูปหน้าปกหน้ารายละเอียดสินค้า (รูปที่จะแสดงในหน้า Product Detail)
                  </label>
                  <div className="space-y-3">
                    {formData.detailCoverImage ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-300">
                        <img
                          src={getImageUrl(formData.detailCoverImage)}
                          alt="Detail Cover"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, detailCoverImage: '' })}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                          หน้าปกรายละเอียด
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">ยังไม่ได้เลือกรูปหน้าปกรายละเอียด</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowDetailCoverModal(true)}
                      disabled={formData.images.length === 0}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${formData.images.length === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formData.detailCoverImage ? 'เปลี่ยนรูปหน้าปกรายละเอียด' : 'เลือกรูปหน้าปกรายละเอียด'}
                    </button>
                    <p className="text-xs text-gray-500">
                      กดปุ่มเพื่อเลือกรูปจากรูปที่อัพโหลดไว้ (ถ้าไม่เลือกจะใช้รูปแรกอัตโนมัติ)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียดสินค้า *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-black"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({
                        ...formData,
                        isFeatured: e.target.checked,
                        isFlashSale: false,
                        showInCategory: false
                      })}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">สินค้าแนะนำ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      checked={formData.isFlashSale}
                      onChange={(e) => setFormData({
                        ...formData,
                        isFlashSale: e.target.checked,
                        isFeatured: false,
                        showInCategory: false
                      })}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Flash Sale</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="productType"
                      checked={formData.showInCategory}
                      onChange={(e) => setFormData({
                        ...formData,
                        showInCategory: e.target.checked,
                        isFeatured: false,
                        isFlashSale: false
                      })}
                      className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">แสดงในหมวดหมู่</span>
                  </label>
                </div>

                {/* Flash Sale End Time - Show only when Flash Sale is checked */}
                {formData.isFlashSale && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันที่สิ้นสุด Flash Sale <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.flashSaleEndTime}
                      onChange={(e) => setFormData({ ...formData, flashSaleEndTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      กำหนดวันและเวลาที่ Flash Sale จะสิ้นสุด
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                >
                  {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Cover Image Selection Modal */}
      {showDetailCoverModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">เลือกรูปหน้าปกรายละเอียดสินค้า</h3>
              <button
                type="button"
                onClick={() => setShowDetailCoverModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, detailCoverImage: img });
                      setShowDetailCoverModal(false);
                    }}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${formData.detailCoverImage === img
                        ? 'border-blue-500 ring-4 ring-blue-300'
                        : 'border-gray-300 hover:border-blue-400'
                      }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`รูปที่ ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {formData.detailCoverImage === img && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                      รูปที่ {index + 1}
                    </div>
                  </button>
                ))}
              </div>
              {formData.images.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  กรุณาอัพโหลดรูปภาพก่อน
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
