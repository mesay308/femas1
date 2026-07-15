'use client';

import { useState, useEffect } from 'react';
import api from '@/api/axios';
import HeroSection from '@/components/shared/HeroSection';
import type { HeroTrustBadge } from '@/components/shared/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyUs from '@/components/home/WhyUs';
import AfterSales from '@/components/home/AfterSales';
import QuickRequest from '@/components/home/QuickRequest';
import ClientLogos from '@/components/home/ClientLogos';
import SEOContent from '@/components/home/SEOContent';
import PageSkeleton from '@/components/shared/PageSkeleton';
import siteConfig from '@/config/siteConfig';

// Helper to resolve image URLs from backend
const resolveUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;
    if (!process.env.NEXT_PUBLIC_API_URL) {
        if ((cleanUrl.startsWith('/uploads') && !cleanUrl.startsWith('/api/uploads')) ||
            (cleanUrl.startsWith('/images') && !cleanUrl.startsWith('/api/images'))) {
            cleanUrl = `/api${cleanUrl}`;
        }
    }
    return `${base}${cleanUrl}`;
};

interface HomeData {
    categories: any[];
    products: any[];
    clients: any[];
    blogs: any[];
    trustBadges: HeroTrustBadge[];
    backendError: boolean;
}

export default function HomeContent() {
    const [data, setData] = useState<HomeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchAll() {
            try {
                const [categoriesRes, productsRes, clientsRes, blogsRes] = await Promise.allSettled([
                    api.get('/categories'),
                    api.get('/products'),
                    api.get('/clients'),
                    api.get('/blogs'),
                ]);

                // Fetch hero trust badges
                let trustBadges: HeroTrustBadge[] = [];
                try {
                    const heroRes = await api.get('/content/hero', { params: { page: 'home' } });
                    const list: unknown[] = Array.isArray(heroRes.data) ? heroRes.data : (heroRes.data as { data?: unknown[] })?.data || [];
                    if (list.length) {
                        const sorted = [...list].sort(
                            (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
                        );
                        const hero = sorted[0] as { trust_badges?: HeroTrustBadge[] } | undefined;
                        trustBadges = (hero?.trust_badges || []).filter(
                            (b) => b && b.is_active !== false && String(b.label || '').trim()
                        );
                    }
                } catch { /* ignore */ }

                if (cancelled) return;

                // Process categories
                const allCategories = categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value.data) ? categoriesRes.value.data : [];
                const activeCats = allCategories.filter((cat: any) => cat.is_active);
                const leafCategories = activeCats.filter((cat: any) =>
                    !activeCats.some((child: any) => child.parent_category_id === cat.category_id)
                ).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
                    .map((cat: any) => ({
                        ...cat,
                        cover_image_url: resolveUrl(cat.cover_image_url)
                    }));

                // Process products
                const productsRaw = productsRes.status === 'fulfilled' ? productsRes.value.data : null;
                const productsData = productsRaw?.data || productsRaw;
                const allProducts = Array.isArray(productsData) ? productsData : [];
                const featuredProducts = allProducts
                    .filter((p: any) => p.is_active && p.is_featured)
                    .concat(allProducts.filter((p: any) => p.is_active && !p.is_featured))
                    .slice(0, 12)
                    .map((p: any) => {
                        const parseJson = (data: any) => {
                            if (!data) return [];
                            if (typeof data === 'string') {
                                try { return JSON.parse(data); } catch { return []; }
                            }
                            return data;
                        };
                        return {
                            id: p.slug || p.product_id,
                            title: p.name,
                            sku: p.sku,
                            price: p.base_price > 0 ? `${siteConfig.currencySymbol} ${Number(p.base_price).toLocaleString()}` : null,
                            images: p.cover_image_url ? [resolveUrl(p.cover_image_url)] : [],
                            badges: parseJson(p.badge).filter((b: string) => [
                                'new arrival', 'best seller', 'limited stock', 'featured', 
                                'concentrated', 'hard-water hero', 'eco-friendly', 'skin-friendly'
                            ].includes(b.toLowerCase())).map((b: string) => ({
                                type: b.toLowerCase().includes('new') || b.toLowerCase().includes('best') ? 'primary' : 'secondary',
                                text: b
                            })),
                            benefits: parseJson(p.applications),
                            applicationNote: p.short_description || ''
                        };
                    });

                // Process clients
                const clientsRaw = clientsRes.status === 'fulfilled' ? clientsRes.value.data : [];
                const clientLogos = (Array.isArray(clientsRaw) ? clientsRaw : [])
                    .map((c: any) => ({
                        name: c.name,
                        logo: resolveUrl(c.logo_url)
                    }));

                // Process blogs
                const blogsRaw = blogsRes.status === 'fulfilled' ? blogsRes.value.data : [];
                const blogPosts = (Array.isArray(blogsRaw) ? blogsRaw : [])
                    .map((b: any) => ({
                        ...b,
                        cover_image_url: resolveUrl(b.cover_image_url)
                    }));

                setData({
                    categories: leafCategories,
                    products: featuredProducts,
                    clients: clientLogos,
                    blogs: blogPosts,
                    trustBadges,
                    backendError: false,
                });
            } catch (err) {
                console.error('Error fetching homepage data:', err);
                if (!cancelled) {
                    setData({
                        categories: [],
                        products: [],
                        clients: [],
                        blogs: [],
                        trustBadges: [],
                        backendError: true,
                    });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchAll();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <PageSkeleton message="Loading Femas..." />;
    }

    if (!data || data.backendError) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="text-center max-w-2xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">System Update in Progress</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
                        We are currently performing scheduled maintenance on our backend systems to improve your experience. Our full catalog and services will be back online shortly.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
                        Please check back in a few minutes
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main>
            <HeroSection slug="home" />
            <CategoryGrid categories={data.categories} />
            <FeaturedProducts products={data.products} />
            <WhyUs trustBadges={data.trustBadges} />
            <AfterSales />
            <QuickRequest />
            <ClientLogos clients={data.clients} />
            <SEOContent blogs={data.blogs} />
        </main>
    );
}
