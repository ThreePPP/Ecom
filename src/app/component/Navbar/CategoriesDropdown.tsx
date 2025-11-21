import React from 'react';
import Link from 'next/link';

const categories = [
  { name: 'CPU', slug: 'CPU', icon: '/icons/cpu.png' },
  { name: 'CPU Cooler', slug: 'CPU Cooler', icon: '/icons/cooler.png' },
  { name: 'Mainboard', slug: 'Mainboard', icon: '/icons/mainboard.png' },
  { name: 'Graphic Card', slug: 'VGA', icon: '/icons/gpu.png' },
  { name: 'Memory', slug: 'Memory', icon: '/icons/ram.png' },
  { name: 'SSD', slug: 'SSD', icon: '/icons/ssd.png' },
  { name: 'Harddisk', slug: 'Harddisk', icon: '/icons/hard-disk.png' },
  { name: 'Case', slug: 'Case', icon: '/icons/computer.png' },
  { name: 'Accessories', slug: 'Accessories', icon: '/icons/as.png' },
];

const CategoriesDropdown = () => {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-b shadow-sm py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
           <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
           <h2 className="text-lg font-bold text-gray-800">หมวดหมู่สินค้า</h2>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-2xl group-hover:bg-white group-hover:shadow-md group-hover:scale-105 transition-all duration-300 border border-transparent group-hover:border-gray-100">
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-8 h-8 object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                />
              </div>
              <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 text-center transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesDropdown;
