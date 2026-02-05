'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: 'مؤجر' | 'مستأجر' | 'admin';
    is_verified: boolean;
    is_admin: boolean;
}

// Backward-compatible user type that matches the old interface
export interface AppUser {
    id: string;
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
    role: 'مؤجر' | 'مستأجر' | 'admin';
    nationalId?: string;
    isVerified: boolean;
    favorites: string[];
    unlockedProperties: string[];
    createdAt: string;
    lastLogin?: string;
    memberSince: string;
    // New Supabase-specific fields
    authUser?: User;
    profile?: UserProfile;
}

export function useUser() {
    const [user, setUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);
    const mountedRef = useRef(true);

    // Define profile row type for type safety
    interface ProfileRow {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        phone: string | null;
        national_id: string | null;
        role: 'مؤجر' | 'مستأجر' | 'admin';
        is_verified: boolean;
        is_admin: boolean;
        created_at: string;
        updated_at: string;
    }

    // جلب الملف الشخصي من قاعدة البيانات
    const fetchProfile = useCallback(async (authUser: User): Promise<AppUser | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            const profile = data as ProfileRow | null;

            if (error || !profile) {
                console.error('Error fetching profile:', error);
                // Return a basic user even if profile fetch fails
                return {
                    id: authUser.id,
                    name: authUser.user_metadata?.full_name || 'مستخدم',
                    phone: '',
                    email: authUser.email,
                    role: 'مستأجر',
                    isVerified: false,
                    favorites: [],
                    unlockedProperties: [],
                    createdAt: authUser.created_at,
                    memberSince: authUser.created_at,
                    authUser,
                };
            }

            // Map Supabase profile to AppUser
            return {
                id: authUser.id,
                name: profile.full_name || 'مستخدم',
                phone: profile.phone || '',
                email: authUser.email,
                avatar: profile.avatar_url || undefined,
                role: profile.role || 'مستأجر',
                nationalId: profile.national_id || undefined,
                isVerified: profile.is_verified || false,
                favorites: [], // Will be fetched separately
                unlockedProperties: [], // Will be fetched separately
                createdAt: profile.created_at,
                lastLogin: new Date().toISOString(),
                memberSince: profile.created_at,
                authUser,
                profile: profile as UserProfile,
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }, []);

    // تحميل المستخدم الحالي
    const loadUser = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!mountedRef.current) return;

            if (session?.user) {
                const appUser = await fetchProfile(session.user);
                if (mountedRef.current) {
                    setUser(appUser);
                }
            } else {
                if (mountedRef.current) {
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Error loading user:', error);
            if (mountedRef.current) {
                setUser(null);
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [fetchProfile]);

    useEffect(() => {
        mountedRef.current = true;

        // تحميل المستخدم عند البداية
        loadUser();

        // الاستماع لتغييرات حالة المصادقة
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mountedRef.current) return;

                if (event === 'SIGNED_IN' && session?.user) {
                    const appUser = await fetchProfile(session.user);
                    if (mountedRef.current) {
                        setUser(appUser);
                        setLoading(false);
                    }
                } else if (event === 'SIGNED_OUT') {
                    if (mountedRef.current) {
                        setUser(null);
                        setLoading(false);
                    }
                }
            }
        );

        return () => {
            mountedRef.current = false;
            subscription.unsubscribe();
        };
    }, [loadUser, fetchProfile]);

    // إعادة تحميل بيانات المستخدم
    const refreshUser = useCallback(async () => {
        await loadUser();
    }, [loadUser]);

    return { user, loading, refreshUser };
}

