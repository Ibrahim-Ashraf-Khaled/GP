'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
                        </div>
                        <h2 className="text-2xl font-bold text-text-main dark:text-white mb-3">
                            عذراً، حدث خطأ غير متوقع
                        </h2>
                        <p className="text-text-muted dark:text-gray-400 mb-6">
                            {this.state.error?.message || 'حاول تحديث الصفحة'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="px-6 py-2.5 bg-primary hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                            >
                                تحديث الصفحة
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="px-6 py-2.5 border border-border-light dark:border-border-dark text-text-main dark:text-white rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            >
                                العودة للخلف
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
