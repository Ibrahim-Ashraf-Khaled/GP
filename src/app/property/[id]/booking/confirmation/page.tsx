'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabaseService } from '@/services/supabaseService';
import { Booking } from '@/types';
import { useToast } from '@/components/ui/Toast';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

const PAYMENT_NUMBER = '01012345678';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatMoney = (value: number) => new Intl.NumberFormat('ar-EG').format(value || 0);

export default function ConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showToast } = useToast();

    const bookingId = searchParams.get('bookingId');

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [uploadMessage, setUploadMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    const receiptRefCode = useMemo(() => {
        if (!booking?.id) return '-';
        return booking.id.slice(0, 8).toUpperCase();
    }, [booking?.id]);

    const isElectronicPayment = booking?.paymentMethod === 'vodafone_cash' || booking?.paymentMethod === 'instapay';
    const showUploadSection = Boolean(isElectronicPayment && booking && !booking.paymentProof);

    useEffect(() => {
        let mounted = true;

        const fetchBooking = async () => {
            if (!bookingId) {
                setError('رقم الحجز غير موجود.');
                setLoading(false);
                return;
            }

            try {
                const { data, error: fetchError } = await supabaseService.getBookingById(bookingId);
                if (!mounted) return;

                if (fetchError || !data) {
                    setError('لم يتم العثور على هذا الحجز.');
                } else {
                    setBooking(data);
                }
            } catch {
                if (mounted) {
                    setError('حدث خطأ أثناء تحميل بيانات الحجز.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchBooking();

        return () => {
            mounted = false;
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, [bookingId]);

    const handleCopyReference = async () => {
        if (!booking) return;

        try {
            await navigator.clipboard.writeText(receiptRefCode);
            setUploadMessage('تم نسخ رقم المرجع.');
            showToast('تم نسخ رقم المرجع', 'success');
        } catch {
            setUploadMessage('تعذر النسخ. انسخ الرقم يدويا.');
            showToast('تعذر نسخ الرقم', 'error');
        }
    };

    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !booking?.id) return;

        if (!file.type.startsWith('image/')) {
            setUploadState('error');
            setUploadMessage('يرجى اختيار صورة فقط.');
            showToast('يرجى اختيار صورة فقط', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setUploadState('error');
            setUploadMessage('حجم الصورة يجب أن يكون أقل من 5 ميجابايت.');
            showToast('الصورة أكبر من الحد المسموح', 'error');
            return;
        }

        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        previewUrlRef.current = nextPreviewUrl;
        setPreviewUrl(nextPreviewUrl);

        setUploadState('uploading');
        setUploadMessage('جاري رفع الإيصال...');

        try {
            const { url, error: uploadError } = await supabaseService.uploadPaymentReceipt(booking.id, file);
            if (uploadError || !url) {
                throw new Error(uploadError?.message || 'فشل رفع الإيصال.');
            }

            setBooking((prev) => (prev ? { ...prev, paymentProof: url } : prev));
            setUploadState('done');
            setUploadMessage('تم رفع الإيصال بنجاح. سيتم مراجعته قريبا.');
            showToast('تم رفع الإيصال بنجاح', 'success');
        } catch {
            setUploadState('error');
            setUploadMessage('فشل رفع الإيصال. حاول مرة أخرى.');
            showToast('فشل رفع الإيصال', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="mt-3 text-sm text-gray-600 dark:text-zinc-300">جاري تحميل بيانات الحجز...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light px-4 py-8 dark:bg-background-dark">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/20">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error || 'حدث خطأ غير متوقع.'}</p>
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light py-6 dark:bg-background-dark">
            <div className="mx-auto w-full max-w-3xl space-y-4 px-4">
                <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <span className="material-symbols-outlined text-3xl">check_circle</span>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 dark:text-zinc-100">تم إرسال طلب الحجز بنجاح</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-zinc-300">شكرًا يا {booking.tenantName || 'عميلنا'}.</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                        <span className="text-xs text-gray-500 dark:text-zinc-400">رقم المرجع:</span>
                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-zinc-100">#{receiptRefCode}</span>
                        <button
                            type="button"
                            onClick={handleCopyReference}
                            className="mr-auto rounded-lg border border-gray-300 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-white dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            نسخ
                        </button>
                    </div>
                    {uploadMessage ? <p className="mt-2 text-xs text-gray-600 dark:text-zinc-400">{uploadMessage}</p> : null}
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-zinc-100">تفاصيل الدفع</h2>

                    {isElectronicPayment ? (
                        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">في انتظار تأكيد الدفع</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">حوّل المبلغ على الرقم التالي ثم ارفع الإيصال:</p>
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
                                <span>{PAYMENT_NUMBER}</span>
                                <span>{formatMoney(booking.totalAmount)} ج.م</span>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300">
                            سيتم الدفع عند الاستلام.
                        </div>
                    )}
                </section>

                {showUploadSection ? (
                    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-zinc-100">رفع صورة الإيصال</h2>

                        {previewUrl ? (
                            <div className="mb-3 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
                                <div className="relative h-48 w-full bg-gray-100 dark:bg-zinc-800">
                                    <Image src={previewUrl} alt="معاينة الإيصال" fill className="object-contain" unoptimized />
                                </div>
                            </div>
                        ) : null}

                        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleReceiptUpload}
                                disabled={uploadState === 'uploading'}
                                className="hidden"
                            />
                            {uploadState === 'uploading' ? 'جاري الرفع...' : 'اختيار صورة الإيصال'}
                        </label>

                        {uploadState === 'uploading' ? (
                            <p className="mt-2 text-xs text-blue-600 dark:text-blue-300">جاري رفع الإيصال...</p>
                        ) : null}
                        {uploadState === 'done' ? (
                            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">تم رفع الإيصال بنجاح.</p>
                        ) : null}
                        {uploadState === 'error' ? (
                            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{uploadMessage}</p>
                        ) : null}
                    </section>
                ) : null}

                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="mb-3 text-base font-bold text-gray-900 dark:text-zinc-100">تفاصيل الحجز</h2>
                    <dl className="space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-zinc-800">
                            <dt className="text-gray-500 dark:text-zinc-400">العقار</dt>
                            <dd className="font-semibold text-gray-900 dark:text-zinc-100">{booking.property?.title || 'غير محدد'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-zinc-800">
                            <dt className="text-gray-500 dark:text-zinc-400">الفترة</dt>
                            <dd className="font-semibold text-gray-900 dark:text-zinc-100">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 dark:border-zinc-800">
                            <dt className="text-gray-500 dark:text-zinc-400">طريقة الدفع</dt>
                            <dd className="font-semibold text-gray-900 dark:text-zinc-100">{booking.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : booking.paymentMethod === 'instapay' ? 'إنستاباي' : 'فودافون كاش'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-500 dark:text-zinc-400">الإجمالي</dt>
                            <dd className="text-base font-black text-blue-700 dark:text-blue-300">{formatMoney(booking.totalAmount)} ج.م</dd>
                        </div>
                    </dl>
                </section>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => router.push('/bookings')}
                        className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                        عرض حجوزاتي
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        </div>
    );
}
