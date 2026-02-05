export const TypingIndicator = () => {
    return (
        <div className="flex justify-end w-full mb-2">
            <div className="bg-gray-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-none inline-flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
        </div>
    );
};
