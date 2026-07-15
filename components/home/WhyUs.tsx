'use client';

import {
    Flame,
    Home,
    Layers,
    Wrench,
    Handshake,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
    Award,
    BadgeCheck,
    Shield,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import siteConfig from '@/config/siteConfig';
import type { HeroTrustBadge } from '@/components/shared/HeroSection';

const SUBHERO_SRC = '/images/who-we-are.jpg';

const TRUST_FALLBACK_ICONS = [ShieldCheck, Award, BadgeCheck, Shield] as const;

const reasonsFallback = [
    { icon: Flame, title: 'Advanced Turkish Tech', desc: 'Renowned Turkish engineering with built-in Flame Failure Devices for ultimate safety.' },
    { icon: Home, title: 'Tailored for Ethiopia', desc: 'Appliance designs like round ovens built specifically for flatbread/injera and local floor plans.' },
    { icon: ShieldCheck, title: 'Premium Material Selection', desc: 'Imported moisture-resistant wood and durable, scratch-resistant granite countertops.' },
    { icon: Layers, title: 'Bespoke Kitchen Cabinets', desc: 'Custom 3D design and measurements for a seamless, space-saving cabinetry integration.' },
    { icon: Wrench, title: 'Professional Installation', desc: 'End-to-end service including measurement, design, delivery, and secure stove fitting.' },
    { icon: Handshake, title: 'Addis Ababa Showroom & Support', desc: 'Three years of local presence bringing reliable kitchen transformations and customer service.' },
];

function resolveBadgeIconUrl(url: string | null | undefined) {
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
}

interface WhyUsProps {
    trustBadges?: HeroTrustBadge[];
}

const WhyUs = ({ trustBadges = [] }: WhyUsProps) => {
    const activeBadges = trustBadges.filter((b) => b && String(b.label || '').trim());

    return (
        <section className="relative overflow-hidden border-t border-slate-100 bg-gradient-to-b from-[#f8fafc] via-white to-sky-50/25 py-20 md:py-28">
            <div
                className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-blue/[0.1] blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-brand-orange/[0.09] blur-3xl"
                aria-hidden
            />

            <div className="container relative z-10 mx-auto max-w-[1440px] px-4">
                <div className="flex flex-col items-stretch gap-8 lg:flex-row lg:gap-10">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.55 }}
                        className="group relative min-h-[22rem] flex-[1.05] overflow-hidden rounded-[2rem] border border-slate-200/90 bg-slate-900 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] lg:min-h-[28rem]"
                    >
                        <Image
                            src={SUBHERO_SRC}
                            alt={`${siteConfig.companyName} — our facilities and team`}
                            fill
                            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                            sizes="(min-width: 1024px) 52vw, 100vw"
                            priority
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" aria-hidden />
                        <div className="absolute inset-x-0 bottom-0 z-10 p-8 md:p-10">
                            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/95 backdrop-blur-md">
                                <ShieldCheck className="h-4 w-4 text-brand-orange" strokeWidth={2.5} aria-hidden />
                                Trusted kitchen design
                            </div>
                            <p className="max-w-md font-serif text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">
                                <span className="text-brand-orange">Femas</span> Kitchens — built for{' '}
                                <span className="text-slate-100">modern living</span>
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.55, delay: 0.06 }}
                        className="flex flex-[0.95] flex-col rounded-[2rem] border border-slate-200/90 bg-white/90 p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.03] backdrop-blur-sm md:p-10"
                    >
                        <div className="mb-8">
                            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-orange bg-brand-orange px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">
                                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                                Why {siteConfig.companyName}
                            </span>
                            <h2 className="typo-section-h2 mt-2 text-slate-900">
                                Why families across Ethiopia trust{' '}
                                <span className="text-brand-blue">{siteConfig.companyName}</span>
                            </h2>
                            <p className="typo-card-desc mt-3 text-slate-600">
                                Premium Turkish appliances, custom-made kitchen cabinets, and reliable installation services.
                            </p>
                        </div>

                        <div className="grid flex-1 grid-cols-1 gap-3 rounded-2xl bg-brand-blue p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-black/10 sm:grid-cols-2 sm:gap-3 sm:p-5">
                            {reasonsFallback.map((item, index) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.24) }}
                                    className="group/card relative overflow-hidden rounded-xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-white/25 hover:bg-white/[0.16] sm:p-5"
                                >
                                    <div
                                        className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/10 blur-2xl transition-opacity group-hover/card:opacity-100"
                                        aria-hidden
                                    />
                                    <div className="relative">
                                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/25 bg-brand-orange text-white shadow-md transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-lg">
                                            <item.icon size={20} strokeWidth={2} aria-hidden />
                                        </div>
                                        <h3 className="typo-card-title mb-1.5 text-white transition-colors group-hover/card:text-blue-50">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm font-medium leading-relaxed text-blue-50/90">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {activeBadges.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.08 }}
                        className="relative mt-10 overflow-hidden rounded-[2rem] border border-white/25 bg-gradient-to-br from-brand-blue via-brand-blue to-brand-orange shadow-[0_20px_50px_-12px_rgba(0,165,223,0.45),0_8px_24px_-8px_rgba(249,140,20,0.25)] ring-1 ring-brand-blue/30"
                    >
                        <div
                            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_10%_0%,rgba(255,255,255,0.22),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(249,140,20,0.35),transparent_50%)]"
                            aria-hidden
                        />
                        <div className="relative px-5 py-8 md:px-10 md:py-10">
                            <ul
                                className="flex flex-wrap items-stretch justify-center gap-3 sm:gap-4 md:gap-4"
                                aria-label="Trust badges"
                            >
                                {activeBadges.map((badge, index) => {
                                    const FallbackIcon = TRUST_FALLBACK_ICONS[index % TRUST_FALLBACK_ICONS.length];
                                    const accentOrange = index % 2 === 1;
                                    const hasUpload = Boolean(badge.icon_url?.trim());
                                    const iconShell = hasUpload
                                        ? 'bg-white text-brand-blue ring-white/60'
                                        : accentOrange
                                          ? 'bg-brand-orange text-white ring-white/35'
                                          : 'bg-white text-brand-blue ring-white/40';
                                    return (
                                        <li
                                            key={String(badge.badge_id ?? badge.label)}
                                            className={`flex min-w-[10.5rem] max-w-[20rem] flex-1 basis-[calc(50%-0.375rem)] items-center gap-3 rounded-2xl border px-3 py-3 shadow-md backdrop-blur-sm transition-all duration-300 sm:basis-auto sm:px-4 sm:py-3.5 ${
                                                accentOrange
                                                    ? 'border-brand-orange/50 bg-white/15 hover:border-brand-orange hover:bg-white/22'
                                                    : 'border-white/35 bg-white/12 hover:border-white/55 hover:bg-white/20'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md ring-2 ${iconShell}`}
                                            >
                                                {hasUpload ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={resolveBadgeIconUrl(badge.icon_url)}
                                                        alt=""
                                                        className="h-6 w-6 object-contain"
                                                    />
                                                ) : (
                                                    <FallbackIcon className="h-5 w-5 shrink-0" strokeWidth={2.2} aria-hidden />
                                                )}
                                            </div>
                                            <span className="min-w-0 text-left text-[11px] font-bold uppercase leading-snug tracking-wide text-white sm:text-xs sm:tracking-wider">
                                                {badge.label}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </motion.div>
                ) : null}

                <div className="mt-12 text-center md:mt-14">
                    <Link
                        href="/who-we-are"
                        className="group inline-flex items-center gap-3 rounded-2xl bg-brand-blue px-10 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5 hover:bg-brand-orange hover:shadow-brand-orange/25 active:scale-[0.98]"
                    >
                        Learn more
                        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default WhyUs;
