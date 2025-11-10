"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  theme?: 'default' | 'white'; // เพิ่ม prop theme
}

export default function Breadcrumb({ items, theme = 'default' }: BreadcrumbProps) {
  const router = useRouter();

  // กำหนดสีตามธีม
  const colors = theme === 'white' 
    ? {
        home: 'text-white hover:text-blue-100',
        separator: 'text-blue-200',
        link: 'text-white hover:text-blue-100',
        current: 'text-white font-medium'
      }
    : {
        home: 'text-gray-600 hover:text-orange-500',
        separator: 'text-gray-400',
        link: 'text-gray-600 hover:text-orange-500',
        current: 'text-gray-900 font-medium'
      };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => router.push('/')}
          className={`${colors.home} transition-colors`}
        >
          Home
        </button>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <span className={colors.separator}>›</span>
            {item.href ? (
              <button
                onClick={() => router.push(item.href!)}
                className={`${colors.link} transition-colors`}
              >
                {item.label}
              </button>
            ) : (
              <span className={colors.current}>{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
