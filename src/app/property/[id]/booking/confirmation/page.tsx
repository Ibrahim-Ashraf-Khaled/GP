'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseService } from '@/services/supabaseService';
import { ROUTES } from '@/lib/routes';
import { Booking } from '@/types';
import Image from 'next/image';

export default function ConfirmationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const bookingId = searchParams.get('bookingId');

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [receiptUploaded, setReceiptUploaded] = useState(false);

    // جلب بيانات الحجز
    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) {
                setError('رقم الحجز غير موجود');
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabaseService.getBookingById(bookingId);
                if (error || !data) {
                    setError('لم يتم العثور على الحجز');
                } else {
                    setBooking(data);
                }
            } catch (err) {
                setError('حدث خطأ أثناء تحميل بيانات الحجز');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // معالجة رفع الإيصال
    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !bookingId) return;

        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
            alert('يرجى اختيار صورة فقط');
            return;
        }

        // التحقق من حجم الملف (أقل من 5 ميجا)
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 5 ميجابايت');
            return;
        }

        setUploading(true);
        try {
            const { url, error } = await supabaseService.uploadPaymentReceipt(bookingId, file);
            if (error) {
                alert('فشل رفع الإيصال');
            } else {
                setReceiptUploaded(true);
                alert('تم رفع الإيصال بنجاح! سيتم مراجعته من قبل الإدارة.');
            }
        } catch (err) {
            alert('حدث خطأ أثناء رفع الإيصال');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('تم النسخ!');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>جاري تحميل بيانات الحجز...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="error-container">
                <p className="error-message">{error || 'حدث خطأ ما'}</p>
                <button onClick={() => router.push('/')} className="btn-home">
                    العودة للرئيسية
                </button>
            </div>
        );
    }

    const isElectronicPayment = booking.paymentMethod === 'vodafone_cash' || booking.paymentMethod === 'instapay';
    const isCashOnDelivery = booking.paymentMethod === 'cash_on_delivery';

    return (
        <div className="confirmation-page">
            <div className="container">
                {/* أيقونة النجاح */}
                <div className="success-icon-container">
                    <div className="success-icon">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                            <circle cx="40" cy="40" r="36" stroke="#22c55e" strokeWidth="4" />
                            <path d="M25 40 L35 50 L55 30" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* العنوان */}
                <h1 className="page-title">
                    {isCashOnDelivery ? 'تم تأكيد حجزك بنجاح! ✅' : 'تم إرسال طلب الحجز بنجاح! 🎉'}
                </h1>

                {/* بطاقة المعلومات */}
                {isElectronicPayment && (
                    <div className="info-card warning">
                        <div className="info-icon">⏳</div>
                        <div className="info-content">
                            <h3>في انتظار تأكيد الدفع</h3>
                            <p>يرجى التحويل إلى الرقم التالي:</p>
                            <div className="phone-number" onClick={() => copyToClipboard('01012345678')}>
                                <span>01012345678</span>
                                <button className="copy-btn">نسخ</button>
                            </div>
                            <div className="amount-highlight">
                                {booking.totalAmount.toLocaleString('ar-EG')} ج.م
                            </div>
                        </div>
                    </div>
                )}

                {isCashOnDelivery && (
                    <div className="info-card success">
                        <div className="info-icon">✓</div>
                        <div className="info-content">
                            <h3>سيتم الدفع عند استلام العقار</h3>
                            <p>يرجى إحضار المبلغ نقداً عند الاستلام</p>
                            <div className="amount-highlight">
                                {booking.totalAmount.toLocaleString('ar-EG')} ج.م
                            </div>
                        </div>
                    </div>
                )}

                {/* رفع الإيصال */}
                {isElectronicPayment && !receiptUploaded && !booking.paymentProof && (
                    <div className="upload-section">
                        <h3>ارفع صورة الإيصال</h3>
                        <label className="upload-btn">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleReceiptUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                            <span>{uploading ? 'جاري الرفع...' : '📷 اختر صورة الإيصال'}</span>
                        </label>
                    </div>
                )}

                {receiptUploaded && (
                    <div className="success-message">
                        ✅ تم رفع الإيصال بنجاح! سيتم مراجعته قريباً.
                    </div>
                )}

                {/* تفاصيل الحجز */}
                <div className="booking-details">
                    <h2 className="section-title">تفاصيل الحجز</h2>

                    <div className="details-grid">
                        <div className="detail-row">
                            <span className="label">رقم الحجز</span>
                            <span className="value">#{booking.id.substring(0, 8).toUpperCase()}</span>
                        </div>

                        <div className="detail-row">
                            <span className="label">العقار</span>
                            <span className="value">{booking.property?.title || 'غير محدد'}</span>
                        </div>

                        <div className="detail-row">
                            <span className="label">الفترة</span>
                            <span className="value">
                                {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            </span>
                        </div>

                        <div className="detail-row">
                            <span className="label">المدة</span>
                            <span className="value">
                                {booking.totalNights ? `${booking.totalNights} ليلة` :
                                    booking.totalMonths ? `${booking.totalMonths} ${booking.totalMonths === 1 ? 'شهر' : 'أشهر'}` :
                                        'غير محدد'}
                            </span>
                        </div>

                        <div className="detail-row">
                            <span className="label">المبلغ الإجمالي</span>
                            <span className="value highlight">
                                {booking.totalAmount.toLocaleString('ar-EG')} ج.م
                            </span>
                        </div>
                    </div>
                </div>

                {/* بيانات المالك (للدفع عند الاستلام) */}
                {isCashOnDelivery && booking.property && (
                    <div className="owner-contact">
                        <h2 className="section-title">بيانات المالك</h2>
                        <div className="contact-options">
                            <a href={`tel:${booking.property.ownerPhone}`} className="contact-btn phone">
                                📞 الاتصال: {booking.property.ownerPhone}
                            </a>
                            <a
                                href={`https://wa.me/2${booking.property.ownerPhone?.replace(/^0+/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-btn whatsapp"
                            >
                                💬 واتساب
                            </a>
                        </div>
                    </div>
                )}

                {/* ملاحظات مهمة */}
                <div className="important-notes">
                    <h2 className="section-title">ملاحظات مهمة</h2>
                    <div className="notes-list">
                        {isCashOnDelivery && (
                            <>
                                <div className="note">
                                    <span className="note-icon">ℹ️</span>
                                    <span>يرجى التواصل مع المالك لتنسيق موعد الاستلام</span>
                                </div>
                                <div className="note">
                                    <span className="note-icon">🕐</span>
                                    <span>موعد تسليم العقار: {formatDate(booking.startDate)} الساعة 2:00 ظهراً</span>
                                </div>
                            </>
                        )}
                        {isElectronicPayment && (
                            <>
                                <div className="note">
                                    <span className="note-icon">📱</span>
                                    <span>تأكد من التحويل إلى الرقم الصحيح</span>
                                </div>
                                <div className="note">
                                    <span className="note-icon">📷</span>
                                    <span>احتفظ بإيصال التحويل لحين التأكيد</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="action-buttons">
                    <button onClick={() => router.push(ROUTES.BOOKINGS)} className="btn-primary">
                        عرض حجوزاتي
                    </button>
                    <button onClick={() => router.push(ROUTES.HOME)} className="btn-secondary">
                        العودة للرئيسية
                    </button>
                </div>
            </div>

            <style jsx>{`
                .confirmation-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 2rem 0;
                }

                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 0 1rem;
                }

                .loading-container, .error-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: white;
                }

                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .success-icon-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 1.5rem;
                }

                .success-icon {
                    animation: scaleIn 0.5s ease;
                }

                @keyframes scaleIn {
                    from { transform: scale(0); }
                    to { transform: scale(1); }
                }

                .page-title {
                    text-align: center;
                    font-size: 2rem;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 2rem;
                }

                .info-card {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 1.5rem;
                    display: flex;
                    gap: 1.5rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .info-card.warning {
                    border: 2px solid #fbbf24;
                    background: #fef3c7;
                }

                .info-card.success {
                    border: 2px solid #22c55e;
                    background: #dcfce7;
                }

                .info-icon {
                    font-size: 3rem;
                }

                .info-content {
                    flex: 1;
                }

                .info-content h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .phone-number {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: white;
                    padding: 1rem;
                    border-radius: 8px;
                    margin: 1rem 0;
                    font-size: 1.5rem;
                    font-weight: bold;
                    cursor: pointer;
                }

                .copy-btn {
                    background: #3b82f6;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    font-size: 0.875rem;
                }

                .amount-highlight {
                    font-size: 2rem;
                    font-weight: bold;
                    color: #dc2626;
                    text-align: center;
                    margin-top: 1rem;
                }

                .upload-section {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }

                .upload-section h3 {
                    margin-bottom: 1rem;
                    font-size: 1.125rem;
                    font-weight: 600;
                }

                .upload-btn {
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: transform 0.2s;
                }

                .upload-btn:hover {
                    transform: scale(1.05);
                }

                .success-message {
                    background: #dcfce7;
                    color: #166534;
                    padding: 1rem;
                    border-radius: 12px;
                    text-align: center;
                    margin-bottom: 1.5rem;
                    font-weight: 600;
                }

                .booking-details, .owner-contact, .important-notes {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 1.5rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                .details-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                }

                .detail-row:last-child {
                    border-bottom: none;
                }

                .label {
                    color: #6b7280;
                    font-weight: 500;
                }

                .value {
                    font-weight: 600;
                    text-align: left;
                }

                .value.highlight {
                    color: #3b82f6;
                    font-size: 1.25rem;
                }

                .contact-options {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .contact-btn {
                    flex: 1;
                    min-width: 200px;
                    padding: 1rem;
                    border-radius: 12px;
                    text-align: center;
                    text-decoration: none;
                    font-weight: 600;
                    transition: transform 0.2s;
                }

                .contact-btn:hover {
                    transform: translateY(-2px);
                }

                .contact-btn.phone {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .contact-btn.whatsapp {
                    background: #dcfce7;
                    color: #166534;
                }

                .notes-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .note {
                    display: flex;
                    align-items: start;
                    gap: 0.75rem;
                    padding: 1rem;
                    background: #f3f4f6;
                    border-radius: 8px;
                }

                .note-icon {
                    font-size: 1.25rem;
                }

                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                }

                .btn-primary, .btn-secondary, .btn-home {
                    flex: 1;
                    padding: 1rem;
                    border-radius: 12px;
                    border: none;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                }

                .btn-secondary {
                    background: white;
                    color: #3b82f6;
                    border: 2px solid #3b82f6;
                }

                .btn-home {
                    background: white;
                    color: #667eea;
                }

                .btn-primary:hover, .btn-secondary:hover, .btn-home:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }

                @media (max-width: 640px) {
                    .action-buttons {
                        flex-direction: column;
                    }

                    .contact-options {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}
