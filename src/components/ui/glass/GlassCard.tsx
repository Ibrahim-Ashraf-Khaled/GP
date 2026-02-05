import React from 'react';

export interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'elevated' | 'subtle';
    hover?: boolean;
    onClick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function GlassCard({
    children,
    className = '',
    variant = 'default',
    hover = false,
    onClick,
    padding = 'md',
}: GlassCardProps) {
    const baseClasses = 'rounded-2xl transition-all';

    const variantClasses = {
        default: 'glass',
        elevated: 'glass-elevated',
        subtle: 'glass-subtle',
    };

    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const hoverClasses = hover ? 'glass-hover cursor-pointer' : '';

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
