import Image from "next/image";
import { ShoppingCart } from "lucide-react";

const ProductCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-48">
      <div className="relative h-40 bg-gray-200 flex items-center justify-center">
        <Image
          src="/images/cpu.jpg" // Placeholder path
          alt="Product Image"
          width={150}
          height={150}
          className="object-contain"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-800 h-10 mb-2">
          INTEL CORE I9-14900K 3.2 GHz
        </h3>
        <p className="text-lg font-bold text-gray-900 mb-4">฿10,490</p>
        <button className="w-full bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-600 transition-colors">
          <ShoppingCart size={16} />
          <span>เพิ่มลงรถเข็น</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
