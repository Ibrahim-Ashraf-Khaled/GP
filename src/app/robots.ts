import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const BASE_URL = 'https://gamasa-properties.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',   // Protect admin routes
                '/profile/', // Protect user profiles
                '/api/',     // Hide API routes
            ],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
