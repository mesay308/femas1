'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import api from '@/api/axios';
import siteConfig from '@/config/siteConfig';
import HeroSectionCta from './HeroSectionCta';

export type HeroTrustBadge = {
    badge_id: string;
    label: string;
    icon_url: string | null;
    display_order?: number;
    is_active?: boolean | number;
};

export type HeroSectionData = {
    slide_id: string;
    page_slug: string;
    eyebrow: string | null;
    title: string | null;
    subtitle: string | null;
    image_url: string;
    image_side: 'left' | 'right';
    content_ratio: '40_60' | '50_50' | '60_40';
    theme: 'light' | 'dark';
    cta_text: string | null;
    cta_link: string | null;
    display_order?: number;
    is_active?: boolean | number;
    trust_badges?: HeroTrustBadge[];
};

type HeroSectionProps = {
    slug: string;
    fallback?: {
        eyebrow?: string;
        title?: string;
        subtitle?: string;
    };
};

const resolveAssetUrl = (url: string | null | undefined) => {
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

export default function HeroSection({ slug, fallback }: HeroSectionProps) {
    const [hero, setHero] = useState<HeroSectionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        api.get('/content/hero', { params: { page: slug } })
            .then((res) => {
                if (cancelled) return;
                const list: HeroSectionData[] = Array.isArray(res.data) ? res.data : res.data?.data || [];
                if (list.length) {
                    const sorted = [...list].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
                    setHero(sorted[0]);
                }
            })
            .catch((err) => {
                console.error(`[HeroSection] failed to fetch for ${slug}:`, err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [slug]);

    const eyebrow = hero?.eyebrow || fallback?.eyebrow || '';
    const title = hero?.title || fallback?.title || siteConfig.companyName;
    const subtitle = hero?.subtitle || fallback?.subtitle || siteConfig.companyTagline;
    const imageUrl = resolveAssetUrl(hero?.image_url);
    const imageSide: 'left' | 'right' = hero?.image_side || 'right';
    const ratio = hero?.content_ratio || '40_60';
    const theme = hero?.theme || 'dark';
    const ctaText = hero?.cta_text || '';
    const ctaLink = hero?.cta_link || '';
    const trustBadges = (hero?.trust_badges || []).filter(b => b.is_active !== false && b.label);

    if (loading) {
        return (
            <section className="hero-section" data-theme={theme}>
                <div className="site-container">
                    <div className="h-[60vh] min-h-[500px] w-full animate-pulse rounded-[2.5rem] bg-slate-200 dark:bg-slate-800" />
                </div>
            </section>
        );
    }

    return (
        <section
            className="hero-section"
            data-theme={theme}
            data-ratio={ratio}
            data-image-side={imageSide}
            aria-label={`${slug} hero`}
        >
            <div className="site-container">
                <div className="hero-section__grid">
                    <div className="hero-section__content">
                        <div
                            className={
                                theme === 'dark'
                                    ? 'hero-section__glass hero-section__glass--dark'
                                    : 'hero-section__glass hero-section__glass--light'
                            }
                        >
                            {eyebrow ? <span className="hero-section__eyebrow">{eyebrow}</span> : null}
                            <h1 className={`typo-hero-headline ${theme === 'dark' ? 'hero-section__title--dark' : ''}`}>
                                {title}
                            </h1>
                            {subtitle ? (
                                <p
                                    className={`typo-hero-support mt-4 max-w-xl ${
                                        theme === 'dark' ? 'hero-section__subtitle--dark' : 'opacity-90'
                                    }`}
                                >
                                    {subtitle}
                                </p>
                            ) : null}
                            {(ctaText && ctaLink) || trustBadges.length ? (
                                <div className="hero-section__cta-row mt-8 flex flex-wrap items-center gap-4">
                                    {ctaText && ctaLink ? (
                                        <HeroSectionCta href={ctaLink} label={ctaText} theme={theme} />
                                    ) : null}
                                </div>
                            ) : null}
                            {trustBadges.length > 0 ? (
                                <ul
                                    className={`hero-section__trust ${
                                        theme === 'dark' ? 'hero-section__trust--premium-dark' : ''
                                    }`}
                                    aria-label="Trust badges"
                                >
                                    {trustBadges.map((badge) => (
                                        <li
                                            key={badge.badge_id}
                                            className={`hero-section__trust-item ${theme === 'dark' ? 'hero-section__trust-item--premium' : ''}`}
                                        >
                                            {badge.icon_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={resolveAssetUrl(badge.icon_url)}
                                                    alt=""
                                                    className={`object-contain ${theme === 'dark' ? 'size-5 brightness-110 contrast-125' : 'size-5'}`}
                                                />
                                            ) : (
                                                <span
                                                    className={theme === 'dark' ? 'hero-section__trust-dot-premium' : 'hero-section__trust-dot'}
                                                    aria-hidden
                                                />
                                            )}
                                            <span>{badge.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                    </div>
                    <div className={`hero-section__media ${theme === 'dark' ? 'hero-section__media--premium-dark' : ''}`}>
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={title}
                                fill
                                priority
                                className="object-cover"
                                sizes="(min-width: 1024px) 60vw, 100vw"
                            />
                        ) : (
                            <div className="size-full grid place-items-center bg-slate-200 text-slate-400 text-sm font-semibold uppercase tracking-widest">
                                <ArrowRight size={28} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
