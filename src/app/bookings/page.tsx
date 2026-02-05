'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/BottomNav';

// --- Types ---
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Booking {
    id: string;
    propertyId: string; // Added propertyId
    propertyTitle: string;
    propertyImage: string;
    location: string;
    price: number;
    startDate: string;
    endDate: string;
    status: BookingStatus;
    // For "Incoming" requests
    guestName?: string;
    guestAvatar?: string;
    // For "My Bookings"
    ownerName?: string;
}

// Helper to calculate nights
const calculateNights = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
};

// --- Mock Data ---
const INITIAL_MY_BOOKINGS: Booking[] = [
    {
        id: 'b1',
        propertyId: '1',
        propertyTitle: 'شقة فاخرة تطل على البحر',
        propertyImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
        location: 'منطقة الفيلات',
        price: 4500,
        startDate: '2024-06-15',
        endDate: '2024-06-18',
        status: 'pending',
        ownerName: 'الحاج محمد'
    },
    {
        id: 'b2',
        propertyId: '2',
        propertyTitle: 'شالية أرضي بحديقة',
        propertyImage: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=400&q=80',
        location: '15 مايو',
        price: 1600,
        startDate: '2024-05-01',
        endDate: '2024-05-03',
        status: 'confirmed',
        ownerName: 'أم كريم'
    }
];

const INITIAL_INCOMING_REQUESTS: Booking[] = [
    {
        id: 'r1',
        propertyId: '3',
        propertyTitle: 'ستوديو اقتصادي للطلاب',
        propertyImage: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80',
        location: 'حي الشباب',
        price: 3000,
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        status: 'pending',
        guestName: 'أحمد علي',
        guestAvatar: ''
    }
];

export default function BookingsPage() {
    const [activeTab, setActiveTab] = useState<'my-bookings' | 'incoming'>('my-bookings');
    const [myBookings, setMyBookings] = useState<Booking[]>(INITIAL_MY_BOOKINGS);
    const [incomingRequests, setIncomingRequests] = useState<Booking[]>(INITIAL_INCOMING_REQUESTS);

    // --- Actions ---
    const handleCancelBooking = (id: string) => {
        if (confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
            setMyBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        }
    };

    const handleAcceptRequest = (id: string) => {
        setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));
    };

    const handleRejectRequest = (id: string) => {
        if (confirm('هل تريد رفض هذا الطلب؟')) {
            setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
        }
    };

    const getStatusBadge = (status: BookingStatus) => {
        switch (status) {
            case 'pending': return <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-md shadow-sm">قيد الانتظار</span>;
            case 'confirmed': return <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md shadow-sm">مؤكد</span>;
            case 'completed': return <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-md shadow-sm">مكتمل</span>;
            case 'cancelled': return <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-sm">ملغي</span>;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-28">
            {/* Header */}
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 dark:border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-2">الحجوزات</h1>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl">
                        <button
                            onClick={() => setActiveTab('my-bookings')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all
                                ${activeTab === 'my-bookings'
                                    ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            حجوزاتي
                        </button>
                        <button
                            onClick={() => setActiveTab('incoming')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all
                                ${activeTab === 'incoming'
                                    ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            طلبات واردة
                            {incomingRequests.filter(r => r.status === 'pending').length > 0 && (
                                <span className="mr-2 w-2 h-2 rounded-full bg-red-500 inline-block align-middle mb-0.5"></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Content: My Bookings */}
                {activeTab === 'my-bookings' && (
                    <div className="space-y-4 animate-fadeIn">
                        {myBookings.length === 0 ? (
                            <EmptyState message="ليس لديك حجوزات حالية" icon="calendar_month" />
                        ) : (
                            myBookings.map(booking => (
                                <div key={booking.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 group">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                                            <img src={booking.propertyImage} className="w-full h-full object-cover" alt={`صورة ${booking.propertyTitle}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{booking.propertyTitle}</h3>
                                                    {getStatusBadge(booking.status)}
                                                </div>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                    {calculateNights(booking.startDate, booking.endDate)} ليالي
                                                    <span className="mx-1">•</span>
                                                    {booking.location}
                                                </p>
                                            </div>

                                            <div className="flex justify-between items-end mt-2">
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold">التاريخ</div>
                                                    <div className="font-medium text-xs text-gray-700 dark:text-gray-300 dir-ltr">
                                                        {new Date(booking.startDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })} -
                                                        {new Date(booking.endDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/properties/${booking.propertyId}`}
                                                    className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    تفاصيل العقار
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
                                        <Link
                                            href={`/messages/${booking.id}`}
                                            className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chat</span>
                                            مراسلة المالك
                                        </Link>
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="px-6 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                            >
                                                إلغاء
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Content: Incoming Requests */}
                {activeTab === 'incoming' && (
                    <div className="space-y-4 animate-fadeIn">
                        {incomingRequests.length === 0 ? (
                            <EmptyState message="لا توجد طلبات حجز جديدة" icon="inbox" />
                        ) : (
                            incomingRequests.map(request => (
                                <div key={request.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-gray-400 text-3xl">person</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base">{request.guestName}</h3>
                                            <p className="text-gray-500 text-sm">يرغب في حجز <span className="font-medium text-gray-700 dark:text-gray-300">{request.propertyTitle}</span></p>
                                            <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                                <span className="bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700">
                                                    {request.startDate}
                                                </span>
                                                <span className="self-center">إلى</span>
                                                <span className="bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700">
                                                    {request.endDate}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {request.status === 'pending' ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleAcceptRequest(request.id)}
                                                className="py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                                            >
                                                قبول الحجز
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(request.id)}
                                                className="py-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
                                            >
                                                رفض
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full py-3 bg-gray-50 dark:bg-zinc-800 rounded-xl text-center">
                                            {getStatusBadge(request.status)}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}

function EmptyState({ message, icon }: { message: string, icon: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-400 text-4xl">{icon}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{message}</p>
        </div>
    );
}
