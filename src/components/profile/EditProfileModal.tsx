'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabaseService } from '@/services/supabaseService';

export default function EditProfileModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { profile } = useAuth();
    const [name, setName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleUpdate = async () => {
        if (!profile?.id) return;

        setLoading(true);
        try {
            await supabaseService.updateUserProfile(profile.id, { full_name: name, phone: phone });
            setSuccess(true);
            setTimeout(() => { onClose(); setSuccess(false); }, 1500);
        } catch (e) {
            alert("حدث خطأ أثناء التحديث");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl">
                <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-zinc-800">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">تعديل البيانات</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {success ? (
                        <div className="py-8 text-center space-y-3 animate-fadeIn">
                            <span className="material-symbols-outlined text-green-500 text-6xl">check_circle</span>
                            <p className="font-bold text-lg text-gray-900 dark:text-white">تم التحديث بنجاح!</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-500 mr-2">الاسم الكامل</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute right-4 top-3.5 text-gray-400 text-[20px]">person</span>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-800 pr-12 pl-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-500 mr-2">رقم الهاتف</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute right-4 top-3.5 text-gray-400 text-[20px]">phone</span>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-800 pr-12 pl-4 py-3.5 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={loading}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold mt-4 shadow-lg shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {loading && <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
