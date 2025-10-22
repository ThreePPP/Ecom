import React from "react";
import Image from "next/image";

const Flashsale = () => {
  const flashSaleData = [
    {
      id: 1,
      title: "CPU SALE",
      icon: "⚡",
      color: "bg-red-600",
      products: [
        {
          name: "CPU (มือ) INTEL 1700 CORE I5-12400F 2.5GHz 6C 12T",
          price: "฿3,690.00",
          oldPrice: "฿3,990.00",
          image: "/icons/cpu-icon.png",
        },
        {
          name: "CPU (มือ) AMD AM5 RYZEN 5 9600X 3.9GHz 6C 12T",
          price: "฿8,690.00",
          oldPrice: "฿8,990.00",
          image: "/icons/cpu-icon.png",
        },
        {
          name: "CPU (มือ) AMD AM5 RYZEN 7 9800X3D 4.7GHz 8C 16T",
          price: "฿17,690.00",
          oldPrice: "฿19,990.00",
          image: "/icons/cpu-icon.png",
        },
      ],
    },
    {
      id: 2,
      title: "GPU SALE",
      icon: "⚡",
      color: "bg-red-600",
      products: [
        {
          name: "CPU (มือ) INTEL 1700 CORE I5-12400F 2.5GHz 6C 12T",
          price: "฿3,690.00",
          oldPrice: "฿3,990.00",
          image: "/icons/cpu-icon.png",
        },
        {
          name: "CPU (มือ) AMD AM5 RYZEN 5 9600X 3.9GHz 6C 12T",
          price: "฿8,690.00",
          oldPrice: "฿8,990.00",
          image: "/icons/cpu-icon.png",
        },
        {
          name: "CPU (มือ) AMD AM5 RYZEN 7 9800X3D 4.7GHz 8C 16T",
          price: "฿17,690.00",
          oldPrice: "฿19,990.00",
          image: "/icons/cpu-icon.png",
        },
      ],
    },
    {
      id: 3,
      title: "RAM SALE",
      icon: "⚡",
      color: "bg-red-600",
      products: [
        {
          name: "CPU (มือ) INTEL 1700 CORE I5-12400F 2.5GHz 6C 12T",
          price: "฿3,690.00",
          oldPrice: "฿3,990.00",
          image: "/icons/cpu-icon.png",
        },
        {
          name: "CPU (มือ) AMD AM5 RYZEN 5 9600X 3.9GHz 6C 12T",
          price: "฿8,690.00",
          oldPrice: "฿8,990.00",
          image: "/icons/cpu-icon.png",
        },
        {
          name: "CPU (มือ) AMD AM5 RYZEN 7 9800X3D 4.7GHz 8C 16T",
          price: "฿17,690.00",
          oldPrice: "฿19,990.00",
          image: "/icons/cpu-icon.png",
        },
      ],
    },
  ];

  return (
    <div id="flashsale-section" className="px-10 py-8">
      <div className="flex gap-4 overflow-x-auto">
        {flashSaleData.map((sale) => (
          <div
            key={sale.id}
            className={`${sale.color} rounded-2xl p-6 min-w-[400px] flex-shrink-0`}
          >
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <span className="text-yellow-300 text-2xl">{sale.icon}</span>
              {sale.title}
            </div>
            <div className="space-y-3">
              {sale.products.map((product, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-blue-600 font-bold text-xs">CPU</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium mb-2 line-clamp-2">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-bold text-lg">
                        {product.price}
                      </span>
                      <span className="text-gray-400 text-sm line-through">
                        {product.oldPrice}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Flashsale;
