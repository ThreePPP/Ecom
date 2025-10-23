import React from "react";
import Image from "next/image";

interface FeatureCardProps {
  iconSrc: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ iconSrc, title, description }) => {
  return (
    <div className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
      <div className="w-16 h-16 flex-shrink-0 relative">
        <Image 
          src={iconSrc} 
          alt={title}
          width={64}
          height={64}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

const Features = () => {
  const features = [
    {
      iconSrc: "/icons/delivery.png",
      title: "จัดส่งทั่วประเทศ",
      description: "โดยลูกค้าจะได้รับสินค้าภายใน 1-4 วัน",
    },
    {
      iconSrc: "/icons/shield.png",
      title: "เลือกซื้อสินค้าอย่างปลอดภัย",
      description: "มั่นใจในทุกการสั่งซื้อ",
    },
    {
      iconSrc: "/icons/customercare.png",
      title: "ดูแลลูกค้าทางออนไลน์",
      description: "เราดูแลลูกค้าทางออนไลน์ในเวลาทำการ",
    },
  ];

  const serviceBanners = [
    {
      image: "/Banners/fast 3.jpg",
      alt: "Chat & Shop ช้อปผ่านแชท",
    },
    {
      image: "/Banners/fast 3.jpg",
      alt: "รับร้าน 1 ชม. 1hr Pick up",
    },
    {
      image: "/Banners/fast 3.jpg",
      alt: "Fast Delivery ส่งเร็ว 3 hr.",
    },
  ];

  return (
    <div className="bg-gray-50 w-full py-12">
      <div className="container mx-auto px-4">
        {/* บริการเสริมช่วยช้อป */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">บริการเสริมช่วยช้อป</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceBanners.map((banner, index) => (
              <div key={index} className="relative w-full h-64 md:h-72 rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-shadow">
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              iconSrc={feature.iconSrc}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
