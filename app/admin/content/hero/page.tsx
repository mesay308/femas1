'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Edit2,
    Loader2,
    Check,
    X,
    GripVertical,
    Layout as LayoutIcon,
    ChevronRight,
    Upload,
    Eye,
} from 'lucide-react';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';
import MediaPicker from '@/components/admin/MediaPicker';

type TrustBadge = {
    badge_id: string;
    slide_id: string;
    label: string;
    icon_url: string | null;
    display_order: number;
    is_active: boolean | number;
};

type HeroSlide = {
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
    display_order: number;
    is_active: boolean | number;
    trust_badges?: TrustBadge[];
};

type DraftBadge = {
    badge_id?: string;
    label: string;
    icon_url: string | null;
    icon_file?: File | null;
    icon_preview?: string | null;
    is_active: boolean;
    display_order: number;
    _delete?: boolean;
};

type FormState = {
    page_slug: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    image_side: 'left' | 'right';
    content_ratio: '40_60' | '50_50' | '60_40';
    theme: 'light' | 'dark';
    display_order: number;
    is_active: boolean;
    image: File | null;
    image_url: string;
    badges: DraftBadge[];
};

const DEFAULT_PAGE_TABS: { slug: string; label: string }[] = [
    { slug: 'home', label: 'Home' },
    { slug: 'who-we-are', label: 'Who We Are' },
    { slug: 'contact', label: 'Contact' },
];

const RATIO_LABELS: Record<FormState['content_ratio'], string> = {
    '40_60': '40 / 60',
    '50_50': '50 / 50',
    '60_40': '60 / 40',
};

const EMPTY_FORM = (pageSlug: string): FormState => ({
    page_slug: pageSlug,
    eyebrow: '',
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    image_side: 'right',
    content_ratio: '40_60',
    theme: 'dark',
    display_order: 0,
    is_active: true,
    image: null,
    image_url: '',
    badges: [],
});

