'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/services/supabaseService';
import { GlassCard, GlassButton } from '@/components/ui/glass';

interface PaymentRequest {
    id: string;
    user_id: string;
    property_id: string;
    amount: number;
    payment_method: 'vodafone_cash' | 'instapay' | 'fawry';
    receipt_image: string | null;
    status: 'pending' | 'approved' | 'rejected';
    admin_note: string | null;
    created_at: string;
    // Joined data
    property_title?: string;
    user_name?: string;
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<PaymentRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

    useEffect(() => {
        loadPayments();
    }, [filter]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('payment_requests')
                .select(`
                    *,
                    properties:property_id(title),
                    profiles:user_id(full_name)
                `)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            const formatted = (data || []).map((p: Record<string, unknown>) => ({
                ...p,
                property_title: (p.properties as { title?: string })?.title,
                user_name: (p.profiles as { full_name?: string })?.full_name,
            })) as PaymentRequest[];

            setPayments(formatted);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (payment: PaymentRequest, newStatus: 'approved' | 'rejected') => {
        setActionLoading(payment.id);
        try {
            await supabase
                .from('payment_requests')
                .update({
                    status: newStatus,
                    processed_at: new Date().toISOString(),
                })
                .eq('id', payment.id);

            if (newStatus === 'approved') {
                try {
                    // Unlock the property for the user (now secure)
                    await supabaseService.unlockProperty(payment.user_id, payment.property_id);

                    // Send success notification
                    await supabaseService.createNotification({
                        userId: payment.user_id,
                        title: 'تم قبول طلب الدفع!',
                        message: 'يمكنك الآن رؤية بيانات التواصل مع المالك.',
                        type: 'success',
                        link: `/property/${payment.property_id}`,
                    });
                } catch (unlockError) {
                    console.error('Failed to unlock property:', unlockError);
                    
                    // Revert payment status if unlock fails
                    await supabase
                        .from('payment_requests')
                        .update({ status: 'pending' })
                        .eq('id', payment.id);
                    
                    alert('فشل فتح العقار. يرجى المحاولة مرة أخرى.');
                    loadPayments();
                    return;
                }
            } else {
                // Send rejection notification
                await supabaseService.createNotification({
                    userId: payment.user_id,
                    title: 'تم رفض طلب الدفع',
                    message: 'يرجى التحقق من بيانات التحويل والمحاولة مرة أخرى.',
                    type: 'error',
                });
            }

            loadPayments();
        } catch (error) {
            console.error('Error updating payment:', error);
            alert('فشل تحديث حالة الدفع. يرجى المحاولة مرة أخرى.');
        } finally {
            setActionLoading(null);
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'vodafone_cash': return 'فودافون كاش';
            case 'instapay': return 'انستاباي';
            case 'fawry': return 'فوري';
            default: return method;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">معلق</span>;
            case 'approved':
                return <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">مقبول</span>;
            case 'rejected':
                return <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-medium">مرفوض</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">طلبات الدفع</h1>
                <div className="flex gap-2">
                    {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/20'
                                }`}
                        >
                            {f === 'pending' ? 'معلقة' : f === 'approved' ? 'مقبولة' : f === 'rejected' ? 'مرفوضة' : 'الكل'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : payments.length > 0 ? (
                <div className="space-y-4">
                    {payments.map(payment => (
                        <GlassCard key={payment.id} variant="elevated" padding="md">
                            <div className="flex gap-4">
                                {/* Receipt Image */}
                                <div className="w-32 h-32 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                    {payment.receipt_image ? (
                                        <a href={payment.receipt_image} target="_blank" rel="noopener noreferrer">
                                            <img src={payment.receipt_image} alt="إيصال" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                                        </a>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-400 text-3xl">receipt_long</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                {payment.property_title || 'عقار'}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                من: {payment.user_name || 'مستخدم'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-primary font-bold">{payment.amount} ج.م</span>
                                                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                                                    {getPaymentMethodLabel(payment.payment_method)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(payment.created_at).toLocaleDateString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        {getStatusBadge(payment.status)}
                                    </div>

                                    {/* Actions */}
                                    {payment.status === 'pending' && (
                                        <div className="flex gap-2 mt-3">
                                            <GlassButton
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleAction(payment, 'approved')}
                                                loading={actionLoading === payment.id}
                                                disabled={actionLoading === payment.id}
                                            >
                                                <span className="material-symbols-outlined text-sm">check</span>
                                                قبول وفتح العقار
                                            </GlassButton>
                                            <GlassButton
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleAction(payment, 'rejected')}
                                                disabled={actionLoading === payment.id}
                                                className="!text-red-400 hover:!bg-red-500/20"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                                رفض
                                            </GlassButton>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            ) : (
                <GlassCard variant="subtle" padding="lg" className="text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">payments</span>
                    <p className="text-gray-500">لا توجد طلبات دفع {filter === 'pending' ? 'معلقة' : ''}</p>
                </GlassCard>
            )}
        </div>
    );
}
