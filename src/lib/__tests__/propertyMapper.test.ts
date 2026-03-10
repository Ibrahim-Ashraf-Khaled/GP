import { describe, expect, it } from 'vitest';

import type { Property } from '@/types';
import { fromPropertyRow, toPropertyInsert, type PropertyRowCompat } from '../propertyMapper';

describe('propertyMapper', () => {
    it('serializes property inserts with split location fields only', () => {
        const input = {
            title: 'Sea View Apartment',
            description: 'Near the beach',
            price: 900,
            priceUnit: 'day',
            category: 'apartment',
            status: 'available',
            images: ['https://example.com/1.jpg'],
            location: {
                lat: 31.4431,
                lng: 31.5344,
                address: 'Corniche Street',
                area: 'Sea District',
            },
            ownerPhone: '01000000000',
            ownerId: 'owner-1',
            ownerName: 'Owner',
            features: ['wifi', 'واي فاي', 'ميزة مخصصة'],
            bedrooms: 2,
            bathrooms: 1,
            area: 120,
            floor: 3,
            isVerified: true,
            viewsCount: 9,
            rental_config: { ignored: true },
            available_dates: [{ start: '2026-03-10', end: '2026-03-11' }],
        } as Partial<Property> & {
            rental_config: { ignored: boolean };
            available_dates: Array<{ start: string; end: string }>;
        };

        const payload = toPropertyInsert(input);

        expect(payload).toMatchObject({
            title: 'Sea View Apartment',
            description: 'Near the beach',
            price: 900,
            price_unit: 'day',
            category: 'apartment',
            status: 'available',
            location_lat: 31.4431,
            location_lng: 31.5344,
            address: 'Corniche Street',
            area: 'Sea District',
            floor_area: 120,
            features: ['wifi', 'ميزة مخصصة'],
        });
        expect(payload).not.toHaveProperty('location');
        expect(payload).not.toHaveProperty('rental_config');
        expect(payload).not.toHaveProperty('available_dates');
    });

    it('hydrates properties from split columns', () => {
        const row: PropertyRowCompat = {
            id: 'property-1',
            owner_id: 'owner-1',
            title: 'Split Columns',
            description: 'Canonical row',
            price: 1500,
            price_unit: 'day',
            category: 'apartment',
            status: 'available',
            location_lat: 31.44,
            location_lng: 31.53,
            address: 'Downtown',
            area: 'Center',
            bedrooms: 3,
            bathrooms: 2,
            floor_area: 140,
            floor_number: 5,
            features: ['واي فاي', 'wifi', 'ميزة مخصصة'],
            images: ['https://example.com/2.jpg'],
            owner_phone: '01000000000',
            owner_name: 'Owner',
            is_verified: true,
            views_count: 11,
            created_at: '2026-03-10T00:00:00Z',
            updated_at: '2026-03-10T00:00:00Z',
        };

        const property = fromPropertyRow(row);

        expect(property.location).toEqual({
            lat: 31.44,
            lng: 31.53,
            address: 'Downtown',
            area: 'Center',
        });
        expect(property.area).toBe(140);
        expect(property.features).toEqual(['wifi', 'ميزة مخصصة']);
    });

    it('falls back to legacy location JSON when split columns are missing', () => {
        const row: PropertyRowCompat = {
            id: 'property-2',
            owner_id: 'owner-2',
            title: 'Legacy JSON',
            description: null,
            price: '2200',
            price_unit: 'month',
            category: 'studio',
            status: 'pending',
            location_lat: null,
            location_lng: null,
            address: null,
            area: null,
            bedrooms: 1,
            bathrooms: 1,
            floor_area: 65,
            floor_number: 2,
            features: null,
            images: null,
            owner_phone: null,
            owner_name: null,
            is_verified: false,
            views_count: null,
            created_at: '2026-03-10T00:00:00Z',
            updated_at: '2026-03-10T00:00:00Z',
            location: {
                lat: '31.445',
                lng: '31.535',
                address: 'Legacy Address',
                area: 'Legacy Area',
            },
        };

        const property = fromPropertyRow(row);

        expect(property.location).toEqual({
            lat: 31.445,
            lng: 31.535,
            address: 'Legacy Address',
            area: 'Legacy Area',
        });
        expect(property.area).toBe(65);
        expect(property.price).toBe(2200);
    });
});
