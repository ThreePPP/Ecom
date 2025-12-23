import React from 'react';

// Coin Icon Component
export const CoinIcon: React.FC<{ className?: string; size?: number }> = ({
    className = '',
    size = 16
}) => (
    <svg
        className={`inline-block ${className}`}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <circle cx="12" cy="12" r="10" fill="#F59E0B" />
        <circle cx="12" cy="12" r="8" fill="#FBBF24" />
        <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#92400E">C</text>
    </svg>
);

// Format price with coin icon (returns JSX)
export const formatCoinPrice = (price: number, showIcon: boolean = true) => {
    const formattedPrice = Math.round(price).toLocaleString();

    if (showIcon) {
        return (
            <span className="inline-flex items-center gap-1">
                <CoinIcon size={16} />
                <span>{formattedPrice}</span>
            </span>
        );
    }

    return <span>{formattedPrice} coins</span>;
};

// Format price as string only (no JSX)
export const formatCoinString = (price: number): string => {
    return `${Math.round(price).toLocaleString()} coins`;
};

// Simple coin display without icon
export const coinDisplay = (price: number): string => {
    return `${Math.round(price).toLocaleString()} coins`;
};
