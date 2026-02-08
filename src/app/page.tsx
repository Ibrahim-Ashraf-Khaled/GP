import { Metadata } from 'next';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';
import Header from '@/components/Header';
import { PropertyCard } from '@/components/PropertyCard';
import { CategoryFilter } from '@/components/CategoryFilter';

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
    area: 45,
    isVerified: true
  },
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

const recentProperties = [
  {
    id: "6",
    title: "فيلا بإطلالة بحرية",
    location: "منطقة الشاطئ، جمصة",
    price: 1500,
    priceUnit: "ليلة",
    image: "/images/property4.png",
    bedrooms: 3,
    bathrooms: 2,
    area: 200,
    isVerified: true,
    rating: 4.9,
  },
  {
    id: "7",
    title: "شالية حديثة",
    location: "الكورنيش، جمصة",
    price: 650,
    priceUnit: "ليلة",
    image: "/images/property3.png",
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    isVerified: false,
    rating: 4.6,
  },
  {
    id: "8",
    title: "شقة عائلية واسعة",
    location: "جمصة البلد",
    price: 750,
    priceUnit: "ليلة",
    image: "/images/property2.png",
    bedrooms: 3,
    bathrooms: 2,
    area: 140,
    isVerified: true,
    rating: 4.4,
  },
];

export const metadata: Metadata = {
  title: 'عقارات جمصة - ابحث عن شاليهات، فيلات، وشقق للإيجار',
  description: 'اكتشف أفضل العقارات للإيجار في جمصة. شاليهات، فيلات، وشقق عصرية بأسعار تنافسية. احجز الآن واستمتع بإجازتك.',
  keywords: ['عقارات جمصة', 'شاليهات جمصة', 'فيلات جمصة', 'شقق للإيجار جمصة', 'إجار عطلات جمصة'],
  openGraph: {
    title: 'عقارات جمصة - أفضل الإيجارات السكنية',
    description: 'اكتشف أفضل العقارات للإيجار في جمصة',
    type: 'website',
    locale: 'ar_EG',
  },
};

export default function HomePage() {
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

      {/* Client-side Category Filter */}
      <CategoryFilter />

      {/* Featured Properties Section */}
      <section className="px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">stars</span>
            مميز
          </h2>
          <Link
            href="/search?featured=true"
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section>

      {/* Recent Properties Section */}
      <section className="px-4 py-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">new_releases</span>
            حديث الإضافة
          </h2>
          <Link
            href="/search?recent=true"
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-primary to-primary/90 rounded-3xl p-8 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-4">هل تملك عقار في جمصة؟</h2>
            <p className="text-white/90 mb-6 max-w-md mx-auto">
              انشر عقارك في منصتنا واكتآف من آلاف المستأجرين الباحثين عن إقامة مميزة
            </p>
            <Link
              href="/add-property"
              className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-2xl font-medium hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined">add_home</span>
              أضف عقارك الآن
            </Link>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}