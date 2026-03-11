interface FilterChipProps {
    label: string;
    count?: number;
    active: boolean;
    onClick: () => void;
}

export default function FilterChip({ label, count, active, onClick }: FilterChipProps) {
    return (
        <button
            onClick={onClick}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${active
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                }`}
        >
            {label}
            {count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-200 dark:bg-zinc-700'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}
