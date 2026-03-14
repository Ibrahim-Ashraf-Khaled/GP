export default function PropertyCardSkeleton() {
    return (
        <div className="bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm border border-gray-100 dark:border-white/5 flex gap-4">
            <div className="w-32 h-32 shrink-0 rounded-[1.1rem] bg-gray-100 dark:bg-white/5 animate-pulse" />
            <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="h-6 w-1/2 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
                        <div className="h-6 w-16 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-1/3 bg-gray-50 dark:bg-white/5 rounded animate-pulse" />
                    <div className="flex gap-4">
                        <div className="h-4 w-16 bg-gray-50 dark:bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-20 bg-gray-50 dark:bg-white/5 rounded animate-pulse" />
                    </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-white/5 mt-3">
                    <div className="h-6 w-32 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />
                    <div className="flex gap-2">
                        <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
                        <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
