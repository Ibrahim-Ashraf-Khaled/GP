interface EmptyStateProps {
    icon: string;
    title: string;
    subtitle: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export default function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
    const ActionButton = action?.href ? 'a' : 'button';

    return (
        <div className="text-center py-16 bg-white dark:bg-white/5 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-blue-400">{icon}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto px-4">
                {subtitle}
            </p>
            {action && (
                <ActionButton
                    href={action.href}
                    onClick={action.onClick}
                    className="inline-flex items-center gap-2 text-primary font-bold hover:underline px-4 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                >
                    {action.label}
                </ActionButton>
            )}
        </div>
    );
}
