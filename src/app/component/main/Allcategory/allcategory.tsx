import React from "react";
import Image from "next/image";

// Mock data for products
const mockProducts = [
  { id: 1, name: "Product 1", price: "$74,490", image: "/placeholder.jpg" },
  { id: 2, name: "Product 2", price: "$75,490", image: "/placeholder.jpg" },
  { id: 3, name: "Product 3", price: "$16,490", image: "/placeholder.jpg" },
  { id: 4, name: "Product 4", price: "$99,490", image: "/placeholder.jpg" },
  { id: 5, name: "Product 5", price: "$93,490", image: "/placeholder.jpg" },
];

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="bg-gray-200 aspect-square flex items-center justify-center">
        <img src="/icons/12400f.jpg" alt="Logo" className="w-100 h-70 mb-4" />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm text-gray-700 mb-2 line-clamp-2 flex-grow">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-gray-900 mb-2">{product.price}</p>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-md transition-colors flex items-center justify-center gap-2">
          <Image src="/icons/shopping-basket.png" alt="cart" width={16} height={16} />
          ใส่ตระกร้า
        </button>
      </div>
    </div>
  );
};

interface CategorySectionProps {
  title: string;
  icon: string;
  showViewAll?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  icon,
  showViewAll = true,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <Image src={icon} alt={title} fill className="object-contain" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {showViewAll && (
          <button className="text-gray-600 hover:text-black text-sm font-medium">
            ดูทั้งหมด
          </button>
        )}
      </div>

      {/* ขนาด card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const AllCategory = () => {
  return (
    <div className="bg-white w-full">
      <div className="container mx-auto px-4 py-8">
        {/* สินค้ามาใหม่ */}
        <CategorySection title="สินค้ามาใหม่" icon="/icons/new-product.png" />

      {/* CPU */}
      <CategorySection title="CPU" icon="/icons/cpu.png" />

      {/* Mainboard */}
      <CategorySection title="Mainboard" icon="/icons/mainboard.png" />

      {/* Ram */}
      <CategorySection title="Ram" icon="/icons/ram.png" />

      {/* Graphic Card */}
      <CategorySection title="Graphic Card" icon="/icons/gpu.png" />
      </div>
    </div>
  );
};

export default AllCategory;
