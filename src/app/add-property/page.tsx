'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AREAS, FEATURES, PropertyCategory, PriceUnit, CATEGORY_AR, PRICE_UNIT_AR } from '@/types';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/hooks/useAuth';

export default function AddPropertyPage() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        priceUnit: 'day' as PriceUnit,
        category: 'apartment' as PropertyCategory,
        bedrooms: 1,
        bathrooms: 1,
        area: '',
        floor: 0,
        features: [] as string[],
        address: '',
        selectedArea: '',
        ownerName: '',
        ownerPhone: '',
    });

    // Auto-fill owner information from current user
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                ownerName: user.name || '',
                ownerPhone: user.phone || '',
            }));
        }
    }, [user]);

    const [images, setImages] = useState<string[]>([]);

    const categories: PropertyCategory[] = ['apartment', 'room', 'studio', 'villa', 'chalet'];
    const priceUnits: PriceUnit[] = ['day', 'week', 'month', 'season'];

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !user) return;

        setUploading(true);
        try {
            const fileArray = Array.from(files);
            const urls = await supabaseService.uploadPropertyImages(fileArray, user.id);
            setImages(prev => [...prev, ...urls]);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('حدث خطأ أثناء رفع الصور. يرجى المحاولة مرة أخرى.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const toggleFeature = (feature: string) => {
        if (formData.features.includes(feature)) {
            setFormData({
                ...formData,
                features: formData.features.filter(f => f !== feature),
            });
        } else {
            setFormData({
                ...formData,
                features: [...formData.features, feature],
            });
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setValidationErrors([]);

        try {
            if (!user) {
                alert('يجب تسجيل الدخول أولاً');
                return;
            }

            // التحقق من وجود صور
            if (images.length === 0) {
                alert('يرجى إضافة صورة واحدة على الأقل');
                setLoading(false);
                return;
            }

            // تجهيز العقار (الصور مرفوعة بالفعل)
            const propertyToAdd = {
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                price_unit: formData.priceUnit,
                category: formData.category,
                address: formData.address,
                area: formData.selectedArea,
                owner_phone: formData.ownerPhone,
                owner_name: formData.ownerName,
                features: formData.features,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                floor_area: Number(formData.area),
                floor_number: formData.floor,
            };

            // حفظ العقار
            const newProperty = await supabaseService.createFullProperty(propertyToAdd, [], user.id);

            // إضافة إشعار
            await supabaseService.createNotification({
                userId: user.id,
                title: 'تم إضافة عقارك بنجاح!',
                message: `عقارك "${formData.title}" قيد المراجعة من الإدارة.`,
                type: 'success'
            });

            setSuccess(true);

            // Redirect بعد 2 ثانية
            setTimeout(() => {
                window.location.href = '/my-properties';
            }, 2000);

        } catch (error) {
            console.error('Error adding property:', error);
            alert('حدث خطأ أثناء إضافة العقار. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const getStepErrors = () => {
        const errors: string[] = [];
        switch (step) {
            case 1:
                if (!formData.title) errors.push('title');
                if (!formData.price) errors.push('price');
                break;
            case 2:
                if (!formData.description) errors.push('description');
                break;
            case 3:
                if (!formData.selectedArea) errors.push('selectedArea');
                if (!formData.address) errors.push('address');
                break;
            case 4:
                if (!formData.ownerName) errors.push('ownerName');
                if (!formData.ownerPhone) errors.push('ownerPhone');
                break;
        }
        return errors;
    };

    const handleNextStep = () => {
        const errors = getStepErrors();
        if (errors.length === 0) {
            setStep(step + 1);
            setValidationErrors([]);
        } else {
            setValidationErrors(errors);
        }
    };

    // Helper Input Component for consistency
    const InputField = ({ label, error, ...props }: any) => (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <input
                className={`w-full p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border-2 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400
                ${error
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-black'
                    }`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-green-500 animate-pulse">check_circle</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">تم إضافة العقار بنجاح!</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">سيتم مراجعة العقار من الإدارة قبل نشره للعامة.</p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/"
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                        >
                            العودة للرئيسية
                        </Link>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setStep(1);
                                setFormData({
                                    title: '',
                                    description: '',
                                    price: '',
                                    priceUnit: 'day',
                                    category: 'apartment',
                                    bedrooms: 1,
                                    bathrooms: 1,
                                    area: '',
                                    floor: 0,
                                    features: [],
                                    address: '',
                                    selectedArea: '',
                                    ownerName: user?.name || '',
                                    ownerPhone: user?.phone || '',
                                });
                                setImages([]);
                            }}
                            className="w-full py-4 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                        >
                            إضافة عقار آخر
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-gray-50 dark:bg-black pb-32">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined rtl:rotate-180">arrow_back</span>
                        </Link>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white">إضافة عقار جديد</h1>
                        <div className="w-6" />
                    </div>

                    {/* Stepper */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(s => (
                            <div
                                key={s}
                                className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${s <= step
                                    ? 'bg-primary'
                                    : 'bg-gray-200 dark:bg-zinc-800'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </header>

            <section className="max-w-2xl mx-auto px-4 mt-8">
                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">المعلومات الأساسية</h2>
                                <p className="text-gray-500 dark:text-gray-400">ابدأ بإدخال التفاصيل الرئيسية لعقارك</p>
                            </div>

                            <InputField
                                label="عنوان العقار *"
                                placeholder="مثال: شقة فاخرة بإطلالة بحرية"
                                value={formData.title}
                                onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
                                error={validationErrors.includes('title') ? 'هذا الحقل مطلوب' : undefined}
                            />

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">نوع العقار *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, category: cat })}
                                            className={`p-3 rounded-xl text-sm font-bold transition-all border-2 ${formData.category === cat
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-zinc-700'
                                                }`}
                                        >
                                            {CATEGORY_AR[cat]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="السعر *"
                                    type="number"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
                                    error={validationErrors.includes('price') ? 'مطلوب' : undefined}
                                />
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">لكل</label>
                                    <div className="relative">
                                        <select
                                            value={formData.priceUnit}
                                            onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as typeof formData.priceUnit })}
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border-2 border-transparent focus:border-primary/50 outline-none text-gray-900 dark:text-white appearance-none"
                                        >
                                            {priceUnits.map(unit => (
                                                <option key={unit} value={unit}>{PRICE_UNIT_AR[unit]}</option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                    صور العقار <span className="text-gray-400 font-normal text-xs">(حتى 6 صور)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 size-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 6 && (
                                        <label className="aspect-square rounded-2xl bg-gray-50 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group">
                                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-3xl mb-1">add_a_photo</span>
                                            <span className="text-xs text-gray-400 group-hover:text-primary font-bold">إضافة</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تفاصيل العقار</h2>
                                <p className="text-gray-500 dark:text-gray-400">صف عقارك بدقة لجذب المستأجرين</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">وصف العقار *</label>
                                <textarea
                                    placeholder="اكتب وصفاً تفصيلياً للعقار..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border-2 transition-all outline-none text-gray-900 dark:text-white min-h-[150px] resize-none
                                    ${validationErrors.includes('description') ? 'border-red-500/50' : 'border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-black'}`}
                                />
                            </div>

                        </div>
                    )}

                    {/* Step 3: Location */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الموقع</h2>
                                <p className="text-gray-500 dark:text-gray-400">أين يقع عقارك؟</p>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">المنطقة *</label>
                                <div className="relative">
                                    <select
                                        value={formData.selectedArea}
                                        onChange={(e) => setFormData({ ...formData, selectedArea: e.target.value })}
                                        className={`w-full p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border-2 outline-none text-gray-900 dark:text-white appearance-none transition-all
                                        ${validationErrors.includes('selectedArea') ? 'border-red-500/50' : 'border-transparent focus:border-primary/50'}`}
                                    >
                                        <option value="">اختر المنطقة</option>
                                        {AREAS.map(area => (
                                            <option key={area} value={area}>{area}</option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">location_on</span>
                                </div>
                            </div>

                            <InputField
                                label="العنوان التفصيلي *"
                                placeholder="مثال: شارع البحر، بجوار مسجد..."
                                value={formData.address}
                                onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                                error={validationErrors.includes('address') ? 'مطلوب' : undefined}
                            />

                            <div className="h-48 rounded-2xl bg-gray-100 dark:bg-zinc-800 border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center text-gray-400">
                                <span className="material-symbols-outlined text-4xl mb-2">map</span>
                                <p className="text-sm">سيتم إضافة الخريطة التفاعلية قريباً</p>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">بيانات التواصل</h2>
                                <p className="text-gray-500 dark:text-gray-400">كيف يمكن للمستأجرين الوصول إليك؟</p>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-4 rounded-xl flex gap-3 text-amber-800 dark:text-amber-200 text-sm">
                                <span className="material-symbols-outlined shrink-0 mt-0.5">lock</span>
                                <p>رقم هاتفك سيبقى مخفياً عن المستأجرين حتى يقوموا بدفع رسوم الخدمة لضمان الجدية.</p>
                            </div>

                            <InputField
                                label="اسمك الكامل *"
                                placeholder="الاسم كما سيظهر للمستأجرين"
                                value={formData.ownerName}
                                onChange={(e: any) => setFormData({ ...formData, ownerName: e.target.value })}
                                error={validationErrors.includes('ownerName') ? 'مطلوب' : undefined}
                            />

                            <InputField
                                label="رقم الهاتف *"
                                type="tel"
                                placeholder="01xxxxxxxxx"
                                value={formData.ownerPhone}
                                onChange={(e: any) => setFormData({ ...formData, ownerPhone: e.target.value })}
                                dir="ltr"
                                className="text-right"
                                error={validationErrors.includes('ownerPhone') ? 'مطلوب' : undefined}
                            />

                            <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-5 space-y-4 border border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">ملخص العقار</h3>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <span className="text-gray-500">النوع:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{CATEGORY_AR[formData.category]}</span>

                                    <span className="text-gray-500">السعر:</span>
                                    <span className="text-primary font-bold">{formData.price} ج.م / {PRICE_UNIT_AR[formData.priceUnit]}</span>

                                    <span className="text-gray-500">المنطقة:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{formData.selectedArea}</span>

                                    <span className="text-gray-500">الصور:</span>
                                    <span className="text-gray-900 dark:text-white font-medium">{images.length} صور</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer Buttons */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-40">
                <div className="max-w-2xl mx-auto flex gap-4">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all"
                        >
                            السابق
                        </button>
                    )}

                    {step < 4 ? (
                        <button
                            onClick={handleNextStep}
                            className="flex-[2] py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                        >
                            التالي
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || uploading}
                            className="flex-[2] py-4 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    جاري النشر...
                                </>
                            ) : (
                                'نشر العقار'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </main>
    </ProtectedRoute>
    );
}
