'use client';

/**
 * @deprecated Use useAuth() from '@/hooks/useAuth' instead.
 * This hook is kept for backward compatibility.
 */

import { useAuth } from '@/hooks/useAuth';

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
