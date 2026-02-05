'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';
import Header from '@/components/Header';
import { PropertyCard } from '@/components/PropertyCard';

// Mock data matches PropertyCardProps roughly
const featuredProperties = [
  {
    id: "1",
    title: "فيلا الواحة",
    location: "منطقة الفيلات، جمصة",
    price: 2000,
    priceUnit: "ليلة",
    image: "/images/property4.png",
    rating: 4.9,
    discount: 20,
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    isVerified: true
  },
  {
    id: "2",
    title: "ستوديو بانوراما",
    location: "شارع الكورنيش، جمصة",
    price: 850,
    priceUnit: "ليلة",
    image: "/images/property3.png",
    rating: 4.8,
    bedrooms: 1,
    bathrooms: 1,
    area: 60,
  },
];

const recentProperties = [
  {
    id: "3",
    title: "شقة فندقية فاخرة",
    location: "منطقة 15 مايو، جمصة",
    price: 1200,
    priceUnit: "ليلة",
    image: "/images/property1.png",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    isVerified: true,
    rating: 4.7,
  },
  {
    id: "4",
    title: "شاليه عائلي",
    location: "الكورنيش، صف ثاني",
    price: 800,
    priceUnit: "ليلة",
    image: "/images/property2.png",
    bedrooms: 2,
    bathrooms: 1,
    area: 80,
    isVerified: false,
    rating: 4.5,
  },
  {
    id: "5",
    title: "شقة مصيفية",
    location: "جمصة البلد",
    price: 500,
    priceUnit: "ليلة",
    image: "/images/property1.png",
    bedrooms: 2,
    bathrooms: 1,
    area: 90,
    isVerified: false,
    rating: 4.0,
  }
];

const categories = [
  { id: "all", icon: "apartment", label: "الكل", active: true },
  { id: "chalet", icon: "beach_access", label: "شاليهات", active: false },
  { id: "villa", icon: "home", label: "فيلات", active: false },
  { id: "studio", icon: "weekend", label: "ستوديو", active: false },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
      {/* Static Header (scrolls away) */}
      <Header />

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-4 py-4 border-b border-gray-200 dark:border-white/10 transition-all duration-300">
        <div className="max-w-5xl mx-auto relative group">
          {/* Search Icon (Right) */}
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors text-xl">
            search
          </span>

          <input
            type="text"
            placeholder="ابحث عن شاليه، فيلا، أو شقة..."
            className="w-full p-4 pr-12 pl-12 rounded-2xl bg-gray-100 dark:bg-white/10 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-black text-gray-900 dark:text-white transition-all outline-none shadow-sm placeholder-gray-500"
          />

          {/* Filter Button (Left) */}
          <Link
            href="/search"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-zinc-800 p-2 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300 hover:text-primary active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </Link>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex shrink-0 items-center justify-center gap-x-2 rounded-full px-5 py-2.5 transition-all text-sm font-medium border active:scale-95 ${activeCategory === category.id
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-white dark:bg-surface-dark border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary/30"
                }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {category.icon}
              </span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-6">

        {/* Featured Section */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-4 mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              عروض مميزة <span className="text-xl">🔥</span>
            </h3>
            <Link
              href="/search"
              className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
            >
              عرض الكل
              <span className="material-symbols-outlined text-[18px] rtl:rotate-180">
                arrow_right_alt
              </span>
            </Link>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar px-4 gap-4 pb-4 snap-x snap-mandatory">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="flex-none w-[300px] snap-center animate-fadeIn"
              >
                <PropertyCard {...property} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Listings */}
        <div>
          <div className="px-4 mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              أضيف حديثاً <span className="text-xl">✨</span>
            </h3>
          </div>

          <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentProperties.map((property) => (
              <div key={property.id} className="animate-slideUp">
                <PropertyCard {...property} />
              </div>
            ))}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
