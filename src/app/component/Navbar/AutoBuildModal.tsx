import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaBolt, FaTimes } from 'react-icons/fa';

interface AutoBuildModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AutoBuildModal: React.FC<AutoBuildModalProps> = ({ isOpen, onClose }) => {
    const [budget, setBudget] = useState<string>('');
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (budget) {
            // Redirect to auto build page with budget
            router.push(`/pc-builder/auto?budget=${budget}&autostart=true`);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div
                className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                    <FaTimes size={16} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
                        <FaBolt size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">จัดสเปคคอมอัตโนมัติ</h2>
                    <p className="text-sm text-gray-500">ระบุงบประมาณที่คุณต้องการ เราจะจัดให้คุ้มที่สุด</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="ระบุงบประมาณ (บาท)"
                            className="w-full px-5 py-4 bg-gray-50 text-gray-900 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium text-center placeholder:text-gray-400 transition-all shadow-inner"
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!budget}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        เริ่มจัดสเปคทันที
                    </button>
                </form>

                <p className="text-xs text-gray-400 text-center mt-6">
                    *ระบบจะคำนวณสเปคที่ดีที่สุดในช่วงราคาที่คุณระบุ
                </p>
            </div>
        </div>
    );
};

export default AutoBuildModal;
