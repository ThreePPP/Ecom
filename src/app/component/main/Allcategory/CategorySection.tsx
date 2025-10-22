import React from "react";
import ProductCard from "./ProductCard";

interface CategorySectionProps {
  title: string;
  icon?: React.ReactNode;
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, icon }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        {icon && <div className="mr-2">{icon}</div>}
        <h2 className="text-2xl font-bold text-gray-600">{title}</h2>
        <a href="#" className="ml-auto text-sm text-gray-600 hover:underline">
          ดูทั้งหมด
        </a>
      </div>
      <div className="flex justify-center space-x-4">
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </div>
  );
};

export default CategorySection;
