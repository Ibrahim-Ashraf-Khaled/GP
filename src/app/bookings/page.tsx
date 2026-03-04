'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseService, IS_MOCK_MODE } from '@/services/supabaseService';

// --- Types ---
export type BookingStatusUI = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'unknown';

interface Booking {
    id: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    location: string;
    price: number;
    startDate: string;
    endDate: string;
    status: BookingStatusUI;
    guestName?: string;
    guestAvatar?: string;
    ownerName?: string;
}

// Helper to calculate nights
const calculateNights = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
};

// Normalize DB status to UI status
const normalizeBookingStatus = (dbStatus: string | null | undefined): BookingStatusUI => {
    if (!dbStatus) return 'unknown';
    const s = dbStatus.toLowerCase();

    // Legacy maps
    if (s === 'pending') return 'pending';
    if (s === 'confirmed') return 'confirmed';
    if (s === 'completed') return 'completed';
    if (s === 'cancelled') return 'cancelled';

    // V1/V2 maps
    if (s === 'requested' || s === 'payment_pending' || s === 'payment_uploaded') return 'pending';
    if (s === 'approved' || s === 'active') return 'confirmed';
    if (s === 'rejected' || s === 'expired' || s === 'cancelled_by_tenant' || s === 'cancelled_by_landlord' || s === 'disputed') return 'cancelled';

    return 'unknown';
};

