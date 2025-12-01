'use client';

import React, { useEffect, useState } from "react";
import { productAPI } from "@/app/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  condition?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product.images?.[0] || product.image || '/placeholder.jpg';
  
  // กำหนดสีและไอคอนตามสภาพสินค้า
  const getConditionBadge = () => {
    if (!product.condition) return null;
    
    const conditionStyles: { [key: string]: { bg: string; text: string; label: string } } = {
      'สภาพเหมือนใหม่': { bg: 'bg-green-100', text: 'text-green-700', label: 'สภาพเหมือนใหม่' },
      'สภาพดี': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'สภาพดี' },
      'สภาพพอใช้': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'สภาพพอใช้' },
    };

    const style = conditionStyles[product.condition];
    if (!style) return null;

    return (
      <span className={`text-xs px-2 py-1 rounded ${style.bg} ${style.text} font-medium`}>
        {style.label}
      </span>
    );
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => window.location.href = `/products/${product._id}`}
    >
      <div className="bg-gray-200 aspect-square flex items-center justify-center overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {/* แสดงสภาพสินค้าที่มุมบนขวา */}
        {product.condition && (
          <div className="absolute top-2 right-2">
            {getConditionBadge()}
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm text-gray-700 mb-2 line-clamp-2 flex-grow">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-orange-500 mb-2">
          ฿{product.price.toLocaleString()}
        </p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Add to cart logic here
            alert(`เพิ่ม "${product.name}" ลงในตะกร้าแล้ว!`);
          }}
          className="w-full bg-gray-700 hover:bg-[#99ff33] text-white hover:text-gray-800 text-sm py-2 rounded-xl transition-colors font-medium"
        >
          เพิ่มลงตะกร้า
        </button>
      </div>
    </div>
  );
};

interface Category {
  name: string;
  icon: string;
  key: string;
}

const categories: Category[] = [
  { name: "CPU", icon: "/icons/cpu.png", key: "CPU" },
  { name: "CPU Cooler", icon: "/icons/cooler.png", key: "CPU Cooler" },
  { name: "Mainboard", icon: "/icons/mainboard.png", key: "Mainboard" },
  { name: "VGA / Graphic Card", icon: "/icons/gpu.png", key: "VGA" },
  { name: "Memory", icon: "/icons/ram.png", key: "Memory" },
  { name: "SSD", icon: "/icons/ssd.png", key: "SSD" },
  { name: "Harddisk", icon: "/icons/hard-disk.png", key: "Harddisk" },
  { name: "Power Supply", icon: "/icons/powersupply.png", key: "Power Supply" },
  { name: "Case", icon: "/icons/computer.png", key: "Case" },
  { name: "Accessories", icon: "/icons/as.png", key: "Accessories" },
];

interface CategorySectionProps {
  category: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProducts({ 
          category: category,
          limit: 8
        });
        
        if (response.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        ไม่มีสินค้าในหมวดหมู่นี้
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

const AllCategory = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("CPU");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleCategoryClick = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const selectedCategoryData = categories.find(cat => cat.key === selectedCategory);

  return (
    <div className="bg-gray-50 w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
            <div className="bg-white rounded-lg shadow-sm sticky top-4">
              {/* Sidebar Header */}
              <div className="bg-white text-gray-800 p-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isSidebarOpen && (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                      </svg>
                      <h2 className="font-bold whitespace-nowrap">สินค้า DIY ของ FavorPC</h2>
                    </>
                  )}
                  {!isSidebarOpen && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                    </svg>
                  )}
                </div>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hover:bg-gray-200 rounded p-1 transition-colors"
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
              </div>

              {/* Category List */}
              <div className="p-2">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryClick(category.key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors mb-1 ${
                      selectedCategory === category.key
                        ? 'bg-red-50 border-l-4 border-red-600 text-red-600'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <img src={category.icon} alt={category.name} className="w-6 h-6 flex-shrink-0" />
                    {isSidebarOpen && (
                      <span className="text-sm font-medium text-left">{category.name}</span>
                    )}
                  </button>
                ))}
                
                {/* PC Builder Button - Separate */}
                <button
                  onClick={() => window.location.href = "/pc-builder"}
                  className="w-full flex items-center justify-center p-3 rounded-lg transition-colors mb-1 bg-blue-50 border border-blue-600 text-blue-600 hover:bg-blue-100 mt-4"
                >
                  {isSidebarOpen && (
                    <span className="text-lg font-bold">จัดสเปคคอม</span>
                  )}
                  {!isSidebarOpen && (
                    <span className="text-xs font-bold">PC</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Category Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">{selectedCategoryData?.name || selectedCategory}</h1>
                <button
                  onClick={() => window.location.href = `/category/${encodeURIComponent(selectedCategory)}`}
                  className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center gap-1"
                >
                  ดูทั้งหมด
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <CategorySection category={selectedCategory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCategory;
