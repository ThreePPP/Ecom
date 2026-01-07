'use client';

import React, { useEffect, useState } from "react";
import { productAPI } from "@/app/lib/api";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/component/Toast/Toast";
import AddToCartButton from "@/app/component/AddToCartButton/AddToCartButton";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
  coverImage?: string;
  condition?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const imageUrl = product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg';

  const getConditionBadge = () => {
    if (!product.condition) return null;

    let styleClass = 'bg-gray-50/90 text-gray-700 border-gray-100';
    if (product.condition === 'สภาพเหมือนใหม่') styleClass = 'bg-green-50/90 text-green-700 border-green-100';
    else if (product.condition === 'สภาพดี') styleClass = 'bg-blue-50/90 text-blue-700 border-blue-100';
    else if (product.condition === 'สภาพพอใช้') styleClass = 'bg-yellow-50/90 text-yellow-700 border-yellow-100';

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm backdrop-blur-md border ${styleClass}`}>
        {product.condition}
      </span>
    );
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-gray-100/50 flex flex-col h-full"
      onClick={() => window.location.href = `/products/${product._id}`}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {getConditionBadge()}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-700 mb-2 line-clamp-2 min-h-[40px] group-hover:text-black transition-colors leading-relaxed">
          {product.name}
        </h3>

        <div className="mt-auto pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                {product.price.toLocaleString()} coins
              </span>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <AddToCartButton
              className="w-full !rounded-xl !bg-black hover:!bg-gray-800 !text-white !h-10 !text-sm font-medium shadow-none transition-all"
              onClick={() => onAddToCart(product)}
            />
          </div>
        </div>
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
  onAddToCart: (product: Product) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProducts({
          category: category,
          limit: 6
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
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="min-w-[200px] sm:min-w-[220px] space-y-3">
            <div className="bg-gray-100 rounded-lg aspect-square animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="font-light text-sm">ไม่พบสินค้าในหมวดหมู่นี้</p>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
      {products.map((product) => (
        <div key={product._id} className="w-[200px] sm:w-[220px] flex-none snap-start">
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </div>
      ))}
    </div>
  );
};

const AllCategory = () => {
  const { addToCart } = useCart();
  const { showCartToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("CPU");

  const handleCategoryClick = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product._id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.coverImage || product.images?.[0] || product.image || '/placeholder.jpg',
      images: product.images
    });
    showCartToast('เพิ่มสินค้าลงตะกร้า');
  };

  const selectedCategoryData = categories.find(cat => cat.key === selectedCategory);

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8">
          {/* Minimal Horizontal Category Bar */}
          <div className="sticky top-[80px] z-30 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-gray-50">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {categories.map((category) => {
                const isActive = selectedCategory === category.key;
                return (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryClick(category.key)}
                    className="group flex flex-col items-center gap-3 min-w-[80px] snap-start"
                  >
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden
                      ${isActive
                        ? 'bg-black text-white shadow-lg shadow-black/10 scale-105'
                        : 'bg-gray-50 border border-transparent hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50'
                      }
                    `}>
                      <img
                        src={category.icon}
                        alt={category.name}
                        className={`w-8 h-8 object-contain transition-all duration-300 ${isActive ? 'brightness-0 invert' : 'opacity-60 group-hover:opacity-100 grayscale'}`}
                      />
                    </div>
                    <span className={`text-xs font-medium transition-colors text-center ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500 group-hover:text-gray-900'}`}>
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-end justify-between mb-10 pb-4 border-b border-gray-100">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{selectedCategoryData?.name || selectedCategory}</h1>
                <p className="text-gray-400 text-sm mt-1 font-light">เลือกชมสินค้าทั้งหมดของเรา</p>
              </div>

              <button
                onClick={() => window.location.href = `/category/${encodeURIComponent(selectedCategory)}`}
                className="text-sm font-medium text-gray-500 hover:text-black transition-all"
              >
                ดูทั้งหมด
              </button>
            </div>

            <CategorySection category={selectedCategory} onAddToCart={handleAddToCart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCategory;
