import { Message } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
    showAvatar?: boolean;
    showTime?: boolean;
}

export const MessageBubble = ({ message, isMe, showAvatar = true, showTime = true }: MessageBubbleProps) => {
    return (
        <div className={`flex w-full ${isMe ? 'justify-start' : 'justify-end'} mb-2 group`}>
            {/* Avatar (only for receiver) */}
            {!isMe && showAvatar && (
                <div className="shrink-0 ml-2">
                    <img
                        src={message.sender?.avatar_url || '/placeholder-user.png'}
                        alt={message.sender?.full_name || 'User'}
                        className="w-8 h-8 rounded-full object-cover"
                    />
                </div>
            )}

            <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-start' : 'items-end'}`}>
                <div
                    className={`px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words relative
                    ${isMe
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-zinc-700'
                        }`}
                >
                    <p>{message.text}</p>
                </div>

                {showTime && (
                    <div className={`text-[10px] mt-1 flex items-center gap-1 opacity-70 px-1 ${isMe ? 'text-gray-500 flex-row' : 'text-gray-500 flex-row-reverse'}`}>
                        <span>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ar })}
                        </span>
                        {isMe && (
                            <span className={`material-symbols-outlined text-[14px] ${message.is_read ? 'text-blue-500' : 'text-gray-400'}`}>
                                {message.is_read ? 'done_all' : 'check'}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
