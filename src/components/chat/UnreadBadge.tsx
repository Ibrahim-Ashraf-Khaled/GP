interface UnreadBadgeProps {
    count: number;
}

export const UnreadBadge = ({ count }: UnreadBadgeProps) => {
    if (count === 0) return null;

    return (
        <span className="bg-primary text-white text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center animate-in zoom-in duration-200">
            {count > 99 ? '+99' : count}
        </span>
    );
};
