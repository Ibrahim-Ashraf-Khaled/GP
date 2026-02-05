import { Message } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ImageMessageProps {
    message: Message;
    isMe: boolean;
}

export const ImageMessage = ({ message, isMe }: ImageMessageProps) => {
    return (
        <div className={`flex w-full ${isMe ? 'justify-start' : 'justify-end'} mb-2`}>
            <div className="max-w-[70%]">
                <div
                    className={`rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800 cursor-pointer transition-transform hover:scale-[1.01]
                    ${isMe ? 'rounded-br-none' : 'rounded-bl-none'}`}
                    onClick={() => window.open(message.media_url, '_blank')}
                >
                    <img
                        src={message.media_url}
                        alt="مرفق"
                        className="w-full h-auto object-cover max-h-[300px] bg-gray-100 dark:bg-zinc-800"
                        loading="lazy"
                    />
                </div>
                <div className={`text-[10px] mt-1 flex items-center gap-1 opacity-70 px-1 ${isMe ? 'text-gray-500 justify-start' : 'text-gray-500 justify-end'}`}>
                    <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ar })}</span>
                    {isMe && (
                        <span className={`material-symbols-outlined text-[14px] ${message.is_read ? 'text-blue-500' : 'text-gray-400'}`}>
                            {message.is_read ? 'done_all' : 'check'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
