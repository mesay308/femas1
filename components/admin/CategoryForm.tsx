'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    Upload,
    Info,
    ImageIcon,
    ChevronRight,
    SlidersHorizontal,
    Link as LinkIcon,
    Plus,
    Trash2,
    Sparkles,
    LayoutTemplate,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';
import siteConfig from '@/config/siteConfig';
import MediaPicker from './MediaPicker';

interface CategoryFormProps {
    id?: string;
}

const SEO_LOCATION = 'Addis Ababa, Ethiopia';

const DEFAULT_FEATURES = [
    { title: 'Problem', description: '' },
    { title: 'Femas Solution', description: '' },
    { title: 'Result', description: '' },
];

type HeroConfig = {
    headline: string;
    subheadline: string;
    cta_primary: { label: string; link: string };
    cta_secondary: { label: string; link: string };
    trust_badges: Array<{ label: string; icon_url: string }>;
};

const emptyHero = (): HeroConfig => ({
    headline: '',
    subheadline: '',
    cta_primary: { label: '', link: '' },
    cta_secondary: { label: '', link: '' },
    trust_badges: [],
});

function parseFeaturesFromApi(raw: unknown): { title: string; description: string }[] {
    if (raw == null) return DEFAULT_FEATURES.map((f) => ({ ...f }));
    try {
        const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(p) && p.length > 0) {
            return p.map((row: any) => ({
                title: typeof row?.title === 'string' ? row.title : '',
                description: typeof row?.description === 'string' ? row.description : '',
            }));
        }
    } catch {
        /* ignore */
    }
    return DEFAULT_FEATURES.map((f) => ({ ...f }));
}

function parseHeroFromApi(raw: unknown): HeroConfig {
    const base = emptyHero();
    if (raw == null) return base;
    try {
        const h = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!h || typeof h !== 'object') return base;
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
        return base;
    }
}

function truncateMeta(s: string, max: number) {
    const t = (s || '').trim().replace(/\s+/g, ' ');
    if (t.length <= max) return t;
    return `${t.slice(0, max - 1).trim()}…`;
}

