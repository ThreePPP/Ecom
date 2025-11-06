'use client';

import React, { useEffect, useState } from "react";
import { productAPI } from "@/app/lib/api";

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  image?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product.images?.[0] || product.image || '/placeholder.jpg';
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="bg-gray-200 aspect-square flex items-center justify-center overflow-hidden">
        <img 
          src={imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm text-gray-700 mb-2 line-clamp-2 flex-grow">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-orange-500 mb-2">
          ฿{product.price.toLocaleString()}
        </p>
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded-md transition-colors flex items-center justify-center gap-2">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          ใส่ตระกร้า
        </button>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  title: string;
  icon: string;
  category: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  icon,
  category,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getProducts({ 
          category: category,
          limit: 5 
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

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <img src={icon} alt={title} className="w-8 h-8" />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          ไม่มีสินค้าในหมวดหมู่นี้
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

const AllCategory = () => {
  return (
    <div className="bg-white w-full">
      <div className="container mx-auto px-4 py-8">
        {/* CPU */}
        <CategorySection title="CPU" icon="/icons/cpu.png" category="CPU" />

        {/* Mainboard */}
        <CategorySection title="Mainboard" icon="/icons/mainboard.png" category="Mainboard" />

        {/* VGA / Graphic Card */}
        <CategorySection title="VGA / Graphic Card" icon="/icons/gpu.png" category="VGA" />

        {/* RAM */}
        <CategorySection title="RAM" icon="/icons/ram.png" category="RAM" />

        {/* Power Supply */}
        <CategorySection title="Power Supply" icon="/icons/psu.png" category="Power Supply" />

        {/* Case */}
        <CategorySection title="Case" icon="/icons/case.png" category="Case" />

        {/* Other */}
        <CategorySection title="อื่นๆ / Other" icon="/icons/other.png" category="Other" />
      </div>
    </div>
  );
};

export default AllCategory;
