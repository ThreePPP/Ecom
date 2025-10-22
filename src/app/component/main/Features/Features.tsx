import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-4 bg-white p-6 rounded-lg shadow-sm">
      <div className="w-16 h-16 flex-shrink-0 text-blue-500">
        {icon}
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
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5m1.5-9l1.96 2.5L17 12V9m-11 9.5c-0.83 0-1.5-0.67-1.5-1.5s0.67-1.5 1.5-1.5s1.5 0.67 1.5 1.5s-0.67 1.5-1.5 1.5m-3-4L1 3H0V1h2l0.6 3h15.55c0.75 0 1.41 0.41 1.75 1.03l3.58 6.49c0.08 0.14 0.12 0.31 0.12 0.48c0 0.55-0.45 1-1 1H6.1l-0.9 1.63l-0.03 0.12c0 0.14 0.11 0.25 0.25 0.25H17v2H6c-1.1 0-1.99-0.9-1.99-2c0-0.35 0.09-0.68 0.24-0.96l1.35-2.45L3 4z" />
        </svg>
      ),
      title: "จัดส่งทั่วประเทศ",
      description: "โดยลูกค้าจะได้รับสินค้าภายใน 1-4 วัน",
    },
    {
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
        </svg>
      ),
      title: "เลือกซื้อสินค้าอย่างปลอดภัย",
      description: "มั่นใจในทุกการสั่งซื้อ",
    },
    {
      icon: (
        <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
        </svg>
      ),
      title: "ดูแลลูกค้าทางออนไลน์",
      description: "เราดูแลลูกค้าทางออนไลน์ในเวลาทำการ",
    },
  ];

  return (
    <div className="bg-gray-50 w-full py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
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
