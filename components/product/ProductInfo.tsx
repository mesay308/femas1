'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import api from '@/api/axios';
import { Phone, Check, Shield, Sparkles, Flame, Wrench } from 'lucide-react';
import { formatStockLabel } from '@/lib/mapPublicProduct';

const TelegramIcon = ({ className, size = 20 }: { className?: string; size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden
    >
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

export type PublicProductInfo = {
    title: string;
    sku: string;
    category: string;
    brandName: string;
    price: string | null;
    stockStatus: string;
    isFeatured: boolean;
    badges: Array<{ type: string; text: string }>;
    applications: string[];
    shortDescription: string;
    specsHighlights: Array<{ label: string; value: string }>;
};

interface ProductInfoProps {
    product: PublicProductInfo;
}

function stockPillClass(status: string) {
    if (status === 'in_stock') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status === 'low_stock') return 'bg-amber-50 text-amber-900 border-amber-200';
    if (status === 'out_of_stock') return 'bg-red-50 text-red-800 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
}

const ProductInfo = ({ product }: ProductInfoProps) => {
    const [settings, setSettings] = useState<Record<string, string> | null>(null);

    useEffect(() => {
        api.get('/settings')
            .then((res) => setSettings(res.data))
            .catch(() => {});
    }, []);

    const primaryPhone = settings?.primary_phone || '';
    const telegramUrl = settings?.telegram_url || '#';

    const { title, sku, category, brandName, price, stockStatus, isFeatured, badges, applications, shortDescription, specsHighlights } =
        product;

    const containerVariants = {
        hidden: { opacity: 0, x: 16 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.45, staggerChildren: 0.06 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative flex-1 min-w-0"
        >
            <motion.div variants={itemVariants} className="mb-5 flex flex-wrap items-center gap-2">
                {isFeatured && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-brand-orange">
                        <Sparkles size={12} aria-hidden /> Featured
                    </span>
                )}
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${stockPillClass(stockStatus)}`}
                >
                    {formatStockLabel(stockStatus)}
                </span>
                {badges?.map((badge, idx) => (
                    <span
                        key={idx}
                        className={`inline-flex items-center rounded-full border border-white/30 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white shadow-sm ${
                            badge.type === 'primary' ? 'bg-brand-blue' : 'bg-brand-orange'
                        }`}
                    >
                        {badge.text}
                    </span>
                ))}
            </motion.div>

            <motion.h1 variants={itemVariants} className="typo-page-h1 mb-3 text-balance text-slate-900 dark:text-white">
                {title}
            </motion.h1>

            <motion.div variants={itemVariants} className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="font-mono text-xs font-bold uppercase tracking-wide text-slate-500">
                    SKU: <span className="text-slate-800">{sku || '—'}</span>
                </span>
                <span className="hidden text-slate-300 sm:inline" aria-hidden>
                    |
                </span>
                <span className="font-semibold text-brand-blue">{category}</span>
                {brandName ? (
                    <>
                        <span className="hidden text-slate-300 sm:inline" aria-hidden>
                            |
                        </span>
                        <span className="font-semibold text-slate-600">{brandName}</span>
                    </>
                ) : null}
            </motion.div>

            {price && (
                <motion.div variants={itemVariants} className="mb-8 flex items-end gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4">
                    <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">{price}</span>
                    <span className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">List</span>
                </motion.div>
            )}

            <div className="mb-8 space-y-8">
                {applications?.length > 0 && (
                    <motion.div variants={itemVariants}>
                        <div className="mb-3 px-1 text-xs font-black uppercase tracking-widest text-slate-500">Ideal for</div>
                        <div className="flex flex-wrap gap-2">
                            {applications.map((app, idx) => (
                                <span
                                    key={idx}
                                    className="flex max-w-full items-start gap-2.5 rounded-2xl border border-brand-blue/20 bg-white px-3 py-2 text-sm font-semibold text-brand-blue shadow-sm sm:max-w-md"
                                >
                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                                        <Check size={14} strokeWidth={3} aria-hidden />
                                    </span>
                                    <span className="min-w-0 flex-1 leading-snug">{app}</span>
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {specsHighlights?.length > 0 && (
                    <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
                        {specsHighlights.map((spec, idx) => (
                            <div
                                key={idx}
                                className="w-fit max-w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm transition-colors hover:border-brand-blue/40 sm:max-w-xs"
                            >
                                <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{spec.label}</div>
                                <div className="break-words text-sm font-semibold leading-snug text-slate-900">{spec.value}</div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>

            {shortDescription && (
                <motion.div variants={itemVariants} className="mb-8 rounded-2xl border-l-4 border-brand-orange bg-white/60 p-5 text-slate-700 shadow-sm">
                    <p className="text-base leading-relaxed text-slate-800">{shortDescription}</p>
                </motion.div>
            )}

            <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-3 sm:flex-row">
                {primaryPhone && (
                    <a
                        href={`tel:${primaryPhone.replace(/\s/g, '')}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-md transition hover:bg-emerald-700"
                    >
                        <Phone size={18} aria-hidden />
                        Call for orders
                    </a>
                )}
                {telegramUrl && telegramUrl !== '#' && (
                    <a
                        href={`${telegramUrl}?text=${encodeURIComponent(`Hi, I'm interested in ${title}${sku ? ` (${sku})` : ''}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-blue py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-md transition hover:brightness-110"
                    >
                        <TelegramIcon size={18} />
                        Message us
                    </a>
                )}
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-x-3 border-t border-slate-200/70 pt-7 sm:gap-x-6 sm:pt-9">
                <div className="flex min-w-0 flex-col items-center gap-2.5 border-r border-slate-100 pr-2 text-center sm:gap-3 sm:pr-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue sm:h-11 sm:w-11 sm:rounded-2xl">
                        <Flame size={18} className="sm:h-5 sm:w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 px-0.5">
                        <div className="text-[10px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-[11px] sm:tracking-widest">
                            Engineering
                        </div>
                        <p className="mt-1 line-clamp-3 text-[11px] font-semibold leading-snug text-slate-700 sm:text-xs sm:leading-relaxed">
                            Advanced Turkish design & manufacturing
                        </p>
                    </div>
                </div>
                <div className="flex min-w-0 flex-col items-center gap-2.5 border-r border-slate-100 px-1 text-center sm:gap-3 sm:px-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-orange/15 text-brand-orange sm:h-11 sm:w-11 sm:rounded-2xl">
                        <Shield size={18} className="sm:h-5 sm:w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 px-0.5">
                        <div className="text-[10px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-[11px] sm:tracking-widest">
                            Safety
                        </div>
                        <p className="mt-1 line-clamp-3 text-[11px] font-semibold leading-snug text-slate-700 sm:text-xs sm:leading-relaxed">
                            Flame failure protection & certification
                        </p>
                    </div>
                </div>
                <div className="flex min-w-0 flex-col items-center gap-2.5 pl-2 text-center sm:gap-3 sm:pl-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 sm:h-11 sm:w-11 sm:rounded-2xl">
                        <Wrench size={18} className="sm:h-5 sm:w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 px-0.5">
                        <div className="text-[10px] font-black uppercase leading-tight tracking-wider text-slate-500 sm:text-[11px] sm:tracking-widest">Integration</div>
                        <p className="mt-1 line-clamp-3 text-[11px] font-semibold leading-snug text-slate-700 sm:text-xs sm:leading-relaxed">
                            Bespoke cabinetry & appliance fitting
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProductInfo;
