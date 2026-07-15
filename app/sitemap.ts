import { MetadataRoute } from 'next';
import siteConfig from '@/config/siteConfig';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const URL = siteConfig.siteUrl;

    const staticRoutes = [
        '',
        '/who-we-are',
        '/categories',
        '/products',
        '/contact',
    ].map((route) => ({
        url: `${URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Category routes fetched via fetch() with absolute URL (not axios)
    // to avoid circular dependency issues on Vercel
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || URL;
        const cleanBase = apiBase.replace(/\/$/, '');
        const response = await fetch(`${cleanBase}/api/categories`, {
            next: { revalidate: 3600 }, // Revalidate every hour
        });
        if (response.ok) {
            const categories = await response.json();
            categoryRoutes = (Array.isArray(categories) ? categories : []).map((cat: any) => ({
                url: `${URL}/category/${cat.slug}`,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            }));
        }
    } catch (e) {
        console.error('Sitemap category fetch failed', e);
    }

    return [...staticRoutes, ...categoryRoutes];
}
