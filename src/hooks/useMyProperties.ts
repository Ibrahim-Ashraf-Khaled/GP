import { useState, useEffect, useCallback } from 'react';
import { Property, PropertyStatus } from '@/types';
import {
    getProperties,
    getUserPropertiesFromSupabase,
    deletePropertyFromSupabase,
    updatePropertyInSupabase,
} from '@/lib/storage';

interface ToastCallbacks {
    onSuccess?: (message: string) => void;
    onError?: (message: string) => void;
}

interface UseMyPropertiesReturn {
    properties: Property[];
    loading: boolean;
    error: string | null;
    deletingId: string | null;
    deleteProperty: (id: string) => Promise<void>;
    updateStatus: (id: string, newStatus: PropertyStatus) => Promise<void>;
    refresh: () => Promise<void>;
}

export function useMyProperties(
    userId: string | undefined,
    callbacks?: ToastCallbacks
): UseMyPropertiesReturn {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const isMockMode = process.env.NEXT_PUBLIC_IS_MOCK_MODE === 'true';

    const loadProperties = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isMockMode) {
                const all = getProperties();
                setProperties(all.filter((p) => p.ownerId === userId));
            } else {
                const userProperties = await getUserPropertiesFromSupabase(userId);
                setProperties(userProperties);
            }
        } catch (err) {
            console.error('Error loading properties:', err);

            if (isMockMode) {
                const all = getProperties();
                setProperties(all.filter((p) => p.ownerId === userId));
            } else {
                setError('Failed to load properties. Please try again.');
                setProperties([]);
            }
        } finally {
            setLoading(false);
        }
    }, [userId, isMockMode]);

    const deleteProperty = useCallback(async (id: string) => {
        setDeletingId(id);

        try {
            if (isMockMode) {
                const all = getProperties();
                localStorage.setItem('gamasa_properties', JSON.stringify(all.filter((p) => p.id !== id)));
                setProperties((prev) => prev.filter((p) => p.id !== id));
                callbacks?.onSuccess?.('Property deleted successfully');
            } else {
                const result = await deletePropertyFromSupabase(id);

                if (result.success) {
                    setProperties((prev) => prev.filter((p) => p.id !== id));
                    callbacks?.onSuccess?.('Property deleted successfully');
                } else {
                    callbacks?.onError?.(result.error || 'Failed to delete property, please try again');
                }
            }
        } catch (err) {
            console.error('Error deleting property:', err);
            callbacks?.onError?.('Failed to delete property. Please try again.');
        } finally {
            setDeletingId(null);
        }
    }, [isMockMode, callbacks]);

    const updateStatus = useCallback(async (id: string, newStatus: PropertyStatus) => {
        try {
            if (isMockMode) {
                const all = getProperties();
                const property = all.find((p) => p.id === id);
                if (property) {
                    property.status = newStatus;
                    localStorage.setItem('gamasa_properties', JSON.stringify(all));
                    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
                    callbacks?.onSuccess?.('Property status updated successfully');
                }
            } else {
                const updated = await updatePropertyInSupabase(id, { status: newStatus });
                if (updated) {
                    setProperties((prev) => prev.map((p) => p.id === id ? updated : p));
                    callbacks?.onSuccess?.('Property status updated successfully');
                } else {
                    callbacks?.onError?.('Failed to update property status');
                }
            }
        } catch (err) {
            console.error('Error updating status:', err);
            callbacks?.onError?.('Failed to update property status');
        }
    }, [isMockMode, callbacks]);

    const refresh = useCallback(async () => {
        await loadProperties();
    }, [loadProperties]);

    useEffect(() => {
        if (userId) {
            loadProperties();
        } else {
            setLoading(false);
        }
    }, [userId, loadProperties]);

    return { properties, loading, error, deletingId, deleteProperty, updateStatus, refresh };
}
