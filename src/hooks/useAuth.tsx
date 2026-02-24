'use client';

import React, { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserRole } from '@/types';

type AuthMode = 'production' | 'mock';

const AUTH_MODE: AuthMode = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true' ? 'mock' : 'production';

interface Profile {
    id: string;
    full_name: string | null;
    name?: string | null;
    phone: string | null;
    role: UserRole;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
    isVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    loading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    login: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, fullName: string, phone?: string, role?: 'tenant' | 'landlord') => Promise<{ error: any }>;
    register: (email: string, password: string, fullName: string, phone?: string, role?: 'tenant' | 'landlord') => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (contact: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signInWithFacebook: () => Promise<{ error: Error | null }>;
    signInWithApple: () => Promise<{ error: Error | null }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactNode {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const mapAuthUserToAppUser = (u: any): User => {
        return {
            id: u.id,
            name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User",
            phone: "",
            email: u.email || "",
            avatar: u.user_metadata?.avatar_url || undefined,
            role: "tenant",
            isVerified: !!u.email_confirmed_at,
            favorites: [],
            unlockedProperties: [],
            createdAt: new Date().toISOString(),
            memberSince: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
        } as User;
    };

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, phone, role, avatar_url, created_at, updated_at')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.warn('fetchProfile failed (non-fatal):', error);
                return null;
            }

            return data as Profile | null;
        } catch (error) {
            console.warn('fetchProfile exception (non-fatal):', error);
            return null;
        }
    }, []);

    const syncUserWithProfile = useCallback(async (authUser: any) => {
        if (!authUser) {
            setUser(null);
            setProfile(null);
            return;
        }

        const baseUser = mapAuthUserToAppUser(authUser);
        setUser(baseUser);

        const profileData = await fetchProfile(authUser.id);
        if (!profileData) {
            return;
        }

        setUser((prev) => ({
            ...prev!,
            id: profileData.id,
            name: profileData.full_name || prev!.name,
            phone: profileData.phone || "",
            avatar: profileData.avatar_url || prev!.avatar,
            role: profileData.role || prev!.role,
        }));
        setProfile(profileData);
    }, [fetchProfile]);

    useEffect(() => {
        let alive = true;

        const boot = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (!alive) return;

                if (error) console.warn('getSession error:', error);

                const user = session?.user;
                if (!user) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                await syncUserWithProfile(user);
            } catch (err) {
                console.warn('boot exception:', err);
            } finally {
                if (alive) setIsLoading(false);
            }
        };

        boot();

        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!alive) return;

            if (!session?.user) {
                setUser(null);
                return;
            }

            await syncUserWithProfile(session.user);
        });

        return () => {
            alive = false;
            sub.subscription.unsubscribe();
        };
    }, [syncUserWithProfile]);

    const saveUser = (u: User) => {
        try {
            localStorage.setItem('gamasa_current_user', JSON.stringify(u));
        } catch (e) {
            // ignore
        }
    };

    const signIn = async (email: string, password: string) => {
        if (AUTH_MODE === 'mock') {
            return mockSignIn(email, password);
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
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

    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        phone?: string,
        role: 'tenant' | 'landlord' = 'tenant'
    ) => {
        if (AUTH_MODE === 'mock') {
            return mockSignUp(email, password, fullName, phone || '', role as UserRole);
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, phone, role } },
        });

        console.log('signUp:', { user: data.user?.id, session: !!data.session, error });

        if (!error && data.user && !data.session) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
                console.error('signIn after signUp failed:', signInError);
                return { error: signInError };
            }
        }

        if (!error && data.user) {
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: fullName,
                phone: phone || null,
                role: role,
            });
            if (profileError) console.error('profiles upsert error:', profileError);
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

    const signInWithApple = async (): Promise<{ error: Error | null }> => {
        if (AUTH_MODE === 'mock') {
            return mockSocialLogin('apple');
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
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
                profile,
                isLoading,
                loading: isLoading,
                isAuthenticated: !!user,
                signIn,
                login: signIn,
                signUp,
                register: signUp,
                signOut,
                logout: signOut,
                resetPassword,
                signInWithGoogle,
                signInWithFacebook,
                signInWithApple,
                refreshProfile,
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

async function mockSocialLogin(provider: 'google' | 'facebook' | 'apple'): Promise<{ error: Error | null }> {
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
