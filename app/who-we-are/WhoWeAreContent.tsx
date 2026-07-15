'use client';

import { useState, useEffect } from 'react';
import api from '@/api/axios';
import HeroSection from '@/components/shared/HeroSection';
import AboutContent from './AboutContent';
import PageSkeleton from '@/components/shared/PageSkeleton';
import siteConfig from '@/config/siteConfig';

export default function WhoWeAreContent() {
    const [data, setData] = useState<{
        profile: any;
        brands: any[];
        testimonials: any[];
        blogs: any[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            try {
                const [profileRes, brandsRes, testimonialsRes, blogsRes] = await Promise.allSettled([
                    api.get('/profile'),
                    api.get('/brands'),
                    api.get('/testimonials'),
                    api.get('/blogs'),
                ]);

                if (cancelled) return;

                const profile = profileRes.status === 'fulfilled' && profileRes.value.data ? profileRes.value.data : null;
                const brands = brandsRes.status === 'fulfilled' && brandsRes.value.data
                    ? (Array.isArray(brandsRes.value.data) ? brandsRes.value.data : brandsRes.value.data.data || [])
                    : [];
                const testimonials = testimonialsRes.status === 'fulfilled' && testimonialsRes.value.data
                    ? (Array.isArray(testimonialsRes.value.data) ? testimonialsRes.value.data : testimonialsRes.value.data.data || [])
                    : [];
                const blogs = blogsRes.status === 'fulfilled' && blogsRes.value.data?.data
                    ? blogsRes.value.data.data
                    : [];

                setData({ profile, brands, testimonials, blogs });
            } catch (err) {
                console.error('Error fetching about data:', err);
                setData({ profile: null, brands: [], testimonials: [], blogs: [] });
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <>
                <HeroSection
                    slug="who-we-are"
                    fallback={{
                        eyebrow: 'Who We Are',
                        title: siteConfig.companyName,
                        subtitle: `We are ${siteConfig.companyName}, dedicated to delivering excellence and building a sustainable future.`,
                    }}
                />
                <PageSkeleton message="Loading company profile..." />
            </>
        );
    }

    const profile = data?.profile;
    const fallbackTitle = profile?.brand_name || siteConfig.companyName;
    const fallbackSubtitle =
        profile?.description_brief ||
        `We are ${fallbackTitle}, dedicated to delivering excellence and building a sustainable future.`;

    return (
        <>
            <div id="about-profile" className="scroll-mt-24">
                <HeroSection
                    slug="who-we-are"
                    fallback={{ eyebrow: 'Who We Are', title: fallbackTitle, subtitle: fallbackSubtitle }}
                />
            </div>
            <AboutContent
                initialData={{
                    profile: data?.profile ?? null,
                    brands: data?.brands ?? [],
                    testimonials: data?.testimonials ?? [],
                    blogs: data?.blogs ?? [],
                }}
            />
        </>
    );
}
