export interface FeatureDefinition {
    id: string;
    label: string;
    icon: string;
}

export const PROPERTY_FEATURES: FeatureDefinition[] = [
    { id: 'ac', label: 'تكييف', icon: 'ac_unit' },
    { id: 'wifi', label: 'واي فاي', icon: 'wifi' },
    { id: 'sea_close', label: 'قريب من البحر', icon: 'beach_access' },
    { id: 'parking', label: 'موقف سيارة', icon: 'local_parking' },
    { id: 'kitchen', label: 'مطبخ مجهز', icon: 'kitchen' },
    { id: 'balcony', label: 'شرفة', icon: 'balcony' },
    { id: 'sea_view', label: 'إطلالة بحرية', icon: 'water' },
    { id: 'furnished', label: 'أثاث كامل', icon: 'chair' },
    { id: 'washer', label: 'غسالة', icon: 'local_laundry_service' },
    { id: 'tv', label: 'تلفزيون', icon: 'tv' },
    { id: 'heater', label: 'سخان مياه', icon: 'water_heater' },
    { id: 'elevator', label: 'مصعد', icon: 'elevator' },
];

const featureLookup = new Map<string, FeatureDefinition>();

for (const feature of PROPERTY_FEATURES) {
    featureLookup.set(feature.id, feature);
    featureLookup.set(feature.label, feature);
}

export const resolveFeature = (idOrLabel: string): FeatureDefinition => {
    const rawValue = idOrLabel.trim();
    const found = featureLookup.get(rawValue);

    return found ?? { id: rawValue, label: rawValue, icon: 'check_circle' };
};

export const normalizeFeatureId = (idOrLabel: string): string => resolveFeature(idOrLabel).id;

export const normalizeFeatureIds = (values: Array<string | null | undefined> | null | undefined): string[] => {
    if (!values) {
        return [];
    }

    const normalized: string[] = [];
    const seen = new Set<string>();

    for (const value of values) {
        if (typeof value !== 'string') {
            continue;
        }

        const nextValue = normalizeFeatureId(value);
        if (!nextValue || seen.has(nextValue)) {
            continue;
        }

        seen.add(nextValue);
        normalized.push(nextValue);
    }

    return normalized;
};
