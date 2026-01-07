"use client";

import React from 'react';
import { useCompare } from '@/app/context/CompareContext';
import { useCart } from '@/app/context/CartContext';
import { FaTrash, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import AddToCartButton from '@/app/component/AddToCartButton/AddToCartButton';
import Link from 'next/link';
import { useToast } from '@/app/component/Toast/Toast';
import Navbar from '@/app/component/Navbar/Navbar';
import Features from '@/app/component/main/Features/Features';
import Footer from '@/app/component/main/footer/footer';

export default function ComparePage() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const handleRemove = (id: string) => {
        removeFromCompare(id);
        showToast('ลบสินค้าออกจากรายการเปรียบเทียบแล้ว', 'info');
    };

    const handleClear = () => {
        clearCompare();
        showToast('ล้างรายการเปรียบเทียบทั้งหมดแล้ว', 'info');
    };

    if (compareItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar showBanner={false} showPromotion={false} />
                <div className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaExclamationCircle className="text-gray-400 text-4xl" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">ไม่มีสินค้าในรายการเปรียบเทียบ</h2>
                            <p className="text-gray-500 mb-8 text-lg">
                                คุณยังไม่ได้เลือกสินค้าเพื่อเปรียบเทียบ กรุณาเลือกสินค้าที่ต้องการเปรียบเทียบจากหน้าสินค้า
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-colors shadow-lg hover:shadow-xl"
                            >
                                เลือกดูสินค้า
                            </Link>
                        </div>
                    </div>
                </div>
                <Features />
                <Footer />
            </div>
        );
    }

    // Helper to format price
    const formatPrice = (price?: number) => {
        return typeof price === 'number'
            ? `฿${price.toLocaleString()}`
            : '-';
    };

    // Helper to get image URL
    const getImageUrl = (item: any) => {
        if (item.coverImage) return item.coverImage;
        if (item.image) return item.image;
        if (item.images && item.images.length > 0) return item.images[0];
        return 'https://via.placeholder.com/300';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar showBanner={false} showPromotion={false} />
            <div className="pt-4 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">เปรียบเทียบสินค้า</h1>
                            <p className="text-gray-500 mt-2">เปรียบเทียบคุณสมบัติและราคาสินค้าที่คุณเลือก ({compareItems.length}/4)</p>
                        </div>
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                            <FaTrash size={14} />
                            ล้างรายการทั้งหมด
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-collapse min-w-[800px]">
                                <thead>
                                    <tr>
                                        <th className="p-4 w-48 bg-gray-50 border-b border-r border-gray-200 text-left text-sm font-semibold text-gray-500 sticky left-0 z-10">
                                            หัวข้อเปรียบเทียบ
                                        </th>
                                        {compareItems.map((item) => (
                                            <th key={item._id || item.id} className="p-4 w-64 border-b border-gray-200 bg-white relative">
                                                <button
                                                    onClick={() => handleRemove(item._id || item.id!)}
                                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="ลบออกจากรายการ"
                                                >
                                                    <FaTimes size={16} />
                                                </button>

                                                <div className="pt-4 pb-2">
                                                    <div className="w-full h-40 relative mb-4 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden group">
                                                        <img
                                                            src={getImageUrl(item)}
                                                            alt={item.name}
                                                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                        />

                                                        {/* Category & Condition Badges */}
                                                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                                                            {item.category && (
                                                                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                                                                    {item.category}
                                                                </span>
                                                            )}
                                                            {item.condition && (
                                                                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                                                                    {item.condition}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Link href={`/products/${item._id || item.id}`} className="block">
                                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-blue-600 mb-2 min-h-[3.5rem]">
                                                            {item.name}
                                                        </h3>
                                                    </Link>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-xl font-bold text-blue-600">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                        {item.originalPrice && item.originalPrice > item.price && (
                                                            <span className="text-sm text-gray-400 line-through">
                                                                {formatPrice(item.originalPrice)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <AddToCartButton
                                                        onClick={() => addToCart({
                                                            id: item._id || item.id || '',
                                                            name: item.name,
                                                            price: item.price,
                                                            oldPrice: item.originalPrice,
                                                            image: getImageUrl(item),
                                                            images: item.images
                                                        })}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </th>
                                        ))}
                                        {/* Fill empty columns if less than 4 items */}
                                        {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                                            <th key={`empty-${index}`} className="p-4 w-64 border-b border-gray-200 bg-gray-50/50">
                                                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                                                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-2">
                                                        <span className="text-2xl">+</span>
                                                    </div>
                                                    <Link href="/" className="text-sm font-medium hover:text-blue-600 hover:underline">
                                                        เพิ่มสินค้า
                                                    </Link>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {/* Brand */}
                                    <tr>
                                        <td className="p-4 bg-gray-50 border-r border-gray-200 font-semibold text-gray-700 sticky left-0 z-10">
                                            แบรนด์
                                        </td>
                                        {compareItems.map((item) => (
                                            <td key={`brand-${item._id || item.id}`} className="p-4 text-center text-gray-600">
                                                {item.brand || '-'}
                                            </td>
                                        ))}
                                        {Array.from({ length: 4 - compareItems.length }).map((_, i) => <td key={`brand-e-${i}`} className="bg-gray-50/30"></td>)}
                                    </tr>




                                    {/* Stock */}
                                    <tr>
                                        <td className="p-4 bg-gray-50 border-r border-gray-200 font-semibold text-gray-700 sticky left-0 z-10">
                                            สถานะสินค้า
                                        </td>
                                        {compareItems.map((item) => (
                                            <td key={`stock-${item._id || item.id}`} className="p-4 text-center">
                                                {(item.stock && item.stock > 0) ? (
                                                    <span className="text-green-600 font-medium flex items-center justify-center gap-1">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        มีสินค้า ({item.stock})
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 font-medium flex items-center justify-center gap-1">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                        สินค้าหมด
                                                    </span>
                                                )}
                                            </td>
                                        ))}
                                        {Array.from({ length: 4 - compareItems.length }).map((_, i) => <td key={`stock-e-${i}`} className="bg-gray-50/30"></td>)}
                                    </tr>

                                    {/* Description */}
                                    <tr>
                                        <td className="p-4 bg-gray-50 border-r border-gray-200 font-semibold text-gray-700 sticky left-0 z-10 align-top">
                                            รายละเอียด
                                        </td>
                                        {compareItems.map((item) => (
                                            <td key={`desc-${item._id || item.id}`} className="p-4 text-left text-gray-600 align-top text-sm">
                                                <p className="line-clamp-4 hover:line-clamp-none transition-all">
                                                    {item.description || '-'}
                                                </p>
                                            </td>
                                        ))}
                                        {Array.from({ length: 4 - compareItems.length }).map((_, i) => <td key={`desc-e-${i}`} className="bg-gray-50/30"></td>)}
                                    </tr>

                                    {/* Specifications - This might need dynamic rendering key by key if specifications map is consistent */}
                                    <tr>
                                        <td className="p-4 bg-gray-50 border-r border-gray-200 font-semibold text-gray-700 sticky left-0 z-10 align-top">
                                            สเปคอื่นๆ
                                        </td>
                                        {compareItems.map((item) => {
                                            // Normalize specifications to an object
                                            let specs: Record<string, string> = {};
                                            if (item.specifications) {
                                                if (item.specifications instanceof Map) {
                                                    item.specifications.forEach((value: string, key: string) => {
                                                        specs[key] = value;
                                                    });
                                                } else {
                                                    specs = item.specifications as Record<string, string>;
                                                }
                                            }

                                            return (
                                                <td key={`spec-${item._id || item.id}`} className="p-4 text-left align-top">
                                                    {Object.keys(specs).length > 0 ? (
                                                        <ul className="space-y-1 text-sm text-gray-600">
                                                            {Object.entries(specs).slice(0, 5).map(([key, value]) => (
                                                                <li key={key} className="flex justify-between">
                                                                    <span className="font-medium text-gray-700">{key}</span>
                                                                    <span>{value as string}</span>
                                                                </li>
                                                            ))}
                                                            {Object.keys(specs).length > 5 && (
                                                                <li className="text-center text-xs text-blue-500 pt-1">
                                                                    ดูเพิ่มเติมในหน้าสินค้า
                                                                </li>
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm center">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        {Array.from({ length: 4 - compareItems.length }).map((_, i) => <td key={`spec-e-${i}`} className="bg-gray-50/30"></td>)}
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Features />
            <Footer />
        </div >
    );
}
