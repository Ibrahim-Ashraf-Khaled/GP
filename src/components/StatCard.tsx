interface StatCardProps {
    label: string;
    value: number;
    icon: string;
    color: 'blue' | 'green' | 'purple';
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-500',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-500',
    }[color];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses}`}>
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
}
