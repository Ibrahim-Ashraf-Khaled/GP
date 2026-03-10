# تحديث كود صفحة "حجوزاتي" (src/app/bookings/page.tsx)

فيما يلي الكود المحدّث لصفحة الحجوزات مع استبدال البيانات التجريبية ببيانات فعلية مخصصة للمستخدم الحالي. تم إزالة المتغيرين INITIAL_MY_BOOKINGS و INITIAL_INCOMING_REQUESTS واستخدام جلب البيانات من قاعدة البيانات (باستخدام Supabase كمثال) عبر سياق المصادقة AuthContext للحصول على حجوزات المستخدم وطلباته الواردة:

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';  // تأكد من تهيئة supabase بشكل صحيح في المشروع

// نوع حالة الحجز
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// واجهة بيانات الحجز (مطابقة للهيكل المتوقع من قاعدة البيانات أو API)
interface Booking {
    id: string;
    propertyId: string;
    propertyTitle: string;
    propertyImage: string;
    location: string;
    price: number;
    startDate: string;
    endDate: string;
    status: BookingStatus;
    // الحقول الاختيارية حسب نوع القائمة
    guestName?: string;    // اسم الضيف (للطلبات الواردة)
    guestAvatar?: string;  // صورة الضيف (للطلبات الواردة)
    ownerName?: string;    // اسم صاحب العقار (لحجوزاتي)
}