const getStatusBadge = (status: BookingStatusUI) => {
    switch (status) {
        case 'pending':
            return <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-md shadow-sm">قيد الانتظار</span>;
        case 'confirmed':
            return <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md shadow-sm">مؤكد</span>;
        case 'completed':
            return <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-md shadow-sm">مكتمل</span>;
        case 'cancelled':
            return <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-sm">ملغي</span>;
        default:
            return <span className="px-2 py-1 bg-gray-400 text-white text-xs font-bold rounded-md shadow-sm">غير معروف</span>;
    }
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
    const { user, loading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'my-bookings' | 'incoming'>('my-bookings');
    const [myBookings, setMyBookings] = useState<Booking[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<Booking[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!user && !IS_MOCK_MODE) return;

        setError(null);
        setLoading(true);

        try {
            if (IS_MOCK_MODE) {
                setMyBookings(INITIAL_MY_BOOKINGS);
                setIncomingRequests(INITIAL_INCOMING_REQUESTS);
            } else if (user) {
                const { myBookings: myDbBookings, incomingRequests: incDbRequests, error: fetchError } = await supabaseService.getUserBookings(user.id);

                if (fetchError) throw fetchError;

                const formattedMyBookings: Booking[] = myDbBookings.map((b: any) => ({
                    id: b.id,
                    propertyId: b.property_id,
                    propertyTitle: b.property?.title || 'عقار غير معروف',
                    propertyImage: b.property?.images?.[0] || '',
                    location: b.property?.area || 'غير محدد',
                    price: b.total_amount,
                    startDate: b.start_date,
                    endDate: b.end_date,
                    status: normalizeBookingStatus(b.status),
                    ownerName: b.property?.owner_name || 'المالك'
                }));

                const formattedIncoming: Booking[] = incDbRequests.map((b: any) => ({
                    id: b.id,
                    propertyId: b.property_id,
                    propertyTitle: b.property?.title || 'عقار غير معروف',
                    propertyImage: b.property?.images?.[0] || '',
                    location: b.property?.area || 'غير محدد',
                    price: b.total_amount,
                    startDate: b.start_date,
                    endDate: b.end_date,
                    status: normalizeBookingStatus(b.status),
                    guestName: b.tenant_name || b.user?.full_name || 'ضيف',
                    guestAvatar: b.user?.avatar_url || ''
                }));

                setMyBookings(formattedMyBookings);
                setIncomingRequests(formattedIncoming);
            }
        } catch (err: any) {
            console.error(err);
            setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthLoading) return;

        if (!user && !IS_MOCK_MODE) {
            setLoading(false);
            return;
        }

        fetchData();
    }, [user, isAuthLoading]);

    // --- Actions ---
    const handleCancelBooking = async (id: string, currentStatus: string) => {
        if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;

        // Optimistic UI
        setMyBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));

        const { error } = await supabaseService.updateBookingStatus(id, 'cancelled');
        if (error) {
            alert('فشل في عملية الإلغاء. سيتم التراجع.');
            // Revert
            setMyBookings(prev => prev.map(b => b.id === id ? { ...b, status: normalizeBookingStatus(currentStatus) } : b));
        }
    };

    const handleAcceptRequest = async (id: string, currentStatus: string) => {
        setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));

        const { error } = await supabaseService.updateBookingStatus(id, 'confirmed');
        if (error) {
            alert('فشل في عملية القبول. سيتم التراجع.');
            setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: normalizeBookingStatus(currentStatus) } : r));
        }
    };

    const handleRejectRequest = async (id: string, currentStatus: string) => {
        if (!confirm('هل تريد رفض هذا الطلب؟')) return;

        setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));

        const { error } = await supabaseService.updateBookingStatus(id, 'cancelled');
        if (error) {
            alert('فشل في عملية الرفض. سيتم التراجع.');
            setIncomingRequests(prev => prev.map(r => r.id === id ? { ...r, status: normalizeBookingStatus(currentStatus) } : r));
        }
    };

    // Render logic
    if (isAuthLoading || loading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-black pb-28 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">جاري تحميل الحجوزات...</p>
            </main>
        );
    }

    if (!user && !IS_MOCK_MODE) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-black pb-28 flex flex-col items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">lock</span>
                    <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
                    <p className="text-gray-500 text-sm mb-6">يجب عليك تسجيل الدخول لعرض الحجوزات الخاصة بك</p>
                    <button
                        onClick={() => router.push('/auth?mode=login&redirect=/bookings')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                    >
                        تسجيل الدخول
                    </button>
                </div>
            </main>
        );
    }

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

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
                        <span className="material-symbols-outlined shrink-0">error</span>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{error}</p>
                            <button onClick={fetchData} className="text-xs font-bold mt-2 hover:underline">المحاولة مرة أخرى</button>
                        </div>
                    </div>
                )}

                {/* Content: My Bookings */}
                {activeTab === 'my-bookings' && (
                    <div className="space-y-4 animate-fadeIn">
                        {myBookings.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">calendar_month</span>
                                <p className="text-gray-500">ليس لديك حجوزات حالية</p>
                            </div>
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
                                                    href={`/property/${booking.propertyId}`}
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
                                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">chat</span>
                                            مراسلة المالك
                                        </Link>
                                        {booking.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelBooking(booking.id, booking.status)}
                                                className="px-4 py-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-sm transition-all flex items-center justify-center"
                                                title="إلغاء الحجز"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">close</span>
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
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">notifications_off</span>
                                <p className="text-gray-500">لا توجد طلبات واردة</p>
                            </div>
                        ) : (
                            incomingRequests.map(request => (
                                <div key={request.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                                            <img src={request.propertyImage} className="w-full h-full object-cover" alt={`صورة ${request.propertyTitle}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{request.propertyTitle}</h3>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden shrink-0">
                                                        {request.guestAvatar ? (
                                                            <img src={request.guestAvatar} className="w-full h-full object-cover" alt="Avatar" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-gray-400 text-sm w-full h-full flex items-center justify-center">person</span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate">
                                                        {request.guestName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end mt-2">
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-400 uppercase font-bold">التاريخ</div>
                                                    <div className="font-medium text-xs text-gray-700 dark:text-gray-300 dir-ltr">
                                                        {new Date(request.startDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })} -
                                                        {new Date(request.endDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/property/${request.propertyId}`}
                                                    className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    تفاصيل العقار
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {request.status === 'pending' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex gap-3">
                                            <button
                                                onClick={() => handleAcceptRequest(request.id, request.status)}
                                                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                                            >
                                                قبول الطلب
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(request.id, request.status)}
                                                className="flex-1 py-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                                            >
                                                رفض
                                            </button>
                                        </div>
                                    )}

                                    {request.status !== 'pending' && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                            <Link
                                                href={`/messages/${request.id}`}
                                                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">chat</span>
                                                مراسلة الضيف
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
