"use client"

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaHeart, FaShoppingBag, FaMinus, FaPlus, FaExchangeAlt } from "react-icons/fa";
import { productAPI } from "@/app/lib/api";
import { useCart } from "@/app/context/CartContext";
import { useCompare } from "@/app/context/CompareContext";
import Navbar from "@/app/component/Navbar/Navbar";
import Features from "@/app/component/main/Features/Features";
import Footer from "@/app/component/main/footer/footer";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  oldPrice?: number;
  discount?: number;
  images?: string[];
  image?: string;
  category?: string;
  brand?: string;
  description?: string;
  specifications?: Record<string, string> | Map<string, string>;
  stock?: number;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  sold?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
}

const ProductDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { addToCompare, isInCompare } = useCompare();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'specs'>('overview');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProductById(params.id as string);
        console.log('Product response:', response);
        if (response.success) {
          // Handle both response.data and response.data.product
          const productData = response.data.product || response.data;
          console.log('Product data:', productData);
          setProduct(productData);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          ...product,
          id: product._id,
          image: product.images?.[0] || product.image || '/placeholder.jpg'
        });
      }
      alert(`เพิ่ม "${product.name}" ${quantity} ชิ้น ลงในตะกร้าสินค้าแล้ว!`);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const handleAddToCompare = () => {
    if (product) {
      addToCompare(product);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบสินค้า</h2>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.image 
    ? [product.image] 
    : ['/placeholder.jpg'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar showBanner={false} showPromotion={false} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <span className="hover:text-red-600 cursor-pointer" onClick={() => router.push('/')}>
            หน้าแรก
          </span>
          <span className="mx-2">/</span>
          <span className="hover:text-red-600 cursor-pointer">
            {product.category || 'สินค้า'}
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Images */}
            <div>
              {/* Main Image */}
              <div className="bg-gray-50 rounded-xl p-8 mb-4 aspect-square flex items-center justify-center overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-red-600'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div>
              {/* Stock Badge */}
              <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                มีสินค้า
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Brand and SKU */}
              <div className="flex gap-4 text-sm text-gray-600 mb-6">
                {product.brand && (
                  <div>
                    <span className="font-semibold">แบรนด์:</span> {product.brand}
                  </div>
                )}
                {product.sku && (
                  <div>
                    <span className="font-semibold">รหัสสินค้า:</span> {product.sku}
                  </div>
                )}
              </div>

              {/* Action Icons */}
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={handleAddToCompare}
                  className={`p-2 rounded-full transition-colors ${
                    isInCompare(product._id)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  title={isInCompare(product._id) ? 'อยู่ในรายการเปรียบเทียบแล้ว' : 'เปรียบเทียบสินค้า'}
                >
                  <FaExchangeAlt className={isInCompare(product._id) ? 'text-yellow-600' : 'text-gray-600'} />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="เพิ่มในรายการโปรด"
                >
                  <FaHeart className="text-gray-600" />
                </button>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="text-4xl font-bold text-gray-900">
                  ฿{product.price ? product.price.toLocaleString() : '0'}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 mr-2">จำนวน</span>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    <FaMinus className="text-sm" />
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center border border-gray-300 rounded text-lg font-semibold text-gray-900">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-red-600 text-red-600 rounded hover:bg-red-50 transition-colors"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-600 text-red-600 px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors"
                >
                  <FaShoppingBag />
                  เพิ่มในตะกร้า
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-colors"
                >
                  ซื้อเลย
                </button>
              </div>

              {/* Tags */}
              {product.category && (
                <div className="flex flex-wrap gap-2">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    #{product.category}
                  </span>
                  {product.brand && (
                    <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      #{product.brand}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-bold text-center transition-colors ${
                activeTab === 'overview'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-6 py-4 font-bold text-center transition-colors ${
                activeTab === 'details'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              รายละเอียดสินค้า
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`flex-1 px-6 py-4 font-bold text-center transition-colors ${
                activeTab === 'specs'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              คุณสมบัติสินค้า
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">ภาพรวมผลิตภัณฑ์</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'ไม่มีข้อมูลภาพรวมผลิตภัณฑ์'}
                </p>
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">รายละเอียดสินค้า</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description || 'ไม่มีข้อมูลรายละเอียดสินค้า'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">คุณสมบัติสินค้า</h3>
                {(() => {
                  const specs = product.specifications;
                  if (!specs) {
                    return (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-500">ไม่มีข้อมูลคุณสมบัติสินค้า</p>
                      </div>
                    );
                  }

                  // Convert Map to Object if needed
                  const specsObj = specs instanceof Map 
                    ? Object.fromEntries(specs) 
                    : specs;

                  const specsEntries = Object.entries(specsObj);
                  
                  if (specsEntries.length === 0) {
                    return (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <p className="text-gray-500">ไม่มีข้อมูลคุณสมบัติสินค้า</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
                      {specsEntries.map(([key, value], index) => (
                        <div
                          key={key}
                          className={`grid grid-cols-3 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <div className="col-span-1 px-6 py-4 font-semibold text-gray-700 border-r border-gray-200">
                            {key}
                          </div>
                          <div className="col-span-2 px-6 py-4 text-gray-900">
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <Features />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
