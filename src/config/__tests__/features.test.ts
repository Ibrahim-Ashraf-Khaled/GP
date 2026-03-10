import { describe, expect, it } from 'vitest';

import { normalizeFeatureId, normalizeFeatureIds, resolveFeature } from '../features';

describe('features config', () => {
    it('resolves canonical ids and legacy labels to the same definition', () => {
        expect(resolveFeature('wifi')).toEqual({
            id: 'wifi',
            label: 'واي فاي',
            icon: 'wifi',
        });
        expect(resolveFeature('واي فاي')).toEqual({
            id: 'wifi',
            label: 'واي فاي',
            icon: 'wifi',
        });
    });

    it('falls back safely for unknown values', () => {
        expect(resolveFeature('custom_feature')).toEqual({
            id: 'custom_feature',
            label: 'custom_feature',
            icon: 'check_circle',
        });
    });

    it('normalizes known legacy labels to ids', () => {
        expect(normalizeFeatureId('تكييف')).toBe('ac');
        expect(normalizeFeatureIds(['تكييف', 'ac', 'ميزة مخصصة'])).toEqual(['ac', 'ميزة مخصصة']);
    });
});
