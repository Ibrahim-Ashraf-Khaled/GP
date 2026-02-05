'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { supabaseService, IS_MOCK_MODE, UserProfile } from '@/services/supabaseService';

// توحيد الواجهة لتشمل الخصائص من كلا الملفين
interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, fullName: string, phone?: string, role?: 'tenant' | 'landlord') => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ error: any }>;
    signInWithFacebook: () => Promise<{ error: any }>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);

    // دالة مساعدة لجلب الملف الشخصي
    const fetchProfile = async (userId: string) => {
        try {
            const data = await supabaseService.getProfile(userId);
            if (mountedRef.current) {
                setProfile(data);
            }
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    };

    // تهيئة المصادقة
    useEffect(() => {
        mountedRef.current = true;

        const initAuth = async () => {
            try {
                if (IS_MOCK_MODE) {
                    setLoading(false);
                    return;
                }

                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (!mountedRef.current) return;

                if (currentSession?.user) {
                    setUser(currentSession.user);
                    setSession(currentSession);
                    await fetchProfile(currentSession.user.id);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                if (!mountedRef.current || IS_MOCK_MODE) return;

                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (newSession?.user) {
                    await fetchProfile(newSession.user.id);
                } else {
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        return () => {
            mountedRef.current = false;
            subscription.unsubscribe();
        };
    }, []);

    // تسجيل الدخول
    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabaseService.signIn(email, password);

            if (error) throw error;

            if (IS_MOCK_MODE && data?.user) {
                const mockUser = data.user as User;
                const mockSession = data.session as Session;

                setUser(mockUser);
                setSession(mockSession);
                await fetchProfile(mockUser.id);
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    // تسجيل مستخدم جديد
    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        phone?: string,
        role: 'tenant' | 'landlord' = 'tenant'
    ) => {
        try {
            const { data, error } = await supabaseService.signUp(email, password, {
                full_name: fullName,
                phone: phone || '',
                role: role
            });

            if (error) throw error;

            if (IS_MOCK_MODE && data?.user) {
                const mockUser = data.user as User;
                const mockSession = data.session as Session;

                setUser(mockUser);
                setSession(mockSession);
                await fetchProfile(mockUser.id);
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    // تسجيل الخروج
    const signOut = async () => {
        await supabaseService.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    // تسجيل الدخول عبر Google
    const signInWithGoogle = async () => {
        if (IS_MOCK_MODE) {
            // محاكاة تسجيل الدخول بجوجل في الوضع الوهمي
            const mockUser = {
                id: 'mock-google-user',
                email: 'google@example.com',
                app_metadata: {},
                user_metadata: { full_name: 'Google User' },
                aud: 'authenticated',
                created_at: new Date().toISOString()
            } as User;

            setUser(mockUser);
            await fetchProfile(mockUser.id);
            return { error: null };
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            return { error };
        } catch (error) {
            return { error };
        }
    };

    // تسجيل الدخول عبر Facebook
    const signInWithFacebook = async () => {
        if (IS_MOCK_MODE) {
            const mockUser = {
                id: 'mock-facebook-user',
                email: 'facebook@example.com',
                app_metadata: {},
                user_metadata: { full_name: 'Facebook User' },
                aud: 'authenticated',
                created_at: new Date().toISOString()
            } as User;

            setUser(mockUser);
            await fetchProfile(mockUser.id);
            return { error: null };
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            return { error };
        } catch (error) {
            return { error };
        }
    };

    // إعادة تعيين كلمة المرور
    const resetPassword = async (email: string) => {
        if (IS_MOCK_MODE) return { error: null };

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            return { error };
        } catch (error) {
            return { error };
        }
    };

    // تحديث الملف الشخصي
    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return { error: new Error('No user logged in') };

        try {
            const data = await supabaseService.updateUserProfile(user.id, updates);

            if (mountedRef.current) {
                setProfile(prev => prev ? { ...prev, ...data } : data);
            }

            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const value = {
        user,
        profile,
        session,
        loading,
        isAuthenticated: !!user,
        isAdmin: profile?.is_admin ?? false,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithFacebook,
        resetPassword,
        updateProfile,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
