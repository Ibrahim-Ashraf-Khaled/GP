'use client';

import { useState, useEffect } from 'react';
import { Property, User } from '@/types';
import Header from '@/components/Header';
import { UnlockModal } from '@/components/UnlockModal';
import { ImageSkeleton } from '@/components/ImageSkeleton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import WhatsAppButton from '@/components/WhatsAppButton';

interface ClientPropertyDetailsProps {
    initialProperty: Property;
}

export default function ClientPropertyDetails({ initialProperty }: ClientPropertyDetailsProps) {
    const [property, setProperty] = useState<Property>(initialProperty);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Check unlock status immediately if user is present
        if (user && property) {
            checkUnlockStatus(user.id, property.id);
        }
    }, [user, property]);

    const checkUnlockStatus = async (userId: string, propertyId: string) => {
        const unlocked = await supabaseService.isPropertyUnlocked(userId, propertyId);
        setIsUnlocked(unlocked);
    };

    const handleUnlockClick = () => {
        if (!isAuthenticated) {
            if (confirm('يرجى تسجيل الدخول أولاً لرؤية بيانات المالك. هل تريد الذهاب لصفحة الدخول؟')) {
                router.push('/auth');
            }
            return;
        }
        setShowUnlockModal(true);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: property?.title,
                    text: `شاهد هذا العقار المميز في جمصة: ${property?.title}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('تم نسخ الرابط!');
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-24">
            <Header />

            {/* 1. معرض الصور */}
            <section className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden group">
                {!imageLoaded && <div className="absolute inset-0 z-10"><ImageSkeleton /></div>}
                <img
                    src={property.images[0]}
                    className={`w-full h-full object-cover transition-transform duration-700 hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    alt={property.title}
                    onLoad={() => setImageLoaded(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* زر الرجوع والمشاركة العائم */}
                <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition">
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/50 transition">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                </div>
            </section>

            {/* 2. تفاصيل العقار */}
            <section className="max-w-4xl mx-auto px-4 -mt-16 relative z-10" dir="rtl">
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                                    {property.category}
                                </span>
                                {property.isVerified && (
                                    <span className="bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                        موثوق
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">{property.title}</h1>
                            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm">
                                <span className="material-symbols-outlined text-[18px]">location_on</span>
                                {property.location.address}
                            </p>
                        </div>
                        <div className="text-left rtl:text-left rtl:ml-0 ltr:ml-4">
                            <p className="text-primary font-bold text-2xl md:text-3xl">{property.price} <span className="text-sm font-normal">ج.م</span></p>
                            <p className="text-xs text-gray-400">لكل {property.priceUnit}</p>
                        </div>
                    </div>

                    {/* المميزات السريعة */}
                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100 dark:border-gray-800 my-6">
                        <div className="text-center group">
                            <div className="w-12 h-12 mx-auto bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">bed</span>
                            </div>
                            <p className="text-xs text-gray-500">{property.bedrooms} غرف</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-12 h-12 mx-auto bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">bathtub</span>
                            </div>
                            <p className="text-xs text-gray-500">{property.bathrooms} حمام</p>
                        </div>
                        <div className="text-center group">
                            <div className="w-12 h-12 mx-auto bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">straighten</span>
                            </div>
                            <p className="text-xs text-gray-500">{property.area} م²</p>
                        </div>
                    </div>

                    {/* الوصف */}
                    <div className="mb-8">
                        <h2 className="font-bold text-lg mb-3 text-gray-900 dark:text-white border-r-4 border-primary pr-3">عن هذا العقار</h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                            {property.description}
                        </p>
                    </div>

                    {/* المميزات الكاملة */}
                    <div>
                        <h2 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-r-4 border-primary pr-3">المميزات والخدمات</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {property.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. شريط التواصل (Sticky Action Bar) */}
            {/* 3. شريط التواصل (Sticky Action Bar) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark :border-white/10 z-40 transition-all duration-300">
                <div className="max-w-4xl mx-auto flex gap-4">
                    {isUnlocked ? (
                        <>
                            <button
                                onClick={() => router.push(`/property/${property.id}/booking`)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined">calendar_today</span>
                                <span>حجز الآن</span>
                            </button>
                            <a
                                href={`tel:${property.ownerPhone}`}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-95"
                            >
                                <span className="material-symbols-outlined">call</span>
                                <span>اتصال</span>
                            </a>
                            <WhatsAppButton
                                phone={property.ownerPhone}
                                propertyTitle={property.title}
                                className="w-16 h-14 !p-0 !rounded-2xl"
                            />
                        </>
                    ) : (
                        <button
                            onClick={handleUnlockClick}
                            className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 animate-pulse btn-glow active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined">lock_open</span>
                            <span>فك قفل رقم المالك (50 ج.م)</span>
                        </button>
                    )}
                </div>
            </div>

            {/* مودال الدفع */}
            {showUnlockModal && (
                <UnlockModal
                    propertyId={property.id}
                    onClose={() => setShowUnlockModal(false)}
                    onSuccess={() => {
                        setShowUnlockModal(false);
                        router.push(`/property/${property.id}/booking`);
                    }}
                />
            )}
        </main>
    );
}
