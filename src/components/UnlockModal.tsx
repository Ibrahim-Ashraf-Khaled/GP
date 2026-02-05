'use client';

import { useState } from 'react';
import { uploadImage, unlockProperty, addNotification } from '@/lib/storage';
import { useUser } from '@/hooks/useUser';

interface UnlockModalProps {
    propertyId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function UnlockModal({ propertyId, onClose, onSuccess }: UnlockModalProps) {
    const { user } = useUser();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(1); // 1: instructions, 2: upload, 3: success

    const handleUpload = async () => {
        if (!file || !user) return;
        setUploading(true);
        try {
            // 1. رفع صورة الإيصال لـ Supabase
            const receiptUrl = await uploadImage(file);

            // 2. فك القفل (في النظام الحقيقي ننتظر مراجعة الأدمن، هنا سنفعلها فوراً للنموذج)
            unlockProperty(propertyId);

            // 3. إضافة إشعار
            // Notification handled in storage.ts or here. 
            // The user snippet had it here. I'll keep it here just in case, or rely on storage.
            // Since I updated storage to do it, I might get double notifications if I leave it here.
            // But the user requested specific logic which INCLUDED it here.
            // I will COMMENT OUT the duplicate one here to follow "best practice" unless the user insisted specifically on THIS block logic line-by-line.
            // User said: "3. إضافة إشعار" inside the handleUpload
            // I'll keep it here and remove from storage to respect the snippet, OR keep simpler storage.
            // Actually, safer to have it in one place. I'll stick to storage having it as I already implemented it there.
            // Wait, I am pasting the user's code. I should respect their code structure.
            // Their code calls `addNotification` here. 

            /* 
            addNotification({
                userId: user.id,
                title: 'تم إرسال الطلب',
                message: 'جاري مراجعة إيصال الدفع لفك قفل العقار.',
                type: 'info'
            });
            */
            // The user code snippet explicitly adds an 'info' notification about review.
            // My storage code adds a 'success' notification about unlocking.
            // They are different. One is "Request Sent", one is "Unlocked".
            // Since we unlock IMMEDIATELY for mock purposes, the 'success' one makes more sense.
            // However, let's add the info one as requested by the user snippet.

            addNotification({
                userId: user.id,
                title: 'تم إرسال الطلب',
                message: 'جاري مراجعة إيصال الدفع لفك قفل العقار.',
                type: 'info'
            });

            setStep(3); // نجاح
            setTimeout(() => {
                onClose();
                if (onSuccess) {
                    onSuccess();
                } else {
                    window.location.reload();
                }
            }, 2000);
        } catch (error) {
            console.error(error);
            alert('فشل رفع الإيصال، حاول مجدداً');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                <div className="p-6">
                    {step === 1 && (
                        <div className="text-center animate-fadeIn">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-text-main">فك قفل رقم المالك</h3>
                            <p className="text-text-muted text-sm mb-6">للحصول على رقم الهاتف المباشر، يرجى تحويل <span className="font-bold text-primary">50 ج.م</span> عبر فودافون كاش</p>

                            <div className="bg-background-light dark:bg-background-dark p-4 rounded-2xl mb-6 border border-dashed border-primary/30">
                                <p className="text-xs text-text-muted mb-1">رقم المحفظة</p>
                                <p className="text-2xl font-mono font-bold tracking-widest text-primary">01012345678</p>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/30"
                            >
                                تم التحويل، ارفع الإيصال
                            </button>
                            <button onClick={onClose} className="mt-3 text-sm text-text-muted hover:text-text-main block w-full">إلغاء</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fadeIn">
                            <h3 className="text-lg font-bold mb-4 text-center text-text-main">تأكيد التحويل</h3>
                            <label className="border-2 border-dashed border-border-light dark:border-border-dark rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-background-light dark:hover:bg-background-dark transition-colors">
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    accept="image/*"
                                />
                                <span className="material-symbols-outlined text-4xl text-text-muted mb-2">cloud_upload</span>
                                <p className="text-sm text-text-muted">{file ? file.name : 'ارفع صورة إيصال التحويل'}</p>
                            </label>

                            <div className="flex gap-3 mt-6">
                                <button
                                    disabled={!file || uploading}
                                    onClick={handleUpload}
                                    className="flex-1 bg-primary disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
                                >
                                    {uploading ? 'جاري الرفع...' : 'تأكيد الإرسال'}
                                </button>
                                <button onClick={() => setStep(1)} className="px-6 py-4 font-bold text-text-muted">رجوع</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-10 animate-fadeIn">
                            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 text-success">
                                <span className="material-symbols-outlined text-5xl animate-bounce">check_circle</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-main">شكراً لك!</h3>
                            <p className="text-text-muted">تم استلام طلبك، سيظهر الرقم فوراً.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
