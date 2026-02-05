import React, { ButtonHTMLAttributes } from 'react';

export interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
}

export function GlassButton({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: GlassButtonProps) {
    const baseClasses = 'rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary/90',
        secondary: 'glass text-text-main hover:border-primary/30',
        ghost: 'bg-transparent text-text-muted hover:glass',
        danger: 'bg-error text-white shadow-lg shadow-error/30 hover:brightness-110',
    };

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            <div className="flex items-center justify-center gap-2">
                {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <>
                        {icon && iconPosition === 'left' && icon}
                        {children}
                        {icon && iconPosition === 'right' && icon}
                    </>
                )}
            </div>
        </button>
    );
}
