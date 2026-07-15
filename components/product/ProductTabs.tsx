'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextDisplay from '../common/RichTextDisplay';
import { Info, List, Images, BookOpen, Play, Download, FileText, Check, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import { resolveImageUrl } from '@/utils/imageUtils';
import { parseYoutubeVideoId } from '@/utils/youtube';

const SCROLLBAR_HIDE_STYLE = {
    msOverflowStyle: 'none' as const,
    scrollbarWidth: 'none' as const,
};

function uniqueVideoUrls(...groups: (string | undefined | null)[][]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const g of groups) {
        for (const raw of g) {
            const u = (raw || '').trim();
            if (!u || seen.has(u)) continue;
            seen.add(u);
            out.push(u);
        }
    }
    return out;
}

const YouTubeVideoCard = ({ url, idx }: { url: string; idx: number }) => {
    const [title, setTitle] = useState(`Video ${idx + 1}`);
    const ytId = parseYoutubeVideoId(url);

    useEffect(() => {
        if (!url) return;
        const watch = ytId ? `https://www.youtube.com/watch?v=${ytId}` : url;
        const fetchTitle = async () => {
            try {
                const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`);
                if (res.ok) {
                    const data = await res.json();
                    if (data?.title) setTitle(data.title);
                }
            } catch {
                /* ignore */
            }
        };
        fetchTitle();
    }, [url, ytId]);

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-shadow hover:shadow-md"
        >
            <div className="relative aspect-video overflow-hidden bg-slate-100">
                {ytId && (
                    <Image
                        src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/15 transition-colors group-hover:bg-brand-blue/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition-colors group-hover:bg-red-600 group-hover:text-white">
                        <Play className="ml-0.5" size={22} aria-hidden />
                    </div>
                </div>
            </div>
            <div className="p-4">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{title}</p>
            </div>
        </motion.a>
    );
};

export interface ProductTabDoc {
    title: string;
    url: string;
    meta?: string;
}

interface ProductTabsProps {
    /** Product detail / long description from backend (`detailed_description`) */
    description: string;
    /** From admin applications */
    featureChips: string[];
    documents: ProductTabDoc[];
    models: Array<{ name?: string; model_number?: string; key_spec?: string; note?: string }>;
    videoUrls: string[];
    showcaseVideoUrl?: string;
    guideInstructionVideoUrls?: string[];
    /** Cover + gallery URLs (same as hero) */
    galleryImages: string[];
    /** Usage guide HTML from backend (`guide_scope`) */
    guideScope: string;
    guideInstructionImages?: string[];
}

const ProductTabs = ({
    description,
    featureChips,
    documents,
    models,
    videoUrls,
    showcaseVideoUrl = '',
    guideInstructionVideoUrls = [],
    galleryImages,
    guideScope,
    guideInstructionImages = [],
}: ProductTabsProps) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [lightbox, setLightbox] = useState<{ urls: string[]; index: number } | null>(null);
    const [portalReady, setPortalReady] = useState(false);

    const guideImageUrls = useMemo(
        () => guideInstructionImages.map((path) => resolveImageUrl(path)),
        [guideInstructionImages]
    );

    useEffect(() => {
        setPortalReady(true);
    }, []);

    useEffect(() => {
        if (!lightbox) return;
        const len = lightbox.urls.length;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightbox(null);
            if (e.key === 'ArrowLeft' && len > 1) {
                setLightbox((lb) =>
                    lb ? { ...lb, index: (lb.index + len - 1) % len } : null
                );
            }
            if (e.key === 'ArrowRight' && len > 1) {
                setLightbox((lb) => (lb ? { ...lb, index: (lb.index + 1) % len } : null));
            }
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightbox]);

    const hasModels = models && models.length > 0;

    const tabConfig = [
        { id: 'overview', icon: Info, label: 'Overview' },
        { id: 'models', icon: List, label: 'List of Products' },
        { id: 'guide', icon: BookOpen, label: 'Usage Guide' },
        { id: 'gallery', icon: Images, label: 'View Gallery' },
    ];

    const hasRichOverview =
        (description && description.replace(/<[^>]+>/g, '').trim().length > 0) || (featureChips && featureChips.length > 0);

    const allVideos = uniqueVideoUrls(videoUrls || [], [showcaseVideoUrl], guideInstructionVideoUrls || []);

    const hasGuideContent =
        (guideScope && guideScope.replace(/<[^>]+>/g, '').trim().length > 0) ||
        (guideInstructionImages && guideInstructionImages.length > 0);

    return (
        <div className="relative min-w-0 overflow-x-auto overflow-y-visible rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/30 to-sky-50/20 p-6 md:rounded-[2.5rem] md:p-9">
            <div className="pointer-events-none absolute left-0 top-1/2 h-24 w-1 -translate-y-1/2 rounded-r-full bg-brand-orange/70 md:h-28" />

            <div
                className="mb-8 ml-1 flex gap-2 overflow-x-auto border-b border-slate-100 pb-4 md:ml-3"
                style={SCROLLBAR_HIDE_STYLE}
            >
                {tabConfig.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors md:px-6 md:py-3 md:text-[11px] ${
                                isActive ? 'text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="productTabPill"
                                    className="absolute inset-0 rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                />
                            )}
                            <Icon className={`relative z-10 ${isActive ? 'text-white' : 'text-slate-500'}`} size={16} />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="relative min-h-0 w-full min-w-0 pl-1 md:pl-3"
                >
                    {activeTab === 'overview' && (
                        <div className="w-full min-w-0 max-w-full space-y-10">
                            {hasRichOverview ? (
                                <>
                                    <div className="w-full min-w-0 max-w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
                                        <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-600">Product detail</h3>
                                        <div className="min-w-0 max-w-full text-slate-900">
                                            <RichTextDisplay content={description} />
                                        </div>
                                    </div>
                                    {featureChips?.length > 0 && (
                                        <div className="min-w-0 max-w-full">
                                            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-600">Where it shines</h3>
                                            <div className="flex flex-wrap gap-3">
                                                {featureChips.map((line, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex max-w-full items-start gap-2.5 rounded-2xl border border-brand-blue/20 bg-white px-3 py-2.5 shadow-sm sm:max-w-md"
                                                    >
                                                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
                                                            <Check size={14} strokeWidth={3} aria-hidden />
                                                        </span>
                                                        <p className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900">{line}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-5 py-10 text-center text-sm text-slate-600">
                                    Add a long description in the admin product <strong>Product detail</strong> tab to show the overview here.
                                </p>
                            )}

                            {documents?.length > 0 && (
                                <div>
                                    <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">Downloads</h3>
                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                                        {documents.map((dl, idx) => (
                                            <motion.a
                                                key={idx}
                                                href={dl.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-brand-blue hover:shadow-sm"
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-brand-blue">
                                                        <FileText size={22} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-semibold text-slate-900">{dl.title}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{dl.meta || 'PDF'}</p>
                                                    </div>
                                                </div>
                                                <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white">
                                                    <Download size={12} aria-hidden /> Get
                                                </span>
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'models' && (
                        <div className="w-full min-w-0 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                            {hasModels ? (
                                <table className="w-full min-w-[32rem] border-collapse text-left text-sm md:min-w-0">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                            <th className="px-4 py-4 md:px-6">Product / model</th>
                                            <th className="px-4 py-4 md:px-6">Code</th>
                                            <th className="px-4 py-4 md:px-6">Core feature</th>
                                            <th className="px-4 py-4 md:px-6">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {models.map((model, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/80">
                                                <td className="px-4 py-4 font-semibold text-slate-900 md:px-6">{model.name || '—'}</td>
                                                <td className="px-4 py-4 md:px-6">
                                                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-800">
                                                        {model.model_number || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-slate-800 md:px-6">{model.key_spec || '—'}</td>
                                                <td className="px-4 py-4 text-slate-700 md:px-6">{model.note || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="px-6 py-14 text-center text-sm text-slate-600">
                                    No product variants yet. Add rows in the admin <strong>Product List</strong> tab.
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === 'guide' && (
                        <div className="w-full min-w-0 max-w-full space-y-8">
                            {hasGuideContent ? (
                                <>
                                    {guideScope?.replace(/<[^>]+>/g, '').trim() ? (
                                        <div className="w-full min-w-0 max-w-full rounded-2xl border border-slate-300 bg-white p-5 shadow-md md:p-8">
                                            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-700">Usage guide</h3>
                                            <div className="min-w-0 max-w-full border-t border-slate-100 pt-5 text-slate-900">
                                                <RichTextDisplay content={guideScope} />
                                            </div>
                                        </div>
                                    ) : null}
                                    {guideInstructionImages.length > 0 && (
                                        <div>
                                            <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-500">Instruction images</h3>
                                            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                                {guideImageUrls.map((src, idx) => (
                                                    <li
                                                        key={`${src}-${idx}`}
                                                        className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50"
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setLightbox({ urls: guideImageUrls, index: idx })}
                                                            className="absolute inset-0 z-10 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                                                            aria-label={`View instruction image ${idx + 1} full screen`}
                                                        />
                                                        <Image
                                                            src={src}
                                                            alt=""
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width:768px) 50vw, 25vw"
                                                        />
                                                        <span className="pointer-events-none absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                            <Maximize2 size={12} aria-hidden /> Full screen
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 px-5 py-10 text-center text-sm text-slate-600">
                                    Add usage and scope content in the admin <strong>Guide and Scope</strong> tab.
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="w-full min-w-0 space-y-10">
                            <div>
                                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-600">Images</h3>
                                {galleryImages.length > 0 ? (
                                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                        {galleryImages.map((src, idx) => (
                                            <li
                                                key={`${src}-${idx}`}
                                                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setLightbox({ urls: galleryImages, index: idx })}
                                                    className="absolute inset-0 z-10 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                                                    aria-label={`View image ${idx + 1} full screen`}
                                                />
                                                <Image src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                                                <span className="pointer-events-none absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Maximize2 size={12} aria-hidden /> Full screen
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-10 text-center text-sm text-slate-600">
                                        No images uploaded for this product.
                                    </p>
                                )}
                            </div>

                            <div>
                                <h3 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                    <Play size={14} className="text-red-600" aria-hidden />
                                    Videos
                                </h3>
                                {allVideos.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {allVideos.map((url, idx) => (
                                            <YouTubeVideoCard key={`${url}-${idx}`} url={url} idx={idx} />
                                        ))}
                                    </div>
                                ) : (
                                    <p className="rounded-2xl border border-dashed border-slate-200 bg-white/80 py-10 text-center text-sm text-slate-600">
                                        No videos linked. Add URLs in admin (product videos, showcase, or guide videos).
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {portalReady &&
                lightbox &&
                lightbox.urls[lightbox.index] &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[200] flex flex-col bg-black/95 p-3 sm:p-6"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image full screen"
                        onClick={() => setLightbox(null)}
                    >
                        <div
                            className="flex shrink-0 items-center justify-between gap-3 pb-3 text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="truncate text-sm font-semibold text-white/90">
                                Image {lightbox.index + 1} of {lightbox.urls.length}
                            </p>
                            <button
                                type="button"
                                onClick={() => setLightbox(null)}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                                aria-label="Close full screen"
                            >
                                <X size={22} aria-hidden />
                            </button>
                        </div>
                        <div
                            className="relative flex min-h-0 flex-1 items-center justify-center px-2"
                            onClick={() => setLightbox(null)}
                        >
                            {lightbox.urls.length > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const len = lightbox.urls.length;
                                        setLightbox((lb) =>
                                            lb ? { ...lb, index: (lb.index + len - 1) % len } : null
                                        );
                                    }}
                                    className="absolute left-1 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-4"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={28} aria-hidden />
                                </button>
                            )}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={lightbox.urls[lightbox.index]}
                                alt=""
                                className="relative z-[1] max-h-[min(85vh,100%)] max-w-full object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                            {lightbox.urls.length > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const len = lightbox.urls.length;
                                        setLightbox((lb) =>
                                            lb ? { ...lb, index: (lb.index + 1) % len } : null
                                        );
                                    }}
                                    className="absolute right-1 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-4"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={28} aria-hidden />
                                </button>
                            )}
                        </div>
                        <p
                            className="shrink-0 pt-3 text-center text-xs text-white/60"
                            onClick={(e) => e.stopPropagation()}
                        >Press Esc to close · Click outside image area or use arrows</p>
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default ProductTabs;




