'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/BottomNav';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { ROLE_LANDLORD, ROLE_TENANT } from '@/types';

export default function ProfilePage() {
    const { user, profile, signOut, loading: authLoading } = useAuth();
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Stats State
    const [stats, setStats] = useState({
        properties: 0,
        unlocked: 0,
        favorites: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (user?.id) {
                const [myProps, unlocked, favs] = await Promise.all([
                    supabaseService.getProperties({ ownerId: user.id }),
                    supabaseService.getUnlockedProperties(user.id),
                    supabaseService.getFavorites(user.id)
                ]);

                setStats({
                    properties: myProps.length,
                    unlocked: unlocked.length,
                    favorites: favs.length,
                });
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (!isMounted) {
        return null;
    }


    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
            <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span>
        </div>
    );

    // حالة عدم تسجيل الدخول: صفحة توجيه جذابة
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center pb-24">
                <div className="w-24 h-24 bg-gray-200 dark:bg-zinc-900 rounded-full mb-6 flex items-center justify-center animate-bounce-slow">
                    <span className="material-symbols-outlined text-gray-400 text-5xl">person</span>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">مرحباً بك في عقارات جمصة</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                    سجل دخولك الآن لتتمكن من حفظ مفضلاتك، إدارة عقاراتك، والتواصل مع الملاك بكل سهولة.
                </p>
                <Link
                    href="/auth"
                    className="w-full max-w-sm bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">login</span>
                    تسجيل الدخول / إنشاء حساب
                </Link>
                <BottomNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-28">
            <div className="max-w-2xl mx-auto px-4 pt-8 space-y-6">

                {/* 1. Profile Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                    <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[3px]">
                                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                                    {profile?.avatar ? (
                                        <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-gray-400 text-4xl">person</span>
                                    )}
                                </div>
                            </div>
                            {profile?.isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 border-4 border-white dark:border-zinc-900 flex items-center justify-center" title="موثق">
                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                {profile?.name || 'مستخدم'}
                            </h1>
                            <p className="text-gray-400 text-sm mt-0.5 dir-ltr text-right truncate">
                                {profile?.phone || 'لا يوجد رقم هاتف'}
                            </p>
                            <div className="flex gap-2 mt-3">
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1
                                    ${profile?.role === ROLE_LANDLORD
                                        ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                        : 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'}`}
                                >
                                    <span className="material-symbols-outlined text-[14px]">{profile?.role === ROLE_LANDLORD ? 'real_estate_agent' : 'person'}</span>
                                    {profile?.role === ROLE_LANDLORD ? 'صاحب عقار' : 'مستأجر'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setEditModalOpen(true)}
                            className="w-10 h-10 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <span className="material-symbols-outlined">edit</span>
                        </button>
                    </div>
                </div>

                {/* 2. Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <StatCard
                        icon="home_work"
                        label="عقاراتي"
                        value={stats.properties}
                        color="text-blue-500"
                        delay="0"
                    />
                    <StatCard
                        icon="lock_open"
                        label="مفتوح"
                        value={stats.unlocked}
                        color="text-green-500"
                        delay="100"
                    />
                    <StatCard
                        icon="favorite"
                        label="المفضلة"
                        value={stats.favorites}
                        color="text-red-500"
                        delay="200"
                    />
                </div>

                {/* 3. Actions Menu */}
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="p-2">
                        <MenuLink
                            icon="settings"
                            label="إعدادات الحساب"
                            onClick={() => setEditModalOpen(true)}
                        />


                        {(profile?.role === ROLE_LANDLORD || profile?.role === 'admin') && (
                            <MenuLink
                                href="/my-properties"
                                icon="real_estate_agent"
                                label="إدارة عقاراتي"
                            />
                        )}

                        <MenuLink
                            href="/bookings"
                            icon="event_note"
                            label="حجوزاتي وطلباتي"
                            badge={2} // mock count
                        />

                        <MenuLink
                            href="/messages"
                            icon="forum"
                            label="الرسائل"
                        />

                        <MenuLink
                            href="/favorites"
                            icon="favorite"
                            label="العقارات المفضلة"
                        />

                        <MenuLink
                            href="/add-property"
                            icon="add_circle"
                            label="إضافة عقار جديد"
                            isSpecial
                        />
                    </div>
                </div>

                {/* 4. Support & Logout */}
                <div className="space-y-3 pb-6">
                    <Link href="/support" className="block">
                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl flex items-center gap-3 shadow-sm border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500">
                                <span className="material-symbols-outlined">headset_mic</span>
                            </div>
                            <span className="font-bold text-gray-700 dark:text-gray-300">الدعم والمساعدة</span>
                        </div>
                    </Link>

                    <button
                        onClick={() => signOut()}
                        className="w-full p-4 bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        تسجيل الخروج
                    </button>

                    <p className="text-center text-xs text-gray-400 pt-4">
                        الإصدار 1.0.0 • عقارات جمصة
                    </p>
                </div>
            </div>

            {/* Settings Modal */}
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} />

            <BottomNav />
        </div>
    );
}

// Helper Components
function StatCard({ icon, label, value, color, delay }: any) {
    return (
        <div
            className="bg-white dark:bg-zinc-900 p-4 rounded-[1.5rem] text-center border border-gray-100 dark:border-white/5 shadow-sm animate-fadeIn"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`text-2xl mb-1 flex justify-center ${color}`}>
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div className="text-xl font-black text-gray-900 dark:text-white mb-1">{value}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider opacity-80">{label}</div>
        </div>
    );
}


function MenuLink({ href, icon, label, badge, onClick, isSpecial }: any) {
    const content = (
        <div className={`flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer group`}>
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
            ${isSpecial
                        ? 'bg-primary/10 text-primary'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 group-hover:bg-white dark:group-hover:bg-zinc-700'
                    }`}
                >
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <span className={`font-bold ${isSpecial ? 'text-primary' : 'text-gray-700 dark:text-gray-200'}`}>
                    {label}
                </span>
                {badge > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {badge}
                    </span>
                )}
            </div>
            <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors rtl:rotate-180">chevron_right</span>
        </div>
    );

    if (href) {
        return <Link href={href} className="block mb-1">{content}</Link>;
    }

    return <button onClick={onClick} className="w-full text-right block mb-1">{content}</button>;
}
