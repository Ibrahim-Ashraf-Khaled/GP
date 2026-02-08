import { MetadataRoute } from 'next';
import { supabaseService } from '@/services/supabaseService';

const BASE_URL = 'https://gamasa-properties.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Fetch only "available" properties
    // Note: We use getProperties filter to ensure we actially have this method
    const properties = await supabaseService.getProperties({ status: 'available' });

    // 2. Generate dynamic property URLs
    const propertyUrls = properties.map((prop) => ({
        url: `${BASE_URL}/properties/${prop.id}`,
        lastModified: new Date(prop.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // 3. Define static routes
    const staticRoutes = [
        '', // Home
        '/search', // Search Page
        '/auth', // Auth Page
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    return [...staticRoutes, ...propertyUrls];
}
