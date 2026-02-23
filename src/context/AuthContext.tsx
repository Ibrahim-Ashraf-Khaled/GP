'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';

type AuthMode = 'production' | 'mock';

const AUTH_MODE: AuthMode = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true' ? 'mock' : 'production';

interface Profile {
    id: string;
    user_id: string;
    full_name: string | null;
    phone: string | null;
    role: UserRole;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    loading: boolean; // Alias for backward compatibility
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    login: (email: string, password: string) => Promise<{ error: any }>; // Alias
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
    register: (email: string, password: string, fullName: string) => Promise<{ error: any }>; // Alias
    signOut: () => Promise<void>;
    logout: () => Promise<void>; // Alias
    resetPassword: (contact: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signInWithFacebook: () => Promise<{ error: Error | null }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            return data as Profile;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }, []);

    const syncUserWithProfile = useCallback(async (supabaseUser: { id: string; email?: string; created_at?: string }) => {
        if (!supabaseUser) {
            setUser(null);
            setProfile(null);
            return;
        }

        const userProfile = await fetchProfile(supabaseUser.id);

        if (userProfile) {
            const mappedUser: User = {
                id: userProfile.user_id,
                name: userProfile.full_name || '',
                phone: userProfile.phone || '',
                email: supabaseUser.email,
                avatar: userProfile.avatar_url || undefined,
                role: userProfile.role,
                isVerified: false,
                favorites: [],
                unlockedProperties: [],
                createdAt: userProfile.created_at,
                memberSince: userProfile.created_at,
            };
            setUser(mappedUser);
            setProfile(userProfile);
        } else {
            setUser({
                id: supabaseUser.id,
                name: supabaseUser.email?.split('@')[0] || '',
                phone: '',
                email: supabaseUser.email,
                role: 'tenant',
                isVerified: false,
                favorites: [],
                unlockedProperties: [],
                createdAt: supabaseUser.created_at || new Date().toISOString(),
                memberSince: supabaseUser.created_at || new Date().toISOString(),
            });
            setProfile(null);
        }
    }, [fetchProfile]);

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (isMounted && session?.user) {
                    await syncUserWithProfile(session.user);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!isMounted) return;

                if (event === 'SIGNED_OUT') {
                    setUser(null);
                    setProfile(null);
                    setIsLoading(false);
                } else if (session?.user) {
                    await syncUserWithProfile(session.user);
                }
            }
        );

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [syncUserWithProfile]);

    // simple persistence helper used by the basic auth flow
    const saveUser = (u: User) => {
        try {
            localStorage.setItem('gamasa_current_user', JSON.stringify(u));
        } catch (e) {
            // ignore
        }
    };

    const signIn = async (email: string, password: string) => {
        // production flow only; mock mode handled earlier if needed
        if (AUTH_MODE === 'mock') {
            return mockSignIn(email, password);
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
            // أقل mapping سريع (لحد ما نربط profiles بالكامل)
            const mappedUser = {
                id: data.user.id,
                name:
                    data.user.user_metadata?.full_name ||
                    data.user.email?.split('@')[0] ||
                    'User',
                phone: '',
                email: data.user.email || '',
                role: 'tenant' as UserRole,
                isVerified: !!data.user.email_confirmed_at,
                favorites: [],
                unlockedProperties: [],
                createdAt: new Date().toISOString(),
                memberSince: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
            } as User;
            saveUser(mappedUser);
            setUser(mappedUser);
        }
        return { error };
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        if (AUTH_MODE === 'mock') {
            return mockSignUp(email, password, fullName, '', 'tenant' as UserRole);
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });

        // (اختياري) إنشاء profile row بعد التسجيل لو عندك RLS policy تسمح
        if (!error && data.user) {
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: fullName,
                email,
            });
        }

        return { error };
    };

    const signOut = async (): Promise<void> => {
        if (AUTH_MODE === 'mock') {
            setUser(null);
            setProfile(null);
            return;
        }

        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const resetPassword = async (contact: string): Promise<{ error: Error | null }> => {
        if (AUTH_MODE === 'mock') {
            return { error: null };
        }

        try {
            const isEmail = contact.includes('@');
            
            if (isEmail) {
                const { error } = await supabase.auth.resetPasswordForEmail(contact, {
                    redirectTo: `${window.location.origin}/auth?mode=reset`,
                });
                return { error: error as Error | null };
            }

            return { error: new Error('Password reset via phone not supported') };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
        if (AUTH_MODE === 'mock') {
            return mockSocialLogin('google');
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            return { error: error as Error | null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const signInWithFacebook = async (): Promise<{ error: Error | null }> => {
        if (AUTH_MODE === 'mock') {
            return mockSocialLogin('facebook');
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            return { error: error as Error | null };
        } catch (error) {
            return { error: error as Error };
        }
    };

    const refreshProfile = async () => {
        if (user?.id) {
            await syncUserWithProfile({ id: user.id, email: user.email });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile: user,
                loading: isLoading,
                login: signIn,
                register: signUp,
                logout: signOut,
                signOut: signOut,
                isAuthenticated: !!user,
                signIn,
                signUp,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

async function mockSignIn(email: string, password: string): Promise<{ error: Error | null }> {
    const users = JSON.parse(localStorage.getItem('gamasa_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        localStorage.setItem('gamasa_current_user', JSON.stringify(userWithoutPassword));
        return { error: null };
    }
    return { error: new Error('بيانات الدخول غير صحيحة') };
}

async function mockSignUp(
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: UserRole
): Promise<{ error: Error | null }> {
    const users = JSON.parse(localStorage.getItem('gamasa_users') || '[]');

    if (users.some((u: any) => u.email === email)) {
        return { error: new Error('البريد الإلكتروني مستخدم بالفعل') };
    }

    const newUser = {
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        name: fullName,
        email,
        phone,
        role,
        password,
        favorites: [],
        unlockedProperties: [],
        isVerified: false,
        createdAt: new Date().toISOString(),
        memberSince: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('gamasa_users', JSON.stringify(users));
    localStorage.setItem('gamasa_current_user', JSON.stringify({ ...newUser, password: undefined }));

    return { error: null };
}

async function mockSocialLogin(provider: 'google' | 'facebook'): Promise<{ error: Error | null }> {
    const mockUser = {
        id: 'mock_' + provider + '_' + Date.now(),
        name: 'Mock User',
        email: `mock.${provider}@example.com`,
        phone: '',
        role: 'tenant' as UserRole,
        favorites: [],
        unlockedProperties: [],
        isVerified: false,
        createdAt: new Date().toISOString(),
        memberSince: new Date().toISOString(),
    };

    localStorage.setItem('gamasa_current_user', JSON.stringify(mockUser));
    return { error: null };
}
