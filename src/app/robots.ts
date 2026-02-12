import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gamasa-properties.vercel.app';

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
