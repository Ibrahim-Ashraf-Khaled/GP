export default function PropertyCardSkeleton() {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex gap-4">
            <div className="w-32 h-32 shrink-0 rounded-xl bg-gray-200 dark:bg-zinc-700 animate-pulse" />
            <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="flex gap-4 text-xs">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/5">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                    <div className="flex gap-2">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
