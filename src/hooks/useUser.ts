'use client';

/**
 * @deprecated استخدم useAuth() من '@/context/AuthContext' مباشرة.
 * هذا الهوك مجرد Wrapper للتوافق الخلفي، ولا يحتوي أي منطق جلسة (SSOT).
 */

import { useAuth } from '@/context/AuthContext';

export function useUser() {
  const { user, profile, isAuthenticated, isLoading, loading, refreshProfile } = useAuth();

  return {
    user,
    profile,
    isAuthenticated,
    loading: isLoading || loading,
    refreshUser: refreshProfile,
  };
}
