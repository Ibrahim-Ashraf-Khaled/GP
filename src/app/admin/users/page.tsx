'use client';

import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Database } from '@/types/database.types';
import { GlassCard } from '@/components/ui/glass';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await supabaseService.getAllProfiles();
        setUsers(data || []);
        setLoading(false);
    };

    const handleToggleAdmin = async (id: string, currentStatus: boolean) => {
        if (!confirm(currentStatus ? 'هل أنت متأكد من إزالة صلاحيات الإدارة؟' : 'هل أنت متأكد من منح صلاحيات الإدارة؟')) return;

        try {
            await supabaseService.updateUserProfile(id, { is_admin: !currentStatus });
            // تحديث الواجهة محلياً لتجنب إعادة التحميل
            setUsers(users.map(u => u.id === id ? { ...u, is_admin: !currentStatus } : u));
        } catch (error) {
            alert('حدث خطأ أثناء التحديث');
        }
    };

    const handleToggleVerify = async (id: string, currentStatus: boolean) => {
        try {
            await supabaseService.updateUserProfile(id, { is_verified: !currentStatus });
            setUsers(users.map(u => u.id === id ? { ...u, is_verified: !currentStatus } : u));
        } catch (error) {
            alert('حدث خطأ أثناء التحديث');
        }
    };

    // تصفية المستخدمين حسب البحث
    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* رأس الصفحة وشريط البحث */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المستخدمين ({users.length})</h1>
                <input
                    type="text"
                    placeholder="بحث بالاسم أو الهاتف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white placeholder-gray-500 rounded-xl px-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary backdrop-blur-sm"
                />
            </div>

            {/* جدول المستخدمين */}
            <GlassCard variant="elevated" className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="p-4">المستخدم</th>
                                <th className="p-4">الدور</th>
                                <th className="p-4">الهاتف</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">جاري التحميل...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">لا يوجد مستخدمين مطابقين</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={`صورة ${user.full_name || 'المستخدم'}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.full_name?.[0] || '?'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.full_name || 'بدون اسم'}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.national_id ? 'هوية مسجلة' : 'بدون هوية'}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${user.role === 'landlord'
                                                    ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                                                    : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                            {user.phone || '-'}
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                {user.is_admin && <span className="bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded font-medium">Admin</span>}
                                                {user.is_verified && <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded font-medium">موثق</span>}
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleVerify(user.id, user.is_verified || false)}
                                                    className={`text-xs px-3 py-1 rounded border transition-colors ${user.is_verified
                                                            ? 'border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/20'
                                                            : 'border-green-200 dark:border-green-500/50 text-green-600 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-500/20'
                                                        }`}
                                                >
                                                    {user.is_verified ? 'إلغاء التوثيق' : 'توثيق'}
                                                </button>

                                                <button
                                                    onClick={() => handleToggleAdmin(user.id, user.is_admin || false)}
                                                    className={`text-xs px-3 py-1 rounded border transition-colors ${user.is_admin
                                                            ? 'border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-500/20'
                                                            : 'border-amber-200 dark:border-yellow-500/50 text-amber-600 dark:text-yellow-300 hover:bg-amber-50 dark:hover:bg-yellow-500/20'
                                                        }`}
                                                >
                                                    {user.is_admin ? 'إزالة Admin' : 'ترقية لـ Admin'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
