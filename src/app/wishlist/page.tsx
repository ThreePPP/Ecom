"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { FaHeart, FaTrash, FaShoppingCart } from "react-icons/fa";
import Navbar from "@/app/component/Navbar/Navbar";
import Features from "@/app/component/main/Features/Features";
import Footer from "@/app/component/main/footer/footer";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";

export default function WishlistPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items, loading: wishlistLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  const handleAddToCart = (product: any) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.coverImage || product.images?.[0] || '/placeholder.jpg',
    });
  };

  const handleClearWishlist = async () => {
    if (confirm('คุณต้องการล้างรายการโปรดทั้งหมดหรือไม่?')) {
      await clearWishlist();
    }
  };

  if (authLoading || wishlistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">กำลังโหลด...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar showBanner={false} showPromotion={false} />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Breadcrumb items={[{ label: 'รายการโปรด' }]} />
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaHeart className="text-red-500" />
              รายการโปรด ({items.length})
            </h1>
            {items.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FaTrash />
                ล้างทั้งหมด
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">
              ยังไม่มีสินค้าในรายการโปรด
            </p>
            <p className="text-gray-400 text-sm mb-6">
              คลิกที่ไอคอนหัวใจบนสินค้าที่คุณชอบเพื่อเพิ่มในรายการโปรด
            </p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              เริ่มช้อปปิ้ง
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => router.push(`/products/${item.product._id}`)}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.product.coverImage || item.product.images?.[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(item.product._id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="ลบออกจากรายการโปรด"
                  >
                    <FaHeart className="text-red-500" />
                  </button>
                  {/* Condition Badge */}
                  {item.product.condition && (
                    <div className="absolute top-2 left-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        item.product.condition === 'สภาพเหมือนใหม่' ? 'bg-green-100 text-green-700' :
                        item.product.condition === 'สภาพดี' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.product.condition}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 
                    className="text-sm text-gray-700 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                    onClick={() => router.push(`/products/${item.product._id}`)}
                  >
                    {item.product.name}
                  </h3>
                  {item.product.category && (
                    <p className="text-xs text-gray-500 mb-2">{item.product.category}</p>
                  )}
                  <p className="text-lg font-bold text-orange-500 mb-3">
                    ฿{item.product.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleAddToCart(item.product)}
                    className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-[#99ff33] text-white hover:text-gray-800 text-sm py-2 rounded-xl transition-colors font-medium"
                  >
                    <FaShoppingCart />
                    เพิ่มลงตะกร้า
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <a
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            ← กลับหน้าแรก
          </a>
        </div>
      </div>
    </div>
    <Features />
    <Footer />
  </>
  );
}