export default function HeroManagerPage() {
    const [activePage, setActivePage] = useState<string>('home');
    const [pageTabs, setPageTabs] = useState(DEFAULT_PAGE_TABS);
    const [showAddPage, setShowAddPage] = useState(false);
    const [newPageSlug, setNewPageSlug] = useState('');

    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [formData, setFormData] = useState<FormState>(EMPTY_FORM('home'));
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal UI states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

    const fetchSlides = useCallback(async (page: string) => {
        setIsLoading(true);
        try {
            const res = await api.get('/content/hero', { params: { page, includeInactive: true } });
            setSlides(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('[hero] fetchSlides', err);
            setSlides([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSlides(activePage);
    }, [activePage, fetchSlides]);

    const resetForm = useCallback(() => {
        setEditingSlide(null);
        setFormData(EMPTY_FORM(activePage));
        setPreviewUrl(null);
        setIsFormOpen(false);
    }, [activePage]);

    useEffect(() => {
        // When the page tab changes, reset to a fresh form keyed to that slug.
        resetForm();
    }, [activePage, resetForm]);

    const handleEdit = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setFormData({
            page_slug: slide.page_slug || activePage,
            eyebrow: slide.eyebrow || '',
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            cta_text: slide.cta_text || '',
            cta_link: slide.cta_link || '',
            image_side: slide.image_side || 'right',
            content_ratio: slide.content_ratio || '40_60',
            theme: slide.theme || 'dark',
            display_order: slide.display_order ?? 0,
            is_active: !!slide.is_active,
            image: null,
            image_url: slide.image_url || '',
            badges: (slide.trust_badges || []).map(b => ({
                badge_id: b.badge_id,
                label: b.label,
                icon_url: b.icon_url,
                icon_file: null,
                icon_preview: null,
                is_active: !!b.is_active,
                display_order: b.display_order ?? 0,
            })),
        });
        setPreviewUrl(slide.image_url ? resolveImageUrl(slide.image_url) : null);
        setIsFormOpen(true);
    };

    const handleDelete = async (slide: HeroSlide) => {
        if (!window.confirm(`Delete hero "${slide.title || slide.slide_id}"?`)) return;
        try {
            await api.delete(`/content/hero/${slide.slide_id}`);
            if (editingSlide?.slide_id === slide.slide_id) resetForm();
            fetchSlides(activePage);
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const buildSlidePayload = (state: FormState): FormData => {
        const data = new FormData();
        data.append('page_slug', state.page_slug);
        data.append('eyebrow', state.eyebrow);
        data.append('title', state.title);
        data.append('subtitle', state.subtitle);
        data.append('cta_text', state.cta_text);
        data.append('cta_link', state.cta_link);
        data.append('image_side', state.image_side);
        data.append('content_ratio', state.content_ratio);
        data.append('theme', state.theme);
        data.append('display_order', String(state.display_order || 0));
        data.append('is_active', state.is_active ? 'true' : 'false');
        if (state.image) {
            data.append('image', state.image);
        } else if (state.image_url) {
            data.append('image_url', state.image_url);
        }
        return data;
    };

    const syncBadges = async (slideId: string, badges: DraftBadge[]) => {
        for (const [idx, badge] of badges.entries()) {
            if (badge._delete && badge.badge_id) {
                await api.delete(`/content/hero/trust-badges/${badge.badge_id}`);
                continue;
            }
            if (badge._delete) continue; // unsaved new row, just skip

            const data = new FormData();
            data.append('label', badge.label);
            data.append('display_order', String(idx));
            data.append('is_active', badge.is_active ? 'true' : 'false');
            if (badge.icon_file) data.append('icon', badge.icon_file);

            if (badge.badge_id) {
                await api.put(`/content/hero/trust-badges/${badge.badge_id}`, data);
            } else if (badge.label.trim()) {
                await api.post(`/content/hero/${slideId}/trust-badges`, data);
            }
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim() && !editingSlide) {
            alert('Headline is required for a new hero.');
            return;
        }
        setIsSaving(true);
        try {
            const payload = buildSlidePayload(formData);
            let slideId: string;
            if (editingSlide) {
                const res = await api.put(`/content/hero/${editingSlide.slide_id}`, payload);
                slideId = res.data?.slide_id || editingSlide.slide_id;
            } else {
                const res = await api.post('/content/hero', payload);
                slideId = res.data?.slide_id;
            }

            if (slideId) {
                await syncBadges(slideId, formData.badges);
            }

            await fetchSlides(activePage);
            resetForm();
        } catch (err) {
            console.error('[hero] save error', err);
            alert('Failed to save hero');
        } finally {
            setIsSaving(false);
        }
    };

    const addPageTab = () => {
        const slug = newPageSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        if (!slug) return;
        if (!pageTabs.some(t => t.slug === slug)) {
            setPageTabs([...pageTabs, { slug, label: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }]);
        }
        setActivePage(slug);
        setNewPageSlug('');
        setShowAddPage(false);
    };

    const addBadgeRow = () => {
        setFormData(s => ({
            ...s,
            badges: [
                ...s.badges,
                {
                    label: '',
                    icon_url: null,
                    icon_file: null,
                    icon_preview: null,
                    is_active: true,
                    display_order: s.badges.length,
                },
            ],
        }));
    };

    const updateBadge = (idx: number, patch: Partial<DraftBadge>) => {
        setFormData(s => ({
            ...s,
            badges: s.badges.map((b, i) => (i === idx ? { ...b, ...patch } : b)),
        }));
    };

    const removeBadge = (idx: number) => {
        setFormData(s => ({
            ...s,
            badges: s.badges
                .map((b, i) => (i === idx ? { ...b, _delete: true } : b))
                // brand-new (no badge_id) rows can be removed outright
                .filter((b, i) => !(i === idx && !b.badge_id)),
        }));
    };

    const moveBadge = (idx: number, dir: -1 | 1) => {
        setFormData(s => {
            const next = [...s.badges];
            const target = idx + dir;
            if (target < 0 || target >= next.length) return s;
            [next[idx], next[target]] = [next[target], next[idx]];
            return { ...s, badges: next };
        });
    };

    const handleMediaSelect = (asset: any) => {
        if (asset && asset.path) {
            setFormData(s => ({
                ...s,
                image_url: asset.path,
                image: null,
            }));
            setPreviewUrl(resolveImageUrl(asset.path));
        }
    };

    const visibleBadges = useMemo(() => formData.badges.filter(b => !b._delete), [formData.badges]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {/* Header section with breadcrumbs and Add Slide button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <Link href="/admin" className="hover:text-brand-blue transition-colors">
                            Dashboard
                        </Link>
                        <ChevronRight size={12} className="text-slate-400" />
                        <span className="text-slate-600">Content</span>
                        <ChevronRight size={12} className="text-slate-400" />
                        <span className="text-brand-blue">Hero Sections</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Hero Sections</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Configure page-specific hero layouts with customizable ratios, alignment themes, and trust badge strips.
                    </p>
                </div>
                <div>
                    <button
                        onClick={() => {
                            resetForm();
                            setIsFormOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus size={18} />
                        <span>Add Hero Slide</span>
                    </button>
                </div>
            </div>

            {/* Page tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-8">
                <div className="flex flex-wrap gap-2">
                    {pageTabs.map(tab => {
                        const active = tab.slug === activePage;
                        return (
                            <button
                                key={tab.slug}
                                type="button"
                                onClick={() => setActivePage(tab.slug)}
                                className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                                    active ? 'text-brand-blue' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="heroPageTabBg"
                                        className="absolute inset-0 bg-brand-blue/10 rounded-xl"
                                        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {tab.label}
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/50 font-extrabold text-slate-500 uppercase">
                                        {tab.slug}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                    {showAddPage ? (
                        <div className="flex items-center gap-2 ml-2">
                            <input
                                autoFocus
                                value={newPageSlug}
                                onChange={e => setNewPageSlug(e.target.value)}
                                placeholder="page-slug"
                                className="px-3 py-1.5 rounded-xl border border-brand-blue text-xs font-bold outline-none"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') addPageTab();
                                    if (e.key === 'Escape') {
                                        setShowAddPage(false);
                                        setNewPageSlug('');
                                    }
                                }}
                            />
                            <button type="button" onClick={addPageTab} className="p-1.5 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90">
                                <Check size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddPage(false);
                                    setNewPageSlug('');
                                }}
                                className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"
                                aria-label="Discard"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAddPage(true)}
                            className="px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-bold text-slate-500 hover:border-brand-blue hover:text-brand-blue inline-flex items-center gap-1.5 transition-colors"
                        >
                            <Plus size={14} /> Add page
                        </button>
                    )}
                </div>
            </div>

            {/* Main Full-Width Content View */}
            <div className="space-y-6">
                {isLoading ? (
                    <div className="py-32 text-center">
                        <Loader2 className="animate-spin text-brand-blue inline-block" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-4">Loading hero slides...</p>
                    </div>
                ) : slides.length === 0 ? (
                    <div className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 py-32 text-center">
                        <ImageIcon className="text-slate-300 mx-auto mb-4" size={56} />
                        <h3 className="text-lg font-bold text-slate-700">No slides configured</h3>
                        <p className="text-slate-400 font-medium text-sm mt-1 max-w-md mx-auto">
                            There are currently no hero sliders defined for the &quot;{activePage}&quot; page. Create a slide to display custom content.
                        </p>
                        <button
                            onClick={() => {
                                resetForm();
                                setIsFormOpen(true);
                            }}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue/90 transition-colors"
                        >
                            <Plus size={16} /> Create First Slide
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {slides.map(slide => (
                            <motion.div
                                key={slide.slide_id}
                                layout
                                className="bg-white rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 flex flex-col overflow-hidden group"
                            >
                                {/* Thumbnail preview */}
                                <div className="relative aspect-[21/9] bg-slate-900 overflow-hidden flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={resolveImageUrl(slide.image_url)}
                                        alt=""
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {/* Badge Overlays */}
                                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                            slide.is_active 
                                                ? 'bg-emerald-500 text-white' 
                                                : 'bg-slate-700 text-slate-200'
                                        }`}>
                                            {slide.is_active ? 'Active' : 'Draft'}
                                        </span>
                                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/60 text-white backdrop-blur-md">
                                            Order: {slide.display_order}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                                        <button
                                            onClick={() => handleEdit(slide)}
                                            className="p-2 bg-white/95 hover:bg-white text-slate-700 hover:text-brand-blue rounded-xl shadow-md transition-colors"
                                            aria-label="Edit Slide"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(slide)}
                                            className="p-2 bg-white/95 hover:bg-red-50 text-slate-700 hover:text-red-600 rounded-xl shadow-md transition-colors"
                                            aria-label="Delete Slide"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5">
                                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-black/40 text-slate-200 backdrop-blur-sm border border-white/10">
                                            Ratio: {RATIO_LABELS[slide.content_ratio] || slide.content_ratio}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-black/40 text-slate-200 backdrop-blur-sm border border-white/10">
                                            Side: {slide.image_side}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-black/40 text-slate-200 backdrop-blur-sm border border-white/10">
                                            Theme: {slide.theme}
                                        </span>
                                    </div>
                                </div>

                                {/* Slide Content */}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        {slide.eyebrow && (
                                            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-brand-blue mb-1">
                                                {slide.eyebrow}
                                            </span>
                                        )}
                                        <h3 className="font-extrabold text-slate-900 text-xl leading-snug">
                                            {slide.title || <span className="text-slate-300 italic">(no title defined)</span>}
                                        </h3>
                                        {slide.subtitle && (
                                            <p className="text-sm text-slate-400 font-medium line-clamp-2 mt-2 leading-relaxed">
                                                {slide.subtitle}
                                            </p>
                                        )}

                                        {/* CTA Info */}
                                        {(slide.cta_text || slide.cta_link) && (
                                            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-600 font-extrabold uppercase text-[10px]">CTA</span>
                                                <span className="text-slate-700">{slide.cta_text || 'Button'}</span>
                                                <span className="text-slate-300">→</span>
                                                <span className="text-slate-400 font-mono font-medium truncate max-w-[150px]">{slide.cta_link || '#'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Trust Badges Strip Preview */}
                                    {slide.trust_badges && slide.trust_badges.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                                                Trust Badges Strip ({slide.trust_badges.length})
                                            </span>
                                            <div className="flex flex-wrap gap-2">
                                                {slide.trust_badges
                                                    .map(badge => {
                                                        const bIcon = badge.icon_url ? resolveImageUrl(badge.icon_url) : null;
                                                        const active = !!badge.is_active;
                                                        return (
                                                            <div
                                                                key={badge.badge_id}
                                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${
                                                                    active 
                                                                        ? 'bg-slate-50 border-slate-100 text-slate-600' 
                                                                        : 'bg-slate-50/40 border-slate-100/50 text-slate-400 line-through opacity-60'
                                                                }`}
                                                            >
                                                                {bIcon && (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={bIcon} alt="" className="size-4 object-contain rounded-md" />
                                                                )}
                                                                <span>{badge.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Elegant Pop-up Form Modal */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                            onClick={resetForm}
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col my-auto overflow-hidden max-h-[90vh] z-10"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                        {editingSlide ? 'Edit Hero Slide' : 'Create New Hero Slide'}
                                    </h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                                        Configuring for Page:{' '}
                                        <span className="text-brand-blue font-mono">{formData.page_slug}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Content & Details */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-blue border-b border-slate-100 pb-2">
                                        Content Details
                                    </h3>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                                            Page Slug (Route)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.page_slug}
                                            onChange={e => setFormData({ ...formData, page_slug: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all font-mono text-sm font-bold text-slate-700"
                                            placeholder="home"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                                            Eyebrow Header
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.eyebrow}
                                            onChange={e => setFormData({ ...formData, eyebrow: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm font-bold text-slate-700"
                                            placeholder="100% Turkish Technology"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                                            Headline / Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm font-extrabold text-slate-800"
                                            placeholder="Elevating Your Cooking Experience"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                                            Subtext / Description
                                        </label>
                                        <textarea
                                            value={formData.subtitle}
                                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm font-medium text-slate-600 h-28 resize-none"
                                            placeholder="Featuring advanced Turkish engineering, our freestanding stoves and round ovens elevate your home cooking experience."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                                                CTA Button Label
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.cta_text}
                                                onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                                                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm font-bold text-slate-700"
                                                placeholder="Shop Catalog"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                                                CTA Route / Link
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.cta_link}
                                                onChange={e => setFormData({ ...formData, cta_link: e.target.value })}
                                                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm font-bold text-slate-700"
                                                placeholder="/shop"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5">
                                                Display Order
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.display_order}
                                                onChange={e =>
                                                    setFormData({ ...formData, display_order: parseInt(e.target.value || '0', 10) })
                                                }
                                                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm font-bold text-slate-700"
                                            />
                                        </div>
                                        <div className="flex items-center pl-4 mt-6">
                                            <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                                    className="size-5 accent-brand-blue cursor-pointer rounded"
                                                />
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800 block">Active & Published</span>
                                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Visible on frontend</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Layout, Media & Trust Badges */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-blue border-b border-slate-100 pb-2">
                                        Layout & Media Settings
                                    </h3>

                                    {/* Custom Visual Layout Controls */}
                                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                                        <div>
                                            <span className="block text-[10px] font-extrabold uppercase text-slate-400 mb-2 tracking-wider">
                                                Image Side Orientation
                                            </span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(['left', 'right'] as const).map(side => (
                                                    <button
                                                        key={side}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, image_side: side })}
                                                        className={`py-2 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                                                            formData.image_side === side
                                                                ? 'bg-brand-blue text-white shadow-sm border-transparent'
                                                                : 'bg-white text-slate-500 border-slate-200 hover:border-brand-blue'
                                                        }`}
                                                    >
                                                        <span>Image on {side}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="block text-[10px] font-extrabold uppercase text-slate-400 mb-2 tracking-wider">
                                                    Content Ratio Split
                                                </span>
                                                <div className="grid grid-cols-3 gap-1">
                                                    {(Object.keys(RATIO_LABELS) as Array<keyof typeof RATIO_LABELS>).map(r => (
                                                        <button
                                                            key={r}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, content_ratio: r })}
                                                            className={`py-2 rounded-xl text-[10px] font-extrabold transition-all border ${
                                                                formData.content_ratio === r
                                                                    ? 'bg-brand-blue text-white shadow-sm border-transparent'
                                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-brand-blue'
                                                            }`}
                                                        >
                                                            {RATIO_LABELS[r]}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-extrabold uppercase text-slate-400 mb-2 tracking-wider">
                                                    Styling Theme
                                                </span>
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    {(['light', 'dark'] as const).map(t => (
                                                        <button
                                                            key={t}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, theme: t })}
                                                            className={`py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all border ${
                                                                formData.theme === t
                                                                    ? 'bg-brand-blue text-white shadow-sm border-transparent'
                                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-brand-blue'
                                                            }`}
                                                        >
                                                            {t}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CORE ELEMENT: Hero Image Selector with Media Gallery */}
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-400 mb-2">
                                            Hero Presentation Image
                                        </label>
                                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-4 space-y-4">
                                            {/* Preview window */}
                                            <div className="relative aspect-[16/8] rounded-2xl overflow-hidden bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center">
                                                {previewUrl ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                                                        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/60 text-white text-[10px] font-bold py-1 px-3.5 rounded-lg truncate backdrop-blur-sm">
                                                            {formData.image
                                                                ? `Uploaded: ${formData.image.name}`
                                                                : `Source Path: ${formData.image_url}`}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center">
                                                        <ImageIcon size={32} className="text-slate-400 mx-auto mb-1" />
                                                        <span className="text-[11px] font-bold text-slate-400 block uppercase">No Image Selected</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Media picker action buttons */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsMediaPickerOpen(true)}
                                                    className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange rounded-xl font-bold text-xs transition-colors"
                                                >
                                                    📂 Select from Gallery
                                                </button>
                                                <label className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors cursor-pointer">
                                                    <Upload size={14} />
                                                    <span>📤 Upload New</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={e => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setFormData({ ...formData, image: file, image_url: '' });
                                                                setPreviewUrl(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trust Badges builder */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[11px] font-black uppercase text-slate-400">
                                                Trust Badge Ribbon
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addBadgeRow}
                                                className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-brand-blue hover:underline"
                                            >
                                                <Plus size={12} /> Add Badge
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                            {visibleBadges.length === 0 ? (
                                                <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                        No trust badges yet
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                                        Add badge features like "Turkish Engineering" or "Flame Failure Safety".
                                                    </p>
                                                </div>
                                            ) : (
                                                formData.badges.map((badge, idx) => {
                                                    if (badge._delete) return null;
                                                    const iconSrc =
                                                        badge.icon_preview ||
                                                        (badge.icon_url ? resolveImageUrl(badge.icon_url) : null);
                                                    return (
                                                        <div
                                                            key={badge.badge_id || `new-${idx}`}
                                                            className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex items-center gap-2 transition-colors"
                                                        >
                                                            <div className="flex flex-col gap-1 text-slate-400 flex-shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveBadge(idx, -1)}
                                                                    className="hover:text-brand-blue disabled:opacity-30"
                                                                    disabled={idx === 0}
                                                                    aria-label="Move up"
                                                                >
                                                                    <GripVertical size={14} />
                                                                </button>
                                                            </div>
                                                            
                                                            <label className="size-9 rounded-lg bg-white overflow-hidden flex items-center justify-center cursor-pointer flex-shrink-0 border border-slate-200 shadow-sm hover:border-brand-blue transition-colors relative group">
                                                                {iconSrc ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={iconSrc} alt="" className="size-full object-cover" />
                                                                ) : (
                                                                    <ImageIcon size={14} className="text-slate-400" />
                                                                )}
                                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                    <Upload size={10} className="text-white" />
                                                                </div>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    onChange={e => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            updateBadge(idx, {
                                                                                icon_file: file,
                                                                                icon_preview: URL.createObjectURL(file),
                                                                            });
                                                                        }
                                                                    }}
                                                                />
                                                            </label>

                                                            <input
                                                                type="text"
                                                                value={badge.label}
                                                                placeholder="Badge title (e.g. Eco-Friendly)"
                                                                onChange={e => updateBadge(idx, { label: e.target.value })}
                                                                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold outline-none focus:border-brand-blue text-slate-700"
                                                            />

                                                            <label className="inline-flex items-center gap-1 cursor-pointer flex-shrink-0">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={badge.is_active}
                                                                    onChange={e => updateBadge(idx, { is_active: e.target.checked })}
                                                                    className="size-4 accent-brand-blue cursor-pointer rounded"
                                                                />
                                                                <span className="text-[10px] font-extrabold uppercase text-slate-400">Show</span>
                                                            </label>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeBadge(idx)}
                                                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                                                aria-label="Remove"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 flex items-center justify-end bg-slate-50/50 gap-4 sticky bottom-0 z-20">
                                <button
                                    onClick={resetForm}
                                    type="button"
                                    className="px-6 py-2.5 text-slate-500 hover:text-slate-800 font-bold transition-colors text-sm uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-8 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm disabled:opacity-60 transition-colors text-sm uppercase tracking-wider active:scale-[0.98]"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                                    <span>{editingSlide ? 'Save Slide' : 'Create Slide'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Media Library Picker Pop-up */}
            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                selectedId={formData.image_url || null}
            />
        </div>
    );
}
