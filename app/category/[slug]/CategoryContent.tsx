'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, Sparkles, Layers, Award } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import api from '@/api/axios';
import ProductEngine from '@/components/product-engine/ProductEngine';

interface CategoryContentProps {
    category: any;
    productsCount?: number;
}

const resolveUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base}${url.startsWith('/') ? url : `/${url}`}`;
};

type HeroCfg = {
    headline: string;
    subheadline: string;
    cta_primary: { label: string; link: string };
    cta_secondary: { label: string; link: string };
    trust_badges: Array<{ label: string; icon_url?: string }>;
};

function parseHero(raw: unknown): HeroCfg {
    const empty: HeroCfg = {
        headline: '',
        subheadline: '',
        cta_primary: { label: '', link: '' },
        cta_secondary: { label: '', link: '' },
        trust_badges: [],
    };
    if (raw == null) return empty;
    try {
        const h = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!h || typeof h !== 'object') return empty;
        return {
            headline: typeof h.headline === 'string' ? h.headline : '',
            subheadline: typeof h.subheadline === 'string' ? h.subheadline : '',
            cta_primary: {
                label: typeof h.cta_primary?.label === 'string' ? h.cta_primary.label : '',
                link: typeof h.cta_primary?.link === 'string' ? h.cta_primary.link : '',
            },
            cta_secondary: {
                label: typeof h.cta_secondary?.label === 'string' ? h.cta_secondary.label : '',
                link: typeof h.cta_secondary?.link === 'string' ? h.cta_secondary.link : '',
            },
            trust_badges: Array.isArray(h.trust_badges)
                ? h.trust_badges.map((b: any) => ({
                      label: typeof b?.label === 'string' ? b.label : '',
                      icon_url: typeof b?.icon_url === 'string' ? b.icon_url : '',
                  }))
                : [],
        };
    } catch {
        return empty;
    }
}

function parseFeatures(raw: unknown): Array<{ title: string; description: string }> {
    if (raw == null) return [];
    try {
        const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!Array.isArray(p)) return [];
        return p.map((row: any) => ({
            title: typeof row?.title === 'string' ? row.title : '',
            description: typeof row?.description === 'string' ? row.description : '',
        }));
    } catch {
        return [];
    }
}

const HIGHLIGHT_ICONS = [Sparkles, Layers, Award] as const;

function HeroCtaButton({
    label,
    href,
    variant,
}: {
    label: string;
    href: string;
    variant: 'primary' | 'secondary';
}) {
    const scrollToProducts = () =>
        document.getElementById('category-products')?.scrollIntoView({ behavior: 'smooth' });

    const trimmed = href?.trim() || '';

    if (!label.trim()) return null;

    const primaryClass =
        'group relative w-full overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-brand-orange to-brand-orange/90 px-8 py-4 text-white shadow-[0_12px_40px_-8px_rgba(249,140,20,0.55)] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-1 hover:brightness-105 hover:shadow-[0_16px_48px_-8px_rgba(249,140,20,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 lg:w-auto';

    const secondaryClass =
        'group w-full rounded-2xl border border-white/25 bg-white/[0.08] px-8 py-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 lg:w-auto';

    const labelPrimary = 'text-sm font-black uppercase tracking-[0.18em] text-white drop-shadow-sm';
    const labelSecondary =
        'text-sm font-bold uppercase tracking-[0.15em] text-white/95 drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]';

    if (!trimmed || trimmed === '#category-products') {
        return (
            <button type="button" onClick={scrollToProducts} className={variant === 'primary' ? primaryClass : secondaryClass}>
                <span className={`flex items-center justify-center gap-3 ${variant === 'primary' ? labelPrimary : labelSecondary}`}>
                    {label}
                    <motion.span animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} aria-hidden>
                        <ChevronDown size={20} className={variant === 'primary' ? 'opacity-90' : 'text-brand-orange/90'} />
                    </motion.span>
                </span>
            </button>
        );
    }

    if (trimmed.startsWith('http')) {
        return (
            <a
                href={trimmed}
                target="_blank"
                rel="noopener noreferrer"
                className={variant === 'primary' ? primaryClass : secondaryClass}
            >
                <span className={`flex items-center justify-center gap-2 ${variant === 'primary' ? labelPrimary : labelSecondary}`}>
                    {label}
                </span>
            </a>
        );
    }

    return (
        <Link href={trimmed} className={variant === 'primary' ? primaryClass : secondaryClass}>
            <span className={`flex items-center justify-center gap-3 ${variant === 'primary' ? labelPrimary : labelSecondary}`}>
                {label}
                <motion.span animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} aria-hidden>
                    <ChevronDown size={20} className={variant === 'primary' ? 'opacity-90' : 'text-brand-orange/90'} />
                </motion.span>
            </span>
        </Link>
    );
}

function CategoryContentInner({ category: routeCategory }: CategoryContentProps) {
    const searchParams = useSearchParams();

    const urlCategoryFirst = useMemo(() => {
        const raw = searchParams.get('category_id')?.trim() || '';
        if (!raw) return '';
        return raw.split(',')[0].trim();
    }, [searchParams]);

    const effectiveCategoryId = useMemo(
        () => urlCategoryFirst || String(routeCategory.category_id),
        [urlCategoryFirst, routeCategory.category_id]
    );

    const [resolvedCategory, setResolvedCategory] = useState(routeCategory);

    useEffect(() => {
        if (String(effectiveCategoryId) === String(routeCategory.category_id)) {
            setResolvedCategory(routeCategory);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get(`/categories/by-id/${encodeURIComponent(effectiveCategoryId)}`);
                if (!cancelled) setResolvedCategory(res.data);
            } catch {
                if (!cancelled) setResolvedCategory(routeCategory);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [effectiveCategoryId, routeCategory]);

    const category = resolvedCategory;
    const hero = parseHero(category.hero_config);
    const features = parseFeatures(category.features);
    const highlightFeatures = features.filter((f) => f.title?.trim() || f.description?.trim());
    const hasFeatureContent = highlightFeatures.length > 0;

    const headline = hero.headline.trim() || category.name;
    const tagline = hero.subheadline.trim() || category.short_description?.trim() || '';

    const primaryLabel = hero.cta_primary.label.trim() || 'Explore Products';
    const secondaryLabel = hero.cta_secondary.label.trim();

    const badges = hero.trust_badges.filter((b) => b.label.trim());

    const coverSrc = category.cover_image_url ? resolveUrl(category.cover_image_url) : '';

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <section
                className="hero-section hero-section--balanced-panels"
                data-theme="dark"
                data-ratio="50_50"
                data-image-side="right"
                aria-label={`${category.name} hero`}
            >
                <div className="site-container">
                    <div className="hero-section__grid">
                        <div className="hero-section__content flex h-full min-h-0 min-w-0">
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65 }}
                                className="flex h-full min-h-0 min-w-0 flex-1 flex-col"
                            >
                                <div className="hero-section__glass hero-section__glass--dark flex h-full min-h-0 flex-1 flex-col">
                                    <nav
                                        aria-label="Breadcrumb"
                                        className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50 sm:mb-7 sm:text-[11px]"
                                    >
                                        <Link href="/" className="transition-colors hover:text-white">
                                            Home
                                        </Link>
                                        <ChevronRight size={11} className="shrink-0 text-white/25" aria-hidden />
                                        <Link href="/categories" className="transition-colors hover:text-white">
                                            Categories
                                        </Link>
                                        <ChevronRight size={11} className="shrink-0 text-white/25" aria-hidden />
                                        <span className="font-bold tracking-[0.2em] text-brand-orange">{category.name}</span>
                                    </nav>

                                    <motion.h1
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.08, duration: 0.6 }}
                                        className="typo-hero-headline font-serif hero-section__title--dark"
                                    >
                                        {headline}
                                    </motion.h1>

                                    {tagline ? (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.15, duration: 0.5 }}
                                            className="typo-hero-support mt-4 max-w-xl border-l-2 border-brand-orange/80 pl-4 hero-section__subtitle--dark"
                                        >
                                            {tagline}
                                        </motion.p>
                                    ) : null}

                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.45 }}
                                        className="hero-section__cta-row mt-8 flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center"
                                    >
                                        <HeroCtaButton label={primaryLabel} href={hero.cta_primary.link} variant="primary" />
                                        {secondaryLabel ? (
                                            <HeroCtaButton label={secondaryLabel} href={hero.cta_secondary.link} variant="secondary" />
                                        ) : null}
                                    </motion.div>

                                    {badges.length > 0 ? (
                                        <motion.ul
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.26, duration: 0.45 }}
                                            className="hero-section__trust hero-section__trust--premium-dark"
                                            aria-label="Trust badges"
                                        >
                                            {badges.map((b, i) => (
                                                <li
                                                    key={`${b.label}-${i}`}
                                                    className="hero-section__trust-item hero-section__trust-item--premium"
                                                >
                                                    {b.icon_url ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={resolveUrl(b.icon_url)}
                                                            alt=""
                                                            className="size-5 shrink-0 object-contain brightness-110 contrast-125"
                                                        />
                                                    ) : (
                                                        <span className="hero-section__trust-dot-premium" aria-hidden />
                                                    )}
                                                    <span>{b.label}</span>
                                                </li>
                                            ))}
                                        </motion.ul>
                                    ) : null}
                                </div>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12, duration: 0.65 }}
                            className="flex h-full min-h-0 min-w-0 flex-col"
                        >
                            <div className="hero-section__glass hero-section__glass--dark flex h-full min-h-0 flex-1 flex-col">
                                <div className="hero-section__media relative min-h-0 flex-1 overflow-hidden bg-slate-900/30">
                                    {coverSrc ? (
                                        <Image
                                            src={coverSrc}
                                            alt={category.name}
                                            fill
                                            className="object-cover object-center"
                                            sizes="(min-width: 768px) 50vw, 100vw"
                                            priority
                                        />
                                    ) : (
                                        <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-800/90 to-slate-900 p-6 text-center">
                                            <p className="text-sm font-semibold leading-relaxed text-slate-400">
                                                No cover image yet. Add a <span className="text-slate-300">category profile image</span> in
                                                Admin → Visual Assets.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {hasFeatureContent ? (
                <section className="relative overflow-hidden border-t border-white/80 bg-gradient-to-b from-slate-50 via-white to-sky-50/25 py-20 md:py-28">
                    <div
                        className="pointer-events-none absolute -left-32 top-1/4 h-[22rem] w-[22rem] -translate-y-1/2 rounded-full bg-brand-blue/[0.12] blur-3xl"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -right-24 bottom-0 h-[18rem] w-[18rem] rounded-full bg-brand-orange/[0.1] blur-3xl"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.18) 1px, transparent 0)`,
                            backgroundSize: '28px 28px',
                        }}
                        aria-hidden
                    />

                    <div className="site-container relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.55 }}
                            className="mx-auto mb-14 max-w-2xl text-center md:mb-16"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white/80 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-brand-blue shadow-sm shadow-brand-blue/5 backdrop-blur-sm">
                                <Sparkles className="h-3.5 w-3.5 text-brand-orange" strokeWidth={2.5} aria-hidden />
                                Category highlights
                            </span>
                            <h2 className="mt-5 font-serif text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                                What sets this range apart
                            </h2>
                            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600 md:text-base">
                                Clear signals for buyers and partners — from formulation focus to outcomes you can expect.
                            </p>
                        </motion.div>

                        <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
                            {highlightFeatures.map((f, i) => {
                                const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
                                return (
                                    <motion.article
                                        key={`${f.title}-${i}`}
                                        initial={{ opacity: 0, y: 22 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: '-32px' }}
                                        transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.35) }}
                                        className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white/85 p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_20px_48px_-16px_rgba(15,23,42,0.1)] ring-1 ring-slate-900/[0.03] backdrop-blur-md transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-brand-blue/35 hover:shadow-[0_28px_56px_-16px_rgba(37,99,235,0.14)] md:rounded-[2rem] md:p-9"
                                    >
                                        <div
                                            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-brand-blue/[0.12] to-transparent opacity-80 blur-2xl transition-all duration-700 group-hover:from-brand-orange/20"
                                            aria-hidden
                                        />
                                        <div
                                            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-blue/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                            aria-hidden
                                        />
                                        <div
                                            className="pointer-events-none absolute left-0 top-8 h-[calc(100%-4rem)] w-[3px] rounded-full bg-gradient-to-b from-brand-orange via-brand-blue/60 to-transparent opacity-90"
                                            aria-hidden
                                        />

                                        <div className="relative z-[1] flex flex-1 flex-col">
                                            <div className="mb-6 flex items-start justify-between gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 text-brand-blue shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all duration-500 group-hover:border-brand-blue/25 group-hover:from-brand-blue/[0.08] group-hover:to-white group-hover:text-brand-blue group-hover:shadow-md">
                                                    <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                                                </div>
                                                <span className="rounded-lg bg-slate-900/[0.04] px-2 py-1 font-mono text-[11px] font-bold tabular-nums text-slate-400 ring-1 ring-slate-900/[0.06] transition-colors duration-300 group-hover:bg-brand-orange/[0.08] group-hover:text-brand-orange">
                                                    {String(i + 1).padStart(2, '0')}
                                                </span>
                                            </div>

                                            {f.title?.trim() ? (
                                                <h3 className="mb-3 text-xl font-black leading-snug tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-brand-blue md:text-[1.35rem]">
                                                    {f.title.trim()}
                                                </h3>
                                            ) : null}
                                            {f.description?.trim() ? (
                                                <p className="text-[15px] font-medium leading-relaxed text-slate-600 md:text-base">
                                                    {f.description.trim()}
                                                </p>
                                            ) : null}
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            ) : null}

            <div id="category-products" className="relative z-10 border-t border-slate-100 bg-white pb-16 md:pb-24">
                <ProductEngine
                    key={effectiveCategoryId}
                    baseFilters={{ category_id: effectiveCategoryId }}
                    initialTitle={`${category.name} — Products`}
                />
            </div>

            <div className="relative overflow-hidden bg-slate-900 py-20 md:py-32">
                <div className="pointer-events-none absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full bg-brand-blue/10 blur-[120px]" />
                <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-brand-orange/5 blur-[100px]" />

                <div className="site-container relative z-10 text-center">
                    <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
                        Need Bulk Sizes or a Distributor Quote?
                    </h2>
                    <p className="mx-auto mb-10 max-w-3xl text-sm font-normal leading-relaxed text-slate-400 sm:text-lg md:mb-16 md:text-xl">
                        Our sales team can walk you through available sizes, pricing tiers, and distributor margins for the{' '}
                        <strong className="text-white">{category?.name}</strong> range.
                    </p>

                    <div className="flex flex-col justify-center gap-6 sm:flex-row">
                        <Link
                            href="/contact"
                            className="rounded-full bg-brand-blue px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-brand-blue/20 transition-all hover:-translate-y-1 hover:brightness-110"
                        >
                            Call Sales
                        </Link>
                        <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-quote-modal'))}
                            className="rounded-full border border-white/20 bg-white/10 px-10 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/20"
                        >
                            Bulk Order Inquiry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CategoryContent(props: CategoryContentProps) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen animate-pulse bg-[#f8fafc]" aria-hidden />
            }
        >
            <CategoryContentInner {...props} />
        </Suspense>
    );
}
