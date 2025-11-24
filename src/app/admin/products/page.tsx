'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { productAPI } from '../../lib/api';
import ImageUpload from '../../component/ImageUpload/ImageUpload';
import Breadcrumb from '../../component/Breadcrumb/Breadcrumb';

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
  description: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: '',
    brand: '',
    stock: '',
    image: '',
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
      
      const response = await productAPI.getProducts();
      
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
      const imageUrl = product.images?.[0] || product.image || '';
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
        image: imageUrl,
        description: product.description || '',
        isFeatured: product.isFeatured || false,
        isFlashSale: product.isFlashSale || false,
        showInCategory: product.showInCategory !== undefined ? product.showInCategory : true,
        flashSaleEndTime: flashSaleDate,
      });
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
        image: '',
        description: '',
        isFeatured: false,
        isFlashSale: false,
        showInCategory: true,
        flashSaleEndTime: '',
      });
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
        image: formData.image,
        description: formData.description,
        isFeatured: formData.isFeatured,
        isFlashSale: formData.isFlashSale,
        showInCategory: formData.showInCategory,
      };

      // Add flashSaleEndTime only if Flash Sale is checked and date is provided
      if (formData.isFlashSale && formData.flashSaleEndTime) {
        productData.flashSaleEndTime = new Date(formData.flashSaleEndTime).toISOString();
      }

      let response;
      if (editingProduct) {
        response = await productAPI.updateProduct(editingProduct._id, productData);
      } else {
        response = await productAPI.createProduct(productData);
      }

      if (response.success) {
        alert(editingProduct ? 'อัพเดทสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ');
        handleCloseModal();
        fetchProducts();
      }
    } catch (err: any) {
      // จัดการกับ 401 Unauthorized errors
      if (err.message?.includes('401') || err.message?.includes('ยืนยันตัวตน') || err.message?.includes('เข้าสู่ระบบ') || err.message?.includes('สิทธิ์')) {
        alert('เซสชันหมดอายุหรือไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      } else {
        alert(err.message || 'เกิดข้อผิดพลาด');
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
        alert('ลบสินค้าสำเร็จ');
        fetchProducts();
      }
    } catch (err: any) {
      // จัดการกับ 401 Unauthorized errors
      if (err.message?.includes('401') || err.message?.includes('ยืนยันตัวตน') || err.message?.includes('เข้าสู่ระบบ') || err.message?.includes('สิทธิ์')) {
        alert('เซสชันหมดอายุหรือไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      } else {
        alert(err.message || 'เกิดข้อผิดพลาด');
      }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchSearch && matchCategory;
  });

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
          {filteredProducts.map((product) => {
            const imageUrl = product.images?.[0] || product.image || '/placeholder.png';
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
                    ฿{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ฿{product.originalPrice.toLocaleString()}
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

        {/* Stats */}
        <div className="mt-6 text-sm text-gray-600">
          แสดง {filteredProducts.length} จาก {products.length} สินค้า
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อสินค้า *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      หมวดหมู่ *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-black"
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
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนสต็อก *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ยี่ห้อ (Brand)
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                    placeholder="เช่น Intel, AMD, ASUS, MSI"
                  />
                </div>

                {/* Image Upload Component */}
                <ImageUpload
                  label="รูปภาพสินค้า *"
                  currentImage={formData.image}
                  onUploadSuccess={(url) => setFormData({...formData, image: url})}
                />

                {/* หรือใส่ URL เอง */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    หรือใส่ URL รูปภาพเอง
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียดสินค้า *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, flashSaleEndTime: e.target.value})}
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
    </div>
  );
}
