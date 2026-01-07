"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { FaTrash, FaShoppingBag, FaArrowLeft, FaHeart } from "react-icons/fa";
import Navbar from "@/app/component/Navbar/Navbar";
import Features from "@/app/component/main/Features/Features";
import Footer from "@/app/component/main/footer/footer";
import Breadcrumb from "@/app/component/Breadcrumb/Breadcrumb";
import AddToCartButton from "@/app/component/AddToCartButton/AddToCartButton";

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
      id: product._id,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showBanner={false} showPromotion={false} />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">

        {/* Breadcrumb - Keeping consistent with Contact page */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'รายการโปรด' }]} />
        </div>

        {/* Centered Header Style (Matching Contact Page) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div className="space-y-4 text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              รายการโปรด
            </h1>
            <p className="text-lg text-gray-500 font-light">
              สินค้าที่คุณบันทึกไว้ ({items.length} รายการ) รอให้คุณเป็นเจ้าของ
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="text-sm text-red-500 hover:text-red-700 underline underline-offset-4 transition-colors md:mb-1"
            >
              ล้างรายการทั้งหมด
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty State - Styled like a card */
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-transparent text-center max-w-2xl mx-auto">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
              <FaHeart className="text-4xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">ยังไม่มีสินค้าในรายการโปรด</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              ถูกใจสินค้าชิ้นไหน กดปุ่มหัวใจเก็บไว้ดูทีหลังได้เลย
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              เลือกซื้อสินค้าเลย
            </a>
          </div>
        ) : (
          /* Grid Layout (Matching Contact Page) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="flex flex-col p-6 bg-white rounded-2xl shadow-sm border border-transparent hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group relative"
              >
                {/* Remove Button (Absolute) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromWishlist(item.product._id);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                  title="ลบออก"
                >
                  <FaTrash size={14} />
                </button>

                {/* Product Image Area */}
                <div
                  className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden mb-6 cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
                  onClick={() => router.push(`/products/${item.product._id}`)}
                >
                  <img
                    src={item.product.coverImage || item.product.images?.[0] || '/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center"
                  />

                  {/* Badge */}
                  {item.product.condition && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-900 rounded-lg shadow-sm">
                        {item.product.condition}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content - Centered */}
                <div className="flex flex-col items-center flex-1 text-center w-full">
                  <h3
                    className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1 hover:text-red-600 transition-colors cursor-pointer"
                    onClick={() => router.push(`/products/${item.product._id}`)}
                  >
                    {item.product.name}
                  </h3>

                  {item.product.category && (
                    <p className="text-sm text-gray-500 mb-3">{item.product.category}</p>
                  )}

                  <p className="text-xl font-bold text-red-600 mb-6">
                    {item.product.price.toLocaleString()} coins
                  </p>

                  <div className="w-full mt-auto">
                    <AddToCartButton
                      onClick={() => handleAddToCart(item.product)}
                      className="w-full justify-center !rounded-xl !py-3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Features />
      <Footer />
    </div>
  );
}

