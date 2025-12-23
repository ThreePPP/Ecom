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
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-10 transition-all duration-300">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-sm"></div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">หมวดหมู่สินค้า</h2>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-6 justify-items-center">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-4 p-2 w-full max-w-[120px] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-[24px] group-hover:bg-white group-hover:shadow-xl group-hover:shadow-blue-100/50 group-hover:scale-105 transition-all duration-300 border border-transparent group-hover:border-blue-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300" />
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-10 h-10 object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0 relative z-10"
                />
              </div>
              <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 text-center transition-colors duration-300">
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
