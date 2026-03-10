import { normalizeFeatureIds } from '@/config/features';
import type { Property } from '@/types';
import type { Database } from '@/types/database.types';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];

export interface LegacyLocationValue {
    lat?: number | string | null;
    lng?: number | string | null;
    address?: string | null;
    area?: string | null;
}

export interface PropertyRowCompat {
    id: string;
    owner_id: string;
    title: string;
    description?: string | null;
    price: number | string | null;
    price_unit?: Database['public']['Tables']['properties']['Row']['price_unit'] | null;
    category?: Database['public']['Tables']['properties']['Row']['category'] | null;
    status?: Database['public']['Tables']['properties']['Row']['status'] | null;
    location_lat?: number | null;
    location_lng?: number | null;
    address?: string | null;
    area?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    floor_area?: number | null;
    floor_number?: number | null;
    features?: string[] | null;
    images?: string[] | null;
    owner_phone?: string | null;
    owner_name?: string | null;
    is_verified: boolean;
    views_count?: number | null;
    created_at: string;
    updated_at: string;
    location?: LegacyLocationValue | null;
}

function parseNumber(value: number | string | null | undefined, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
}

function parseCoordinate(value: number | string | null | undefined): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) {
            return null;
        }

        const parsed = Number(trimmed);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return null;
}

function parseText(value: string | null | undefined, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
}

type PropertyInsertInput = Partial<Property> & {
    rental_config?: unknown;
    available_dates?: unknown;
};

export function toPropertyInsert(property: PropertyInsertInput): PropertyInsert {
    const location = property.location;

    return {
        title: property.title ?? '',
        description: property.description ?? '',
        price: property.price ?? 0,
        price_unit: property.priceUnit ?? 'day',
        category: property.category ?? 'apartment',
        status: property.status ?? 'pending',
        images: property.images ?? [],
        location_lat: location?.lat ?? null,
        location_lng: location?.lng ?? null,
        address: location?.address ?? null,
        area: location?.area ?? null,
        owner_phone: property.ownerPhone ?? '',
        owner_id: property.ownerId ?? '',
        owner_name: property.ownerName ?? '',
        features: normalizeFeatureIds(property.features),
        bedrooms: property.bedrooms ?? 0,
        bathrooms: property.bathrooms ?? 0,
        floor_area: property.area ?? null,
        floor_number: property.floor ?? 0,
        is_verified: property.isVerified ?? false,
        views_count: property.viewsCount ?? 0,
    };
}

export function fromPropertyRow(row: PropertyRowCompat): Property {
    const legacyLocation = row.location ?? null;
    const fallbackLat = parseCoordinate(legacyLocation?.lat);
    const fallbackLng = parseCoordinate(legacyLocation?.lng);

    return {
        id: row.id,
        title: row.title,
        description: row.description ?? '',
        price: parseNumber(row.price, 0),
        priceUnit: row.price_unit ?? 'day',
        category: row.category ?? 'apartment',
        status: row.status ?? 'pending',
        images: row.images ?? [],
        location: {
            lat: row.location_lat ?? fallbackLat,
            lng: row.location_lng ?? fallbackLng,
            address: parseText(row.address, parseText(legacyLocation?.address)),
            area: parseText(row.area, parseText(legacyLocation?.area)),
        },
        ownerPhone: row.owner_phone ?? '',
        ownerId: row.owner_id,
        ownerName: row.owner_name ?? '',
        features: normalizeFeatureIds(row.features),
        bedrooms: row.bedrooms ?? 0,
        bathrooms: row.bathrooms ?? 0,
        area: row.floor_area ?? 0,
        floor: row.floor_number ?? 0,
        isVerified: row.is_verified,
        viewsCount: row.views_count ?? 0,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
