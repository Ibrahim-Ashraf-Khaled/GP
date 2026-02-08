'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types'; // Ensure this matches storage.ts usage
import { getCurrentUser, setCurrentUser as saveUser, STORAGE_KEYS } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

// Mock Mode Flag
const IS_MOCK_MODE = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial Load & Event Listeners
    useEffect(() => {
        const loadUser = () => {
            try {
                // Try from storage (Mock Mode fallback or primary)
                const currentUser = getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                } else {
                    // If no local user, check Supabase (if not mock)
                    if (!IS_MOCK_MODE) {
                        // Supabase session check would go here, 
                        // but for now we focus on the requested structure
                        setUser(null);
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Error loading user:', error);
                // Clear potentially corrupted data
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('gamasa_current_user');
                }
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        loadUser();

        // Listen for updates from other components/tabs
        const handleUserUpdate = () => {
            const currentUser = getCurrentUser();
            setUser(currentUser);
        };

        // 'userUpdated' is dispatch by storage.ts in the same tab
        window.addEventListener('userUpdated', handleUserUpdate);

        // 'storage' event fires when localStorage changes in OTHER tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'gamasa_current_user' || e.key === null) {
                handleUserUpdate();
            }
        });

        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
            window.removeEventListener('storage', handleUserUpdate);
        };
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);

            if (IS_MOCK_MODE) {
                // Mock Mode: Check localStorage 'gamasa_users'
                const users = JSON.parse(localStorage.getItem('gamasa_users') || '[]');
                const foundUser = users.find((u: any) => u.email === email && u.password === password);

                if (foundUser) {
                    const { password: _, ...userWithoutPassword } = foundUser;
                    saveUser(userWithoutPassword);
                    setUser(userWithoutPassword);
                    return true;
                }
                return false;
            } else {
                // Supabase Logic
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error || !data.user) return false;

                // For simple hybrid approach, we might still want to map to local user
                // But for now, returning false as Supabase flow is separate in previous context
                return true;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any): Promise<boolean> => {
        try {
            setLoading(true);

            if (IS_MOCK_MODE) {
                const users = JSON.parse(localStorage.getItem('gamasa_users') || '[]');

                if (users.some((u: any) => u.email === userData.email)) {
                    alert('البريد الإلكتروني مستخدم بالفعل');
                    return false;
                }

                const newUser = {
                    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    role: 'مستأجر' as const, // Default role
                    password: userData.password,
                    favorites: [],
                    unlockedProperties: [],
                    isVerified: false,
                    createdAt: new Date().toISOString(),
                    memberSince: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                };

                users.push(newUser);
                localStorage.setItem('gamasa_users', JSON.stringify(users));

                const { password: _, ...userWithoutPassword } = newUser;
                saveUser(userWithoutPassword);
                setUser(userWithoutPassword);
                return true;
            } else {
                // Supabase Register
                return false;
            }
        } catch (error) {
            console.error('Register error:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        saveUser(null);
        setUser(null);
        if (!IS_MOCK_MODE) {
            supabase.auth.signOut();
        }
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
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
