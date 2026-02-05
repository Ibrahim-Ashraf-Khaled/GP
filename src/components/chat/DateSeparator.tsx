import { format, isToday, isYesterday } from 'date-fns';
import { ar } from 'date-fns/locale';

interface DateSeparatorProps {
    date: Date;
}

export const DateSeparator = ({ date }: DateSeparatorProps) => {
    let text = '';

    if (isToday(date)) {
        text = 'اليوم';
    } else if (isYesterday(date)) {
        text = 'أمس';
    } else {
        text = format(date, 'PPPP', { locale: ar });
    }

    return (
        <div className="flex justify-center my-4">
            <span className="bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full shadow-sm">
                {text}
            </span>
        </div>
    );
};
