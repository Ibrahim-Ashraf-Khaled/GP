'use client';

import { useEffect, useState } from 'react';
import { supabaseService, PropertyRow } from '@/services/supabaseService';
import { GlassCard, GlassButton } from '@/components/ui/glass';
import { CATEGORY_AR, PRICE_UNIT_AR, STATUS_AR } from '@/types';

export default function AdminPropertiesPage() {
    const [properties, setProperties] = useState<PropertyRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [filter, setFilter] = useState<'pending' | 'available' | 'rejected' | 'all'>('pending');

    useEffect(() => {
        loadProperties();
    }, [filter]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const data = await supabaseService.getProperties(
                filter === 'all' ? undefined : { status: filter }
            );
            setProperties(data);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, newStatus: 'available' | 'rejected') => {
        setActionLoading(id);
        try {
            await supabaseService.updateProperty(id, { status: newStatus });

            // Send notification to property owner
            const property = properties.find(p => p.id === id);
            if (property) {
                await supabaseService.createNotification({
                    userId: property.owner_id,
                    title: newStatus === 'available' ? 'تمت الموافقة على عقارك!' : 'تم رفض عقارك',
                    message: newStatus === 'available'
                        ? `عقارك "${property.title}" أصبح متاحاً للعرض الآن.`
                        : `عقارك "${property.title}" لم يستوفِ معايير النشر.`,
                    type: newStatus === 'available' ? 'success' : 'error',
                    link: `/property/${property.id}`,
                });
            }

            loadProperties();
        } catch (error) {
            console.error('Error updating property:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const label = STATUS_AR[status as keyof typeof STATUS_AR] ?? status;
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">{label}</span>;
            case 'available':
                return <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">{label}</span>;
            case 'rejected':
                return <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-500 text-xs font-medium">{label}</span>;
            case 'rented':
                return <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-500 text-xs font-medium">{label}</span>;
            default:
                return <span className="px-2 py-1 rounded-full bg-gray-500/20 text-gray-500 text-xs font-medium">{label}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة العقارات</h1>
                <div className="flex gap-2">
                    {(['pending', 'available', 'rejected', 'all'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-primary text-white'
                                    : 'bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/20'
                                }`}
                        >
                            {f === 'pending' ? 'معلقة' : f === 'available' ? 'متاحة' : f === 'rejected' ? 'مرفوضة' : 'الكل'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : properties.length > 0 ? (
                <div className="space-y-4">
                    {properties.map(prop => (
                        <GlassCard key={prop.id} variant="elevated" padding="md">
                            <div className="flex gap-4">
                                {/* Image */}
                                <div className="w-24 h-24 rounded-xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                    {prop.images[0] ? (
                                        <img src={prop.images[0]} alt={`صورة ${prop.title}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="material-symbols-outlined text-gray-400 text-3xl">image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{prop.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {CATEGORY_AR[prop.category as keyof typeof CATEGORY_AR]} • {prop.bedrooms} غرف • {prop.area || 'جمصة'}
                                            </p>
                                            <p className="text-primary font-bold mt-1">
                                                {prop.price} ج.م / {PRICE_UNIT_AR[prop.price_unit as keyof typeof PRICE_UNIT_AR]}
                                            </p>
                                        </div>
                                        {getStatusBadge(prop.status)}
                                    </div>

                                    {/* Actions */}
                                    {prop.status === 'pending' && (
                                        <div className="flex gap-2 mt-3">
                                            <GlassButton
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleAction(prop.id, 'available')}
                                                loading={actionLoading === prop.id}
                                                disabled={actionLoading === prop.id}
                                            >
                                                <span className="material-symbols-outlined text-sm">check</span>
                                                موافقة
                                            </GlassButton>
                                            <GlassButton
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleAction(prop.id, 'rejected')}
                                                disabled={actionLoading === prop.id}
                                                className="!text-red-400 hover:!bg-red-500/20"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                                رفض
                                            </GlassButton>
                                            <a
                                                href={`/property/${prop.id}`}
                                                target="_blank"
                                                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/50 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/20 transition-colors flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-sm">visibility</span>
                                                معاينة
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            ) : (
                <GlassCard variant="subtle" padding="lg" className="text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">inventory_2</span>
                    <p className="text-gray-500">لا توجد عقارات {filter === 'pending' ? 'معلقة' : filter === 'rejected' ? 'مرفوضة' : ''}</p>
                </GlassCard>
            )}
        </div>
    );
}
