import React from "react";
import CategorySection from "./CategorySection";
import { Cpu, HardDrive, MemoryStick, Star, Zap } from "lucide-react";

const AllCategory = () => {
  const categories = [
    { title: "สินค้ามาใหม่", icon: <Zap /> },
    { title: "สินค้าแนะนำ", icon: <Star /> },
    { title: "CPU", icon: <Cpu /> },
    { title: "Mainboard", icon: <HardDrive /> },
    { title: "Ram", icon: <MemoryStick /> },
    { title: "Graphic Card", icon: <Cpu /> },
  ];

  return (
    <div className="bg-gray-100 p-8">
      {categories.map((category) => (
        <CategorySection
          key={category.title}
          title={category.title}
          icon={category.icon}
        />
      ))}
    </div>
  );
};

export default AllCategory;