const CategoryForm = ({ id }: CategoryFormProps) => {
    const router = useRouter();
    const isEditMode = Boolean(id);
    const [activeTab, setActiveTab] = useState('basic');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [associatedAttributes, setAssociatedAttributes] = useState<any[]>([]);
    const [pickerTarget, setPickerTarget] = useState<'cover' | { type: 'badge'; index: number } | null>(null);
    const [showAllParents, setShowAllParents] = useState(false);

    const [formData, setFormData] = useState<any>({
        name: '',
        slug: '',
        parent_category_id: '',
        description: '',
        short_description: '',
        meta_title: '',
        meta_description: '',
        is_active: true,
        display_order: 0,
        level: 1,
        features: DEFAULT_FEATURES.map((f) => ({ ...f })),
        hero_config: emptyHero(),
    });

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchDependencies();
        if (id) {
            fetchCategory(id);
        }
    }, [id]);

    const suggestedSeo = useMemo(() => {
        const name = (formData.name || '').trim() || 'Category';
        const summary = (formData.short_description || '').trim();
        const title = `${name} | ${siteConfig.companyName} · ${SEO_LOCATION}`;
        let description: string;
        if (summary) {
            description = `${truncateMeta(summary, 120)} — ${siteConfig.companyName}, ${SEO_LOCATION}.`;
        } else {
            description = `${siteConfig.companyName} ${name}: premium kitchen appliances and custom cabinetry solutions in ${SEO_LOCATION}.`;
        }
        description = truncateMeta(description, 320);
        return { title: truncateMeta(title, 200), description };
    }, [formData.name, formData.short_description]);

    const fetchDependencies = async () => {
        try {
            const res = await api.get('/categories');
            setAllCategories(res.data);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const fetchCategory = async (catId: string) => {
        setIsLoading(true);
        try {
            const res = await api.get('/categories');
            const cat = res.data.find((c: any) => String(c.category_id) === String(catId));
            if (cat) {
                setFormData({
                    name: cat.name || '',
                    slug: cat.slug || '',
                    parent_category_id: cat.parent_category_id || '',
                    description: cat.description || '',
                    short_description: cat.short_description || '',
                    meta_title: cat.meta_title || '',
                    meta_description: cat.meta_description || '',
                    is_active: cat.is_active === 1 || cat.is_active === true,
                    display_order: cat.display_order || 0,
                    level: cat.level || 1,
                    features: parseFeaturesFromApi(cat.features),
                    hero_config: parseHeroFromApi(cat.hero_config),
                });
                if (cat.cover_image_url) {
                    setCoverPreview(resolveImageUrl(cat.cover_image_url));
                    setFormData((prev: any) => ({ ...prev, cover_image_url: cat.cover_image_url }));
                }

                const attrRes = await api.get(`/attributes/by-category/${catId}`);
                setAssociatedAttributes(attrRes.data);
            }
        } catch (err) {
            console.error('Failed to load category', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!formData.name || id) return;
        const generatedSlug = formData.name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
        setFormData((prev: any) => ({ ...prev, slug: generatedSlug }));
    }, [formData.name, id]);

    const handleCoverMediaSelect = (asset: any) => {
        if (!asset || !asset.path) return;
        setCoverImage(null);
        setCoverPreview(resolveImageUrl(asset.path));
        handleInputChange('cover_image_url', asset.path);
    };

    const handleMediaPick = (asset: any) => {
        if (!asset?.path) return;
        if (pickerTarget === 'cover') {
            handleCoverMediaSelect(asset);
        } else if (pickerTarget && typeof pickerTarget === 'object' && pickerTarget.type === 'badge') {
            const idx = pickerTarget.index;
            setFormData((prev: any) => {
                const badges = [...(prev.hero_config?.trust_badges || [])];
                if (!badges[idx]) return prev;
                badges[idx] = { ...badges[idx], icon_url: asset.path };
                return {
                    ...prev,
                    hero_config: { ...prev.hero_config, trust_badges: badges },
                };
            });
        }
        setPickerTarget(null);
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const updateFeature = (index: number, key: 'title' | 'description', value: string) => {
        setFormData((prev: any) => {
            const next = [...(prev.features || [])];
            next[index] = { ...next[index], [key]: value };
            return { ...prev, features: next };
        });
    };

    const addFeature = () => {
        setFormData((prev: any) => ({
            ...prev,
            features: [...(prev.features || []), { title: '', description: '' }],
        }));
    };

    const removeFeature = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            features: (prev.features || []).filter((_: any, i: number) => i !== index),
        }));
    };

    const updateHero = (patch: Partial<HeroConfig>) => {
        setFormData((prev: any) => ({
            ...prev,
            hero_config: { ...emptyHero(), ...prev.hero_config, ...patch },
        }));
    };

    const updateHeroCta = (which: 'cta_primary' | 'cta_secondary', key: 'label' | 'link', value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            hero_config: {
                ...emptyHero(),
                ...prev.hero_config,
                [which]: {
                    ...(prev.hero_config?.[which] || { label: '', link: '' }),
                    [key]: value,
                },
            },
        }));
    };

    const updateTrustBadge = (index: number, key: 'label' | 'icon_url', value: string) => {
        setFormData((prev: any) => {
            const badges = [...(prev.hero_config?.trust_badges || [])];
            badges[index] = { ...badges[index], [key]: value };
            return {
                ...prev,
                hero_config: { ...prev.hero_config, trust_badges: badges },
            };
        });
    };

    const addTrustBadge = () => {
        setFormData((prev: any) => ({
            ...prev,
            hero_config: {
                ...prev.hero_config,
                trust_badges: [...(prev.hero_config?.trust_badges || []), { label: '', icon_url: '' }],
            },
        }));
    };

    const removeTrustBadge = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            hero_config: {
                ...prev.hero_config,
                trust_badges: (prev.hero_config?.trust_badges || []).filter((_: any, i: number) => i !== index),
            },
        }));
    };

    const applySuggestedSeo = () => {
        handleInputChange('meta_title', suggestedSeo.title);
        handleInputChange('meta_description', suggestedSeo.description);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = new FormData();
            const skip = new Set(['features', 'hero_config']);
            Object.keys(formData).forEach((key) => {
                if (skip.has(key)) return;
                const v = formData[key];
                if (v === undefined || v === null) return;
                if (typeof v === 'boolean') {
                    payload.append(key, v ? 'true' : 'false');
                } else {
                    payload.append(key, v as string | Blob);
                }
            });
            payload.append('features', JSON.stringify(formData.features || DEFAULT_FEATURES));
            payload.append('hero_config', JSON.stringify(formData.hero_config || emptyHero()));
            if (coverImage) {
                payload.append('cover_image', coverImage);
            }

            if (isEditMode) {
                await api.put(`/categories/${id}`, payload);
            } else {
                await api.post('/categories', payload);
            }
            router.push('/admin/categories');
        } catch (err: any) {
            console.error('Failed to save category', err);
            alert(err.response?.data?.error || 'Failed to save category');
        } finally {
            setIsSaving(false);
        }
    };

    const availableParents = allCategories.filter((c) => String(c.category_id) !== String(id));

    const tabs = [
        { id: 'basic', label: 'General Info', icon: Info },
        { id: 'features', label: 'Features', icon: Sparkles },
        { id: 'hero', label: 'Hero Section', icon: LayoutTemplate },
        { id: 'media', label: 'Visual Assets', icon: ImageIcon },
        { id: 'seo', label: 'Search Engine (SEO)', icon: LinkIcon },
        { id: 'specs', label: 'Attributes & Specs', icon: SlidersHorizontal },
    ];

    const inputClasses =
        'w-full px-5 py-3.5 rounded-2xl bg-white outline-none shadow-sm transition-all font-medium text-slate-800 placeholder:text-slate-400 admin-input-ring';
    const selectClasses =
        'w-full cursor-pointer appearance-none rounded-2xl border border-slate-200 bg-white px-5 py-3.5 font-bold text-slate-700 shadow-sm outline-none transition-all focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10';
    const labelClasses = 'block text-sm font-bold text-slate-700 mb-2 px-1';

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500 font-medium">Loading category…</div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto w-full max-w-6xl pb-24 font-sans"
        >
            <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin/categories" className="admin-bc-link">
                            Categories
                        </Link>
                        <ChevronRight size={14} className="text-slate-400" />
                        <span className="admin-bc-current">{isEditMode ? 'Edit category' : 'New category'}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                        {isEditMode ? 'Edit category' : 'Add category'}
                    </h1>
                </div>
                <div className="mt-4 flex w-full flex-col gap-4 md:mt-0 md:w-auto md:flex-row md:justify-end">
                    <Link href="/admin/categories" className="admin-cta-neutral flex-1 md:flex-none">
                        Discard
                    </Link>
                    <button type="button" onClick={handleSave} disabled={isSaving} className="admin-cta-primary flex-1 md:flex-none">
                        <Save size={20} aria-hidden />
                        <span>{isSaving ? 'Saving…' : 'Save category'}</span>
                    </button>
                </div>
            </div>

            <div className="min-h-[600px] rounded-[2rem] border border-slate-100 bg-white p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] md:p-10">
                <div className="admin-tab-row">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`admin-tab-trigger ${isActive ? 'admin-tab-trigger-active' : ''}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="categoryFormTabBg"
                                        className="admin-tab-indicator"
                                        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                                    />
                                )}
                                <tab.icon size={20} className={`relative z-10 ${isActive ? 'text-white/90' : 'text-slate-400'}`} />
                                <span className="relative z-10 tracking-wide">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'basic' && (
                        <motion.div
                            key="basic"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-10"
                        >
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div>
                                    <label className={labelClasses}>Category Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className={inputClasses}
                                        placeholder="e.g. Freestanding Stoves"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>URL Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => handleInputChange('slug', e.target.value)}
                                        className={inputClasses}
                                        placeholder="freestanding-stoves"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div>
                                    <label className={labelClasses}>Parent Identity</label>
                                    <div className="group relative">
                                        <select
                                            value={formData.parent_category_id}
                                            onChange={(e) => handleInputChange('parent_category_id', e.target.value)}
                                            className={selectClasses}
                                        >
                                            <option value="">None (Root Node)</option>
                                            {(() => {
                                                const visibleParents = showAllParents
                                                    ? availableParents
                                                    : availableParents.filter(
                                                          (c) =>
                                                              !c.parent_category_id ||
                                                              String(c.category_id) === String(formData.parent_category_id)
                                                      );
                                                return visibleParents.map((cat) => (
                                                    <option key={cat.category_id} value={cat.category_id}>
                                                        {cat.name}
                                                    </option>
                                                ));
                                            })()}
                                        </select>
                                        <ChevronRight
                                            size={18}
                                            className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 transition-colors group-hover:text-brand-blue"
                                        />
                                    </div>
                                    <label className="mt-2 flex w-full cursor-pointer items-center justify-end gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-brand-blue">
                                        <input
                                            type="checkbox"
                                            checked={!showAllParents}
                                            onChange={(e) => setShowAllParents(!e.target.checked)}
                                            className="h-3.5 w-3.5 rounded border-slate-300 accent-brand-blue focus:ring-brand-blue"
                                        />
                                        Show top-level only
                                    </label>
                                </div>
                                <div>
                                    <label className={labelClasses}>Priority Order</label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => handleInputChange('display_order', parseInt(e.target.value, 10))}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-8 rounded-3xl border border-slate-100 px-6 py-8 md:flex-row">
                                <label className="group flex cursor-pointer items-center gap-4">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="h-6 w-12 rounded-full bg-slate-200 transition-all duration-300 peer-checked:bg-brand-blue peer-focus:outline-none"></div>
                                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 peer-checked:translate-x-6"></div>
                                    </div>
                                    <span className="text-base font-bold text-slate-700 transition-colors group-hover:text-brand-blue">
                                        Publicly Active
                                    </span>
                                </label>
                            </div>

                            <div className="space-y-6 border-t border-slate-100 pt-4">
                                <div>
                                    <label className={labelClasses}>Executive Summary</label>
                                    <textarea
                                        value={formData.short_description}
                                        onChange={(e) => handleInputChange('short_description', e.target.value)}
                                        className={`${inputClasses} resize-none`}
                                        rows={3}
                                        placeholder="Short summary used for SEO suggestions and category intros…"
                                    />
                                    <p className="mt-2 px-1 text-xs font-medium text-slate-400">
                                        Used for suggested meta description and public category hero fallback.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'features' && (
                        <motion.div
                            key="features"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <p className="text-sm font-medium text-slate-500">
                                Highlight how this category solves customer needs — same layout as “Why us” on Company Profile.
                            </p>
                            <button type="button" onClick={addFeature} className="admin-cta-secondary font-black uppercase tracking-widest">
                                <Plus size={18} aria-hidden /> Add feature block
                            </button>
                            <div className="space-y-6">
                                {(formData.features || []).map((item: any, i: number) => (
                                    <div
                                        key={i}
                                        className="relative rounded-[2rem] border border-slate-100 bg-slate-50/80 p-8 transition-all hover:bg-white hover:shadow-xl"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(i)}
                                            className="absolute right-6 top-6 text-slate-300 transition-colors hover:text-red-500"
                                            title="Remove"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={item.title}
                                            onChange={(e) => updateFeature(i, 'title', e.target.value)}
                                            className="mb-4 w-full border-none bg-transparent font-black text-xl text-slate-900 outline-none placeholder:text-slate-300 focus:text-brand-blue"
                                        />
                                        <textarea
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={(e) => updateFeature(i, 'description', e.target.value)}
                                            className="w-full resize-none border-none bg-transparent text-sm font-medium leading-relaxed text-slate-600 outline-none placeholder:text-slate-300"
                                            rows={4}
                                        />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'hero' && (
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-4xl space-y-8"
                        >
                            <p className="text-sm font-medium text-slate-500">
                                Overrides public category hero copy. Leave blank to fall back to category name / summary. The large photo on the
                                public page uses the <strong className="text-slate-700">category profile image</strong> from the Visual Assets tab.
                            </p>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Headline</label>
                                    <input
                                        type="text"
                                        value={formData.hero_config?.headline || ''}
                                        onChange={(e) => updateHero({ headline: e.target.value })}
                                        className={inputClasses}
                                        placeholder="e.g. Advanced stoves built for Ethiopian cooking"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Subheadline</label>
                                    <textarea
                                        value={formData.hero_config?.subheadline || ''}
                                        onChange={(e) => updateHero({ subheadline: e.target.value })}
                                        className={`${inputClasses} resize-none`}
                                        rows={2}
                                        placeholder="Supporting line under the headline"
                                    />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Primary CTA</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClasses}>Label</label>
                                        <input
                                            type="text"
                                            value={formData.hero_config?.cta_primary?.label || ''}
                                            onChange={(e) => updateHeroCta('cta_primary', 'label', e.target.value)}
                                            className={inputClasses}
                                            placeholder="e.g. Explore products"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Link</label>
                                        <input
                                            type="text"
                                            value={formData.hero_config?.cta_primary?.link || ''}
                                            onChange={(e) => updateHeroCta('cta_primary', 'link', e.target.value)}
                                            className={inputClasses}
                                            placeholder="#category-products or /contact"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                                <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">Secondary CTA</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className={labelClasses}>Label</label>
                                        <input
                                            type="text"
                                            value={formData.hero_config?.cta_secondary?.label || ''}
                                            onChange={(e) => updateHeroCta('cta_secondary', 'label', e.target.value)}
                                            className={inputClasses}
                                            placeholder="e.g. Bulk order inquiry"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Link</label>
                                        <input
                                            type="text"
                                            value={formData.hero_config?.cta_secondary?.link || ''}
                                            onChange={(e) => updateHeroCta('cta_secondary', 'link', e.target.value)}
                                            className={inputClasses}
                                            placeholder="/contact"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                    <label className={labelClasses + ' mb-0'}>Trust badges</label>
                                    <button type="button" onClick={addTrustBadge} className="admin-cta-secondary !py-2 text-xs font-black uppercase tracking-widest">
                                        <Plus size={14} aria-hidden /> Add badge
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {(formData.hero_config?.trust_badges || []).map((badge: any, i: number) => (
                                        <div
                                            key={i}
                                            className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 md:flex-row md:items-end"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <label className={labelClasses}>Label</label>
                                                <input
                                                    type="text"
                                                    value={badge.label}
                                                    onChange={(e) => updateTrustBadge(i, 'label', e.target.value)}
                                                    className={inputClasses}
                                                    placeholder="e.g. Hard-water tested"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-end">
                                                <div className="min-w-0 flex-1">
                                                    <label className={labelClasses}>Icon (library path)</label>
                                                    <input
                                                        type="text"
                                                        value={badge.icon_url || ''}
                                                        onChange={(e) => updateTrustBadge(i, 'icon_url', e.target.value)}
                                                        className={inputClasses}
                                                        placeholder="/uploads/…"
                                                        readOnly
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setPickerTarget({ type: 'badge', index: i })}
                                                    className="admin-cta-neutral shrink-0 whitespace-nowrap !py-3 text-xs"
                                                >
                                                    <ImageIcon size={16} aria-hidden /> Library
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTrustBadge(i)}
                                                    className="shrink-0 rounded-xl p-3 text-slate-300 hover:bg-red-50 hover:text-red-500"
                                                    aria-label="Remove badge"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'media' && (
                        <motion.div
                            key="media"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8">
                                <label className={labelClasses}>Category Profile Image</label>
                                <div className="flex flex-col items-start gap-10 md:flex-row">
                                    {coverPreview && (
                                        <div className="group relative inline-block overflow-hidden rounded-[2.5rem] border-8 border-white bg-slate-100 shadow-2xl">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={coverPreview}
                                                alt=""
                                                className="h-64 w-64 transform object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-1 flex-col gap-4">
                                        <label className="group cursor-pointer rounded-[2.5rem] border-2 border-dashed border-slate-300 bg-white p-16 text-center shadow-sm transition-all duration-500 hover:border-brand-blue hover:bg-brand-blue/5">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setCoverImage(file);
                                                        setCoverPreview(URL.createObjectURL(file));
                                                        handleInputChange('cover_image_url', '');
                                                    }
                                                }}
                                            />
                                            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-blue/10 transition-transform duration-500 group-hover:-translate-y-3">
                                                <Upload
                                                    size={32}
                                                    className="text-slate-400 transition-colors group-hover:text-brand-blue"
                                                    aria-hidden
                                                />
                                            </div>
                                            <p className="text-xl font-extrabold text-slate-800">Upload new cover</p>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setPickerTarget('cover')}
                                            className="group flex w-full items-center justify-center gap-2 rounded-[2.5rem] border-2 border-brand-blue/20 py-5 font-bold text-brand-blue shadow-sm transition-all duration-300 hover:bg-brand-blue hover:text-white"
                                        >
                                            <ImageIcon
                                                size={24}
                                                className="shrink-0 text-brand-blue transition-colors group-hover:text-white"
                                                aria-hidden
                                            />
                                            Choose from Digital Library
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'seo' && (
                        <motion.div
                            key="seo"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="rounded-3xl border border-brand-blue/15 bg-brand-blue/[0.06] p-6">
                                <p className="mb-2 text-xs font-black uppercase tracking-widest text-brand-blue">Suggested from name & summary</p>
                                <p className="mb-4 text-sm font-medium text-slate-600">
                                    Uses category name, executive summary, and location <strong>{SEO_LOCATION}</strong>.
                                </p>
                                <div className="mb-4 rounded-2xl bg-white/80 p-4 text-sm">
                                    <div className="mb-2 font-bold text-slate-800">{suggestedSeo.title}</div>
                                    <div className="text-slate-600">{suggestedSeo.description}</div>
                                </div>
                                <button type="button" onClick={applySuggestedSeo} className="admin-cta-primary">
                                    Apply suggested SEO
                                </button>
                            </div>

                            <div className="max-w-4xl space-y-8">
                                <div>
                                    <label className={labelClasses}>SEO title</label>
                                    <input
                                        type="text"
                                        value={formData.meta_title}
                                        onChange={(e) => handleInputChange('meta_title', e.target.value)}
                                        className={inputClasses}
                                        placeholder="Search engine title…"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Meta description</label>
                                    <textarea
                                        value={formData.meta_description}
                                        onChange={(e) => handleInputChange('meta_description', e.target.value)}
                                        className={`${inputClasses} resize-none`}
                                        rows={4}
                                        placeholder="Search result snippet…"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'specs' && (
                        <motion.div
                            key="specs"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <p className="text-sm font-medium text-slate-500">
                                Specifications linked to this category are managed from{' '}
                                <Link href="/admin/attributes" className="font-bold text-brand-blue underline">
                                    Attributes &amp; specs
                                </Link>
                                .
                            </p>
                            {associatedAttributes.length === 0 ? (
                                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-medium text-slate-400">
                                    No attributes assigned to this category yet.
                                </p>
                            ) : (
                                <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
                                    {associatedAttributes.map((attr: any) => (
                                        <li key={attr.attribute_id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                                            <span className="font-bold text-slate-800">{attr.name}</span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-500">{attr.code}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <MediaPicker
                isOpen={pickerTarget !== null}
                onClose={() => setPickerTarget(null)}
                onSelect={handleMediaPick}
                selectedId={
                    pickerTarget === 'cover'
                        ? formData.cover_image_url
                        : pickerTarget && typeof pickerTarget === 'object' && pickerTarget.type === 'badge'
                          ? formData.hero_config?.trust_badges?.[pickerTarget.index]?.icon_url
                          : undefined
                }
            />
        </motion.div>
    );
};

export default CategoryForm;