export default function BookingsPage() {
    const { user } = useAuth();  // المستخدم الحالي من سياق AuthContext
    const [activeTab, setActiveTab] = useState<'my-bookings' | 'incoming'>('my-bookings');
    const [myBookings, setMyBookings] = useState<Booking[]>([]);           // قائمة حجوزاتي الفعلية
    const [incomingRequests, setIncomingRequests] = useState<Booking[]>([]); // قائمة الطلبات الواردة الفعلية
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!user) {
            // في حال عدم تسجيل الدخول، لا توجد بيانات لجلبها
            setLoading(false);
            return;
        }
        // **جلب البيانات الفعلية من قاعدة البيانات للمستخدم الحالي بدلاً من البيانات التجريبية**
        const fetchBookings = async () => {
            // جلب الحجوزات التي قام بها المستخدم (حجوزاتي)
            const { data: myBookingsData, error: myError } = await supabase
                .from('bookings')
                // تعديل الاستعلام أدناه وفق هيكل قاعدة البيانات:
                // نجلب بيانات الحجز ونضم معلومات العقار (العنوان، الصورة...) ومعلومات المالك
                .select(`
                    id, propertyId, propertyTitle, propertyImage, location, price, startDate, endDate, status,
                    property ( owner ( name ) )
                `)
                .eq('user_id', user.id);  // بافتراض وجود حقل user_id يشير لمعرف المستخدم (الضيف)

            // جلب الطلبات الواردة للمستخدم (أي حجوزات يكون فيها المستخدم هو صاحب العقار)
            const { data: incomingData, error: incError } = await supabase
                .from('bookings')
                // تضمين معلومات الضيف (مثال: الاسم والصورة) مع بيانات العقار
                .select(`
                    id, propertyId, propertyTitle, propertyImage, location, price, startDate, endDate, status,
                    user ( name, avatar )
                `)
                .eq('owner_id', user.id);  // بافتراض وجود حقل owner_id يشير لصاحب العقار

            if (!myError && myBookingsData) {
                setMyBookings(myBookingsData);
            }
            if (!incError && incomingData) {
                setIncomingRequests(incomingData);
            }
            setLoading(false);
        };
        fetchBookings();
    }, [user]);

    // دوال الإجراءات (تحدث قاعدة البيانات وتحدث الحالة المحلية بعد نجاح العملية)
    const handleCancelBooking = async (id: string) => {
        if (!confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) return;
        // تحديث الحالة محلياً بشكل فوري (تفادي تأخير الواجهة)
        setMyBookings(prev =>
            prev.map(b => (b.id === id ? { ...b, status: 'cancelled' } : b))
        );
        // استدعاء API أو قاعدة البيانات لإلغاء الحجز فعلياً (تحديث الحالة إلى "ملغي")
        await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
        // ملاحظة: بدلاً من الاستدعاء المباشر، يمكن استخدام واجهة REST: 
        // await fetch(`/api/bookings/${id}/cancel`, { method: 'POST' });
    };

    const handleAcceptRequest = async (id: string) => {
        // قبول الطلب الوارد وتحديث الواجهة محلياً
        setIncomingRequests(prev =>
            prev.map(r => (r.id === id ? { ...r, status: 'confirmed' } : r))
        );
        // تحديث حالة الحجز في قاعدة البيانات إلى "مؤكد"
        await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id);
        // يمكن استخدام API REST مماثل: await fetch(`/api/bookings/${id}/accept`, { method: 'POST' });
    };

    const handleRejectRequest = async (id: string) => {
        if (!confirm('هل تريد رفض هذا الطلب؟')) return;
        // رفض الطلب محلياً
        setIncomingRequests(prev =>
            prev.map(r => (r.id === id ? { ...r, status: 'cancelled' } : r))
        );
        // تحديث الحالة في قاعدة البيانات إلى "ملغي"
        await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
        // أو عبر واجهة API: await fetch(`/api/bookings/${id}/reject`, { method: 'POST' });
    };

    if (loading) {
        // يمكن هنا عرض مؤشر تحميل أو Skeleton أثناء انتظار البيانات
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-black pb-28">
                <p className="text-center p-8">جاري تحميل الحجوزات...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-black pb-28">
            {/* رأس الصفحة */}
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-40 border-b border-gray-100 dark:border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-2">الحجوزات</h1>
                    {/* ألسنة التبويب */}
                    <div className="flex p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl">
                        <button
                            onClick={() => setActiveTab('my-bookings')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                activeTab === 'my-bookings'
                                    ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            حجوزاتي
                        </button>
                        <button
                            onClick={() => setActiveTab('incoming')}
                            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                                activeTab === 'incoming'
                                    ? 'bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
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
                {/* المحتوى: قائمة حجوزاتي */}
                {activeTab === 'my-bookings' && (
                    <div className="space-y-4 animate-fadeIn">
                        {myBookings.length === 0 ? (
                            <EmptyState message="ليس لديك حجوزات حالية" icon="calendar_month" />
                        ) : (
                            myBookings.map(booking => (
                                <div key={booking.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 group">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                                            <img
                                                src={booking.propertyImage}
                                                alt={`صورة ${booking.propertyTitle}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
                                                        {booking.propertyTitle}
                                                    </h3>
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
                                                        {new Date(booking.startDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })} -{' '}
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
                                    {/* إجراءات على حجوزاتي */}
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
                                        {/* يمكن إضافة زر تعديل الحجز هنا إذا كان مسموحاً بتعديل الطلب */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* المحتوى: قائمة الطلبات الواردة */}
                {activeTab === 'incoming' && (
                    <div className="space-y-4 animate-fadeIn">
                        {incomingRequests.length === 0 ? (
                            <EmptyState message="لا توجد طلبات حجز جديدة" icon="inbox" />
                        ) : (
                            incomingRequests.map(request => (
                                <div key={request.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                                            {request.guestAvatar ? (
                                                <img src={request.guestAvatar} alt={request.guestName} className="w-16 h-16 rounded-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-gray-400 text-3xl">person</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base">{request.guestName}</h3>
                                            <p className="text-gray-500 text-sm">
                                                يرغب في حجز{' '}
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    {request.propertyTitle}
                                                </span>
                                            </p>
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
        </main>
    );
}

// دوال مساعدة (لحساب عدد الليالي وعرض شارة الحالة) - بدون تغيير عن السابق
function calculateNights(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
}

function getStatusBadge(status: BookingStatus) {
    switch (status) {
        case 'pending':
            return <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-md shadow-sm">قيد الانتظار</span>;
        case 'confirmed':
            return <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md shadow-sm">مؤكد</span>;
        case 'completed':
            return <span className="px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-md shadow-sm">مكتمل</span>;
        case 'cancelled':
            return <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-sm">ملغي</span>;
    }
}

// مكون حالة فارغة لإظهار رسالة عند عدم وجود حجوزات
function EmptyState({ message, icon }: { message: string; icon: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-gray-400 text-4xl">{icon}</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{message}</p>
        </div>
    );
}
```

ملاحظة: في الشيفرة أعلاه تم استخدام عميل Supabase مباشرة لجلب البيانات وتحديثها. يمكن تعديل الاستعلامات (.select(...) وحقولها) بحسب هيكل قاعدة البيانات الفعلية (على سبيل المثال، قد تحتاج لربط جدول bookings بجدول properties للحصول على تفاصيل العقار ومالك العقار، أو ربطه بجدول profiles/users لجلب اسم الضيف وصورته). التأكد أيضًا من استخدام المعرف الصحيح للمستخدم الحالي (user.id) في شروط الاستعلام (eq) بحيث تكون النتائج خاصة بذلك المستخدم.

## ربط البيانات الفعلية (قاعدة البيانات أو API)

استخدام API داخلي: يُستحسن إنشاء واجهة API داخل المشروع لجلب الحجوزات من الخادم. على سبيل المثال، يمكنك إنشاء ملف API Route جديد (app/api/bookings/route.ts) في Next.js. عند طلب البيانات (GET)، يقوم هذا الـ Endpoint باستلام هوية المستخدم (إما من AuthContext/الجلسة أو كمعامل query) ويسترجع من قاعدة البيانات قائمتين: حجوزات المستخدم (myBookings) والطلبات الواردة إليه (incomingRequests). بعد ذلك يعيدها على شكل JSON. ويمكن للواجهة الأمامية (صفحة الحجوزات) استخدام fetch('/api/bookings') لجلب هذه البيانات وتعبئة الحالة بدلًا من استخدام عميل Supabase مباشرة. هذا يعزل منطق الوصول للبيانات في مكان واحد. إذا كنت تستخدم Prisma مع PostgreSQL، ستقوم هذه الـ API باستدعاء prisma.booking.findMany(...) مع المرشحات المناسبة (where: { userId: user.id } للحجوزات التي قام بها المستخدم، و{ ownerId: user.id } للحجوزات الواردة إليه). وبالمثل في حال استخدام Firebase/Firestore، يمكنك استعلام المستندات حيث حقل userId أو ownerId يساوي معرف المستخدم الحالي.

تحديث/تعديل البيانات: من الضروري أيضًا إنشاء واجهات (Endpoints) أو استخدام وظائف من SDK لتحديث حالة الحجز عند القيام بإجراءات مثل الإلغاء أو القبول. على سبيل المثال، يمكن إنشاء مسارات API منفصلة: POST /api/bookings/{id}/cancel لإلغاء حجز، POST /api/bookings/{id}/accept لقبول طلب، POST /api/bookings/{id}/reject لرفض طلب، وهكذا. هذه المسارات ستستقبل معرف الحجز والإجراء المطلوب (أو تستدل عليه من عنوان الـ URL)، ثم تحدّث السجل في قاعدة البيانات (مثلاً تحديث حقل الحالة status). بعد نجاح التحديث، يمكن إعادة الحالة الجديدة أو رسالة نجاح. في الكود أعلاه، تم استخدام عميل Supabase بشكل مباشر (supabase.from('bookings').update(...)) كتطبيق فوري، لكن يمكنك استبداله بمناداة fetch لنفس هذه الـ Endpoints لتحقيق فصل أوضح بين منطق الواجهة ومنطق الخادم.

## شرح تنفيذ الميزات المطلوبة

عرض تفاصيل كل حجز: تعرض الصفحة معلومات كل حجز في بطاقة تتضمن صورة العقار وعنوانه وموقعه وتواريخ الحجز وعدد الليالي المحسوبة تلقائيًا. تم ربط عنوان العقار برابط يؤدي إلى صفحة تفاصيل العقار (/properties/${booking.propertyId})، وكذلك يوجد زر/رابط "مراسلة المالك" الذي يقود إلى صفحة المحادثة الخاصة بهذا الحجز (/messages/${booking.id}) بحيث يستطيع المستأجر التواصل مع صاحب العقار. بهذه الطريقة، يمكن للمستخدم عرض كافة تفاصيل الحجز والتفاعل مع الطرف الآخر مباشرة.

إلغاء الحجز أو حذفه: إذا كان الحجز في حالة قيد الانتظار (pending) ولم يتأكد بعد، يظهر زر "إلغاء" بجانب الحجز في تبويب "حجوزاتي". عند النقر عليه يطلب التطبيق تأكيد المستخدم (باستخدام confirm)، ثم يتم تحديث حالة الحجز إلى "ملغي" محليًا مباشرة لإعطاء انطباع فوري للمستخدم، وفي الخلفية يتم إرسال طلب إلى الخادم أو قاعدة البيانات لتحديث حالة الحجز فعليًا إلى cancelled. بالنسبة لحذف الحجز، قد لا يكون متاحًا لكل الحالات؛ ولكن يمكن اعتباره في الحالات التي يكون فيها الحجز ملغيًا أو مكتملًا (مثلاً لإزالة العرض من القائمة نهائيًا). في حال رغبت في دعم حذف السجل بالكامل، يمكن إضافة زر "حذف" يظهر للحجوزات الملغية أو القديمة، يقوم باستدعاء واجهة API لحذف الحجز من قاعدة البيانات ثم تحديث الحالة بإزالة هذا الحجز من القائمة (setMyBookings). (يجب التعامل بحذر مع خيار الحذف لأنه قد يؤثر على الحفاظ على سجلات الحجوزات السابقة).

قبول/رفض الطلبات الواردة: في تبويب "الطلبات الواردة"، عندما يكون هناك حجز وارد (أي أن المستخدم الحالي هو مالك العقار والآخر قدّم طلب حجز)، يُعرض لكل طلب زر قبول وزر رفض طالما كانت حالة الطلب "قيد الانتظار". عند الضغط على "قبول الحجز"، يتم تحديث الحالة فورًا إلى "مؤكد" وإرسال تحديث للخادم (عن طريق Supabase أو API) لتغيير حالة الحجز في قاعدة البيانات إلى 'confirmed'. أما عند الضغط على "رفض"، يطلب تأكيد المستخدم أولًا، ثم يتم تحديث الحالة إلى "ملغي" محليًا وفي قاعدة البيانات (هذا يمثل رفض الطلب). إذا كان الطلب الوارد مقبولًا أو مرفوضًا مسبقًا (أي لم يعد في حالة pending)، فإن الواجهة بدلاً من الأزرار تعرض شارة حالة تبين إن كان "مؤكد" أو "ملغي" (باستخدام getStatusBadge كما في الكود).

تعديل الطلب (إن أمكن): إذا كان نظام الحجز يسمح بتعديل الطلب قبل تأكيده، يمكن إضافة خيار تعديل الحجز. على سبيل المثال، في حالة الحجوزات التي قمت بها (كمستأجر) وكانت قيد الانتظار، يمكن إظهار زر "تعديل" بجوار "إلغاء". عند النقر على "تعديل"، من الممكن نقل المستخدم إلى صفحة أو نموذج تعديل تفاصيل الحجز (مثل تغيير التواريخ أو عدد الأشخاص...إلخ). بعد قيام المستخدم بتعديل المطلوب، يتم إرسال التغييرات إلى الخادم عبر واجهة API (مثلاً POST /api/bookings/{id}/update مع البيانات الجديدة) أو استخدام وظيفة من مكتبة (مثل supabase.from('bookings').update(...)) لتحديث السجل في قاعدة البيانات. في الكود أعلاه أضفنا تعليقًا يوضح أين يمكن إدراج زر "تعديل" في الواجهة. تنفيذ هذه الميزة يتطلب إنشاء نموذج تعديل وضمان صلاحية المستخدم لتعديل ذلك الحجز (مثلاً مسموح فقط إذا كان الحجز pending ولم يُقبل بعد).

التنبيه عند عدم وجود حجوزات: يعالج الكود حالة القوائم الفارغة باستخدام مكوّن EmptyState. فعندما تكون قائمة "حجوزاتي" فارغة (أي myBookings.length === 0)، يتم عرض رسالة للمستخدم بعنوان "ليس لديك حجوزات حالية" مع رمز تقويم يوضح ذلك. وبالمثل، إذا لم يكن هناك طلبات واردة جديدة في تبويب "طلبات واردة"، تظهر رسالة "لا توجد طلبات حجز جديدة" مع أيقونة صندوق بريد فارغ. هذا التنبيه البسيط يضمن إبلاغ المستخدم بعدم وجود بيانات بدل عرض صفحة فارغة، مما يحسّن تجربة الاستخدام. كما أن التصميم والتنسيق لهذا المكوّن متناسق مع بقية الصفحة (نفس خطوط Tailwind CSS وأيقونات Material Symbols) للحفاظ على الشكل العام للتطبيق.
