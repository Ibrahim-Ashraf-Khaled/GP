import AdminGuard from '@/components/auth/AdminGuard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'لوحة الإدارة | عقارات جمصة',
    description: 'لوحة تحكم إدارة منصة عقارات جمصة',
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
                {/* Admin Header */}
                <header className="sticky top-0 z-50 glass border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">admin_panel_settings</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 dark:text-white">لوحة الإدارة</h1>
                                <p className="text-xs text-gray-500">عقارات جمصة</p>
                            </div>
                        </div>
                        <a href="/" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            العودة للموقع
                        </a>
                    </div>
                </header>

                {/* Admin Navigation */}
                <nav className="border-b border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex gap-1 overflow-x-auto py-2">
                            <a href="/admin" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors whitespace-nowrap">
                                نظرة عامة
                            </a>
                            <a href="/admin/properties" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors whitespace-nowrap">
                                العقارات المعلقة
                            </a>
                            <a href="/admin/payments" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors whitespace-nowrap">
                                طلبات الدفع
                            </a>
                            <a href="/admin/users" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors whitespace-nowrap">
                                المستخدمين
                            </a>
                        </div>
                    </div>
                </nav>

                {/* Content */}
                <main className="max-w-7xl mx-auto px-4 py-6">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
