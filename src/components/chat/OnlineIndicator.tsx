interface OnlineIndicatorProps {
    isOnline: boolean;
    className?: string;
}

export const OnlineIndicator = ({ isOnline, className = '' }: OnlineIndicatorProps) => {
    return (
        <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-black ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                } ${className}`}
        />
    );
};
