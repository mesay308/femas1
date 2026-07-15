'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, Info, List, ImageIcon, Sparkles, FileText, Plus, Trash2, ChevronRight, Images, ArrowUp, ArrowDown, BookOpen, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';
import siteConfig from '@/config/siteConfig';
import RichTextEditor from './RichTextEditor';
import MediaPicker from './MediaPicker';
import YoutubeUrlField from './YoutubeUrlField';

const BADGE_OPTIONS = ['New Arrival', 'Best Seller', 'Limited Stock', 'Featured', 'Concentrated', 'Hard-Water Hero', 'Eco-Friendly', 'Skin-Friendly'];

function stripHtml(html: string) {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function slugFromProductName(name: string) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function buildSeoSuggestion(name: string, shortDesc: string, htmlDescription: string) {
    const trimmedName = name.trim();
    const n = trimmedName || 'Product';
    const slug = slugFromProductName(n);
    let meta_title = `${n} | ${siteConfig.companyName}`;
    if (meta_title.length > 58) meta_title = `${meta_title.slice(0, 55).trimEnd()}…`;
    const plain = stripHtml(htmlDescription);
    const source = shortDesc.trim() || plain.trim() || n;
    let meta_description = source.replace(/\s+/g, ' ');
    if (meta_description.length > 160) meta_description = `${meta_description.slice(0, 157).trimEnd()}…`;
    return { slug, meta_title, meta_description };
}

function normalizeGalleryUrls(data: unknown): string[] {
    if (!data) return [];
    const raw = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
    return raw.filter((u: unknown): u is string => typeof u === 'string' && u.length > 0);
}

function normalizeGuideVideoUrls(data: unknown): string[] {
    const raw = typeof data === 'string' ? (() => { try { return JSON.parse(data); } catch { return []; } })() : Array.isArray(data) ? data : [];
    const filtered = raw.filter((u: unknown): u is string => typeof u === 'string' && u.trim().length > 0);
    return filtered.length ? filtered : [''];
}

interface ProductFormProps {
    id?: string;
}

const ProductForm = ({ id }: ProductFormProps) => {
    const router = useRouter();
    const isEditMode = Boolean(id);
    const [activeTab, setActiveTab] = useState('basic');
    const [isLoading, setIsLoading] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [availableAttributes, setAvailableAttributes] = useState<any[]>([]);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [mediaPickerConfig, setMediaPickerConfig] = useState<{ type: 'cover' | 'gallery' | 'guide' }>({
        type: 'cover',
    });

    const [formData, setFormData] = useState<any>({
        name: '',
        slug: '',
        sku: '',
        category_id: '',
        brand_id: '',
        base_price: '',
        shortDescription: '',
        description: '',
        guideScope: '',
        guide_instruction_images: [] as string[],
        guide_instruction_video_urls: [''],
        showcase_video_url: '',
        meta_title: '',
        meta_description: '',
        stock_status: 'in_stock',
        is_featured: false,
        is_active: true,
        applications: [],
        badge: [],
        video_urls: [''],
        models: [],
        removed_models: [],
        documents: [],
        gallery_urls: [] as string[],
        models_list_pdf_url: '',
        attributes: {},
        cover_image_url: '',
    });

    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    /** Local files staged for gallery — uploaded on Save (merged with gallery_urls on the server). */
    const [galleryPending, setGalleryPending] = useState<{ tempId: string; file: File; previewUrl: string }[]>([]);
    const [guideImagePending, setGuideImagePending] = useState<{ tempId: string; file: File; previewUrl: string }[]>([]);

    useEffect(() => {
        fetchDependencies();
        if (id) {
            fetchProduct(id);
        }
    }, [id]);

    useEffect(() => {
        const fetchCategoryAttributes = async () => {
            if (!formData.category_id) {
                setAvailableAttributes([]);
                return;
            }
            try {
                const res = await api.get(`/attributes/by-category/${formData.category_id}`);
                setAvailableAttributes(res.data);
            } catch (err) {
                console.error('Failed to load category attributes', err);
                setAvailableAttributes([]);
            }
        };
        fetchCategoryAttributes();
    }, [formData.category_id]);

    const fetchDependencies = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                api.get('/categories'),
                api.get('/brands')
            ]);
            setCategories(catRes.data);
            setBrands(brandRes.data);
        } catch (err) {
            console.error("Failed to load dependencies", err);
        }
    };

    const fetchProduct = async (productId: string) => {
        setIsLoading(true);
        try {
            const res = await api.get(`/products/${productId}`);
            const p = res.data;
            
            const parseJsonSafe = (data: any, fallback: any[] = []) => {
                if (!data) return fallback;
                if (typeof data === 'string') {
                    try { return JSON.parse(data); } catch (e) { return fallback; }
                }
                return data;
            };

            const attrsObj: any = {};
            if (p.attributes) {
                p.attributes.forEach((a: any) => {
                    attrsObj[a.attribute_id] = a.value_text !== null ? a.value_text : (a.value_number !== null ? String(a.value_number) : String(a.value_boolean));
                });
            }

            setFormData({
                name: p.name || '',
                slug: p.slug || '',
                sku: p.sku || '',
                category_id: p.category_id || '',
                brand_id: p.brand_id || '',
                base_price: p.base_price || '',
                shortDescription: p.short_description || '',
                description: p.detailed_description || '',
                guideScope: p.guide_scope || '',
                guide_instruction_images: normalizeGalleryUrls(p.guide_instruction_images),
                guide_instruction_video_urls: normalizeGuideVideoUrls(p.guide_instruction_video_urls),
                showcase_video_url: p.showcase_video_url || '',
                meta_title: p.meta_title || '',
                meta_description: p.meta_description || '',
                stock_status: p.stock_status || 'in_stock',
                is_featured: Boolean(p.is_featured),
                is_active: p.is_active !== undefined ? Boolean(p.is_active) : true,
                applications: parseJsonSafe(p.applications, [] as string[]),
                badge: parseJsonSafe(p.badge, [] as string[]),
                video_urls: parseJsonSafe(p.video_urls, [''] as string[]),
                models: p.models || [],
                removed_models: [],
                documents: parseJsonSafe(p.documents, [] as any[]),
                gallery_urls: normalizeGalleryUrls(p.gallery_images),
                models_list_pdf_url: p.models_list_pdf_url || '',
                attributes: attrsObj,
                cover_image_url: p.cover_image_url || '',
            });

            if (p.cover_image_url) {
                setCoverPreview(resolveImageUrl(p.cover_image_url));
            }
        } catch (err) {
            console.error("Failed to load product", err);
            alert("Failed to load product for editing");
        } finally {
            setIsLoading(false);
        }
    };

    // SEO: draft products get slug + meta placeholders from name/summary unless you overwrite them manually.
    useEffect(() => {
        if (isEditMode) return;
        const nameTrim = (formData.name || '').trim();
        if (!nameTrim) return;
        setFormData((prev: any) => {
            const suggest = buildSeoSuggestion(prev.name || '', prev.shortDescription || '', '');
            let changed = false;
            const next = { ...prev };
            if (!(prev.slug || '').trim()) {
                next.slug = slugFromProductName(prev.name || '');
                changed = true;
            }
            if (!(prev.meta_title || '').trim()) {
                next.meta_title = suggest.meta_title;
                changed = true;
            }
            if (!(prev.meta_description || '').trim()) {
                next.meta_description = suggest.meta_description;
                changed = true;
            }
            return changed ? next : prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only seed empty fields while drafting
    }, [formData.name, formData.shortDescription, isEditMode]);

    const applySuggestedSeo = () => {
        const suggest = buildSeoSuggestion(formData.name || '', formData.shortDescription || '', formData.description || '');
        setFormData((prev: any) => ({
            ...prev,
            slug: suggest.slug || prev.slug,
            meta_title: suggest.meta_title,
            meta_description: suggest.meta_description,
        }));
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleAttributeChange = (attr_id: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            attributes: { ...prev.attributes, [attr_id]: value }
        }));
    };

    const handleMultiSelect = (field: string, value: any) => {
        setFormData((prev: any) => {
            const current = [...prev[field]];
            if (current.includes(value)) {
                return { ...prev, [field]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...current, value] };
            }
        });
    };

    const handleVideoUrlChange = (index: number, value: string) => {
        const newUrls = [...formData.video_urls];
        newUrls[index] = value;
        setFormData((prev: any) => ({ ...prev, video_urls: newUrls }));
    };

    const addVideoUrl = () => {
        setFormData((prev: any) => ({ ...prev, video_urls: [...prev.video_urls, ''] }));
    };

    const removeVideoUrl = (index: number) => {
        const newUrls = [...formData.video_urls];
        newUrls.splice(index, 1);
        if (newUrls.length === 0) newUrls.push('');
        setFormData((prev: any) => ({ ...prev, video_urls: newUrls }));
    };

    const handleModelChange = (index: number, field: string, value: any) => {
        const newModels = [...formData.models];
        newModels[index][field] = value;
        setFormData((prev: any) => ({ ...prev, models: newModels }));
    };

    const addModel = () => {
        setFormData((prev: any) => ({
            ...prev,
            models: [...prev.models, { model_id: `new-${Date.now()}`, name: '', key_spec: '', note: '' }],
        }));
    };

    const removeModel = (index: number) => {
        const modelToRemove = formData.models[index];
        const newModels = [...formData.models];
        newModels.splice(index, 1);

        setFormData((prev: any) => {
            const removed = [...prev.removed_models];
            if (modelToRemove.model_id && !modelToRemove.model_id.startsWith('new-')) {
                removed.push(modelToRemove.model_id);
            }
            return { ...prev, models: newModels, removed_models: removed };
        });
    };

    const handleMediaSelect = (asset: any) => {
        if (!asset) return;
        if (mediaPickerConfig.type === 'cover') {
            const a = asset?.path ? asset : null;
            if (!a?.path) return;
            setCoverImage(null);
            setCoverPreview(resolveImageUrl(a.path));
            handleInputChange('cover_image_url', a.path);
            return;
        }
        const list = Array.isArray(asset) ? asset : [];
        const paths = list.map((a: any) => a?.path).filter(Boolean) as string[];
        if (!paths.length) return;
        if (mediaPickerConfig.type === 'guide') {
            setFormData((prev: any) => {
                const cur = [...(prev.guide_instruction_images || [])];
                const addon = paths.filter((p: string) => !cur.includes(p));
                return { ...prev, guide_instruction_images: [...cur, ...addon] };
            });
            return;
        }
        setFormData((prev: any) => {
            const cur = [...(prev.gallery_urls || [])];
            const addon = paths.filter((p: string) => !cur.includes(p));
            return { ...prev, gallery_urls: [...cur, ...addon] };
        });
    };

    const removeGalleryUrl = (index: number) => {
        setFormData((prev: any) => {
            const arr = [...(prev.gallery_urls || [])];
            arr.splice(index, 1);
            return { ...prev, gallery_urls: arr };
        });
    };

    const moveGalleryUrl = (index: number, delta: number) => {
        setFormData((prev: any) => {
            const arr = [...(prev.gallery_urls || [])];
            const j = index + delta;
            if (j < 0 || j >= arr.length) return prev;
            [arr[index], arr[j]] = [arr[j], arr[index]];
            return { ...prev, gallery_urls: arr };
        });
    };

    const addGalleryFilesFromDisk = (fileList: FileList | null) => {
        if (!fileList?.length) return;
        const imgs = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
        if (!imgs.length) return;
        setGalleryPending((prev) => [
            ...prev,
            ...imgs.map((file) => ({
                tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                file,
                previewUrl: URL.createObjectURL(file),
            })),
        ]);
    };

    const removeGalleryPending = (index: number) => {
        setGalleryPending((prev) => {
            const next = [...prev];
            const [removed] = next.splice(index, 1);
            if (removed) URL.revokeObjectURL(removed.previewUrl);
            return next;
        });
    };

    const removeGuideImageUrl = (index: number) => {
        setFormData((prev: any) => {
            const arr = [...(prev.guide_instruction_images || [])];
            arr.splice(index, 1);
            return { ...prev, guide_instruction_images: arr };
        });
    };

    const moveGuideImageUrl = (index: number, delta: number) => {
        setFormData((prev: any) => {
            const arr = [...(prev.guide_instruction_images || [])];
            const j = index + delta;
            if (j < 0 || j >= arr.length) return prev;
            [arr[index], arr[j]] = [arr[j], arr[index]];
            return { ...prev, guide_instruction_images: arr };
        });
    };

    const addGuideFilesFromDisk = (fileList: FileList | null) => {
        if (!fileList?.length) return;
        const imgs = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
        if (!imgs.length) return;
        setGuideImagePending((prev) => [
            ...prev,
            ...imgs.map((file) => ({
                tempId: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                file,
                previewUrl: URL.createObjectURL(file),
            })),
        ]);
    };

    const removeGuideImagePending = (index: number) => {
        setGuideImagePending((prev) => {
            const next = [...prev];
            const [removed] = next.splice(index, 1);
            if (removed) URL.revokeObjectURL(removed.previewUrl);
            return next;
        });
    };

    const handleGuideVideoUrlChange = (index: number, value: string) => {
        const next = [...formData.guide_instruction_video_urls];
        next[index] = value;
        setFormData((prev: any) => ({ ...prev, guide_instruction_video_urls: next }));
    };

    const addGuideVideoUrl = () => {
        setFormData((prev: any) => ({
            ...prev,
            guide_instruction_video_urls: [...prev.guide_instruction_video_urls, ''],
        }));
    };

    const removeGuideVideoUrl = (index: number) => {
        const next = [...formData.guide_instruction_video_urls];
        next.splice(index, 1);
        setFormData((prev: any) => ({
            ...prev,
            guide_instruction_video_urls: next.length ? next : [''],
        }));
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('sku', formData.sku);
            payload.append('category_id', formData.category_id);
            payload.append('brand_id', formData.brand_id);
            payload.append('base_price', formData.base_price);
            payload.append('short_description', formData.shortDescription);
            payload.append('description', formData.description);
            payload.append('guide_scope', formData.guideScope || '');
            payload.append('guide_instruction_images', JSON.stringify(formData.guide_instruction_images || []));
            payload.append(
                'guide_instruction_video_urls',
                JSON.stringify((formData.guide_instruction_video_urls || []).filter((url: string) => url.trim() !== ''))
            );
            payload.append('showcase_video_url', formData.showcase_video_url || '');
            payload.append('stock_status', formData.stock_status);
            payload.append('is_featured', formData.is_featured.toString());
            payload.append('is_active', formData.is_active.toString());
            payload.append('slug', formData.slug);
            payload.append('meta_title', formData.meta_title);
            payload.append('meta_description', formData.meta_description);

            payload.append('applications', JSON.stringify(formData.applications));
            payload.append('badge', JSON.stringify(formData.badge));
            payload.append('video_urls', JSON.stringify(formData.video_urls.filter((url: string) => url.trim() !== '')));
            payload.append('models', JSON.stringify(formData.models));
            payload.append('removed_models', JSON.stringify(formData.removed_models));
            payload.append('documents', JSON.stringify(formData.documents));
            payload.append('attributes', JSON.stringify(formData.attributes));
            payload.append('gallery_image_urls', JSON.stringify(formData.gallery_urls || []));

            if (formData.cover_image_url && !coverImage) {
                payload.append('cover_image_url', formData.cover_image_url);
            }

            payload.append('models_list_pdf_url', formData.models_list_pdf_url || '');

            if (coverImage) payload.append('cover_image', coverImage);

            galleryPending.forEach(({ file }) => payload.append('gallery_images', file));

            guideImagePending.forEach(({ file }) => payload.append('guide_images', file));

            if (isEditMode) {
                await api.put(`/products/${id}`, payload);
            } else {
                await api.post('/products', payload);
            }

            router.push('/admin/products');
        } catch (err: any) {
            console.error("Failed to save product", err);
            alert(`Failed to save product: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Info },
        { id: 'specs', label: 'Product detail', icon: FileText },
        { id: 'guide', label: 'Guide and Scope', icon: BookOpen },
        { id: 'list', label: 'Product List', icon: List },
        { id: 'media', label: 'Cover & Gallery', icon: ImageIcon },
    ];

    const inputClasses = "w-full px-5 py-3.5 rounded-2xl bg-white outline-none shadow-sm transition-all font-medium text-slate-800 placeholder:text-slate-400 admin-input-ring";
    const selectClasses = "w-full px-5 py-3.5 rounded-2xl bg-white outline-none shadow-sm transition-all appearance-none cursor-pointer border border-slate-200 font-bold text-slate-700 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10";
    const labelClasses = "block text-sm font-bold text-slate-700 mb-2 px-1";
    const specLabelClasses = "block text-xs font-bold text-slate-600 mb-1.5 px-0.5";
    const specInputClasses =
        "w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 font-medium text-slate-800 placeholder:text-slate-400 admin-input-ring";
    const specSelectClasses =
        "w-full px-3 py-2 text-sm rounded-lg bg-white border border-slate-200 outline-none appearance-none cursor-pointer font-semibold text-slate-700 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10";

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full pb-24 max-w-6xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin/products" className="admin-bc-link">Products</Link>
                        <ChevronRight size={14} className="text-slate-400" />
                        <span className="admin-bc-current">{isEditMode ? 'Edit product' : 'New product'}</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                        {isEditMode ? 'Edit product' : 'Add product'}
                    </h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">Configure product specifications, media assets, and marketing metrics.</p>
                </div>
                <div className="mt-4 flex w-full flex-col gap-4 md:mt-0 md:w-auto md:flex-row md:justify-end">
                    <Link href="/admin/products" className="admin-cta-neutral flex-1 md:flex-none">Discard</Link>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        type="button"
                        className="admin-cta-primary flex-1 md:flex-none"
                    >
                        <Save size={20} aria-hidden />
                        <span>{isLoading ? 'Saving…' : 'Save product'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-100 p-6 md:p-10 min-h-[700px]">
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
                                    <motion.div layoutId="productFormTabBg" className="admin-tab-indicator" transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }} />
                                )}
                                <tab.icon size={20} className={`relative z-10 ${isActive ? 'text-white/90' : 'text-slate-400'}`} />
                                <span className="relative z-10 tracking-wide">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'basic' && (
                        <motion.div key="basic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className={labelClasses}>Product Title</label>
                                    <input type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} className={inputClasses} placeholder="e.g. Femaslux 60x60 Freestanding Dual-Fuel Stove" />
                                </div>
                                <div>
                                    <label className={labelClasses}>SKU / Identifier</label>
                                    <input type="text" value={formData.sku} onChange={(e) => handleInputChange('sku', e.target.value)} className={inputClasses} placeholder="e.g. FEMAS-F66-DFS" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className={labelClasses}>Category Architecture</label>
                                    <div className="relative group">
                                        <select value={formData.category_id} onChange={(e) => handleInputChange('category_id', e.target.value)} className={selectClasses}>
                                            <option value="" disabled>Choose Category...</option>
                                            {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}
                                        </select>
                                        <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none group-hover:text-brand-blue transition-colors" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Manufacturer / Brand Profile</label>
                                    <div className="relative group">
                                        <select value={formData.brand_id} onChange={(e) => handleInputChange('brand_id', e.target.value)} className={selectClasses}>
                                            <option value="" disabled>Choose Brand...</option>
                                            {brands.map(b => <option key={b.brand_id} value={b.brand_id}>{b.name}</option>)}
                                        </select>
                                        <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none group-hover:text-brand-blue transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Product Application Scope</label>
                                        <p className="text-sm text-slate-500 mb-4 px-1">Select all suitable applications for this product.</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Cooking', 'Baking', 'Kitchen Cabinetry', 'Custom Fitting', 'Residential', 'Commercial', 'Hospitality', 'Import Materials'].map(opt => {
                                                const isSelected = formData.applications.includes(opt);
                                                return (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => handleMultiSelect('applications', opt)}
                                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${isSelected ? 'bg-brand-blue text-white border-transparent' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white hover:border-brand-blue/30 hover:shadow-md'}`}
                                                    >
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClasses}>Marketing Badges</label>
                                    <p className="text-sm text-slate-500 mb-4 px-1">Highlight product status on standard views.</p>
                                    <div className="flex flex-wrap gap-2">
                                        {BADGE_OPTIONS.map(opt => {
                                            const isSelected = formData.badge.includes(opt);
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => handleMultiSelect('badge', opt)}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm ${isSelected ? 'bg-brand-orange text-white border-transparent' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white hover:border-brand-orange/30 hover:shadow-md'}`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 pt-8">
                                <div>
                                    <label className={labelClasses}>Base Price (Optional)</label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-3.5 text-slate-400 font-bold">{siteConfig.currencyCode}</span>
                                        <input type="number" value={formData.base_price} onChange={(e) => handleInputChange('base_price', e.target.value)} className={`${inputClasses} pl-14`} placeholder="0.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClasses}>Inventory Workflow Status</label>
                                    <div className="relative group">
                                        <select value={formData.stock_status} onChange={(e) => handleInputChange('stock_status', e.target.value)} className={selectClasses}>
                                            <option value="in_stock">In Stock - Full Availability</option>
                                            <option value="low_stock">Low Stock - High Demand</option>
                                            <option value="out_of_stock">Out of Stock - Backordered</option>
                                        </select>
                                        <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none group-hover:text-brand-blue transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-100 flex flex-col md:flex-row gap-8 py-8 px-6 mt-8 rounded-3xl">
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input type="checkbox" checked={formData.is_featured} onChange={(e) => handleInputChange('is_featured', e.target.checked)} className="peer sr-only" />
                                        <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:bg-brand-orange transition-all duration-300"></div>
                                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-6 shadow-sm"></div>
                                    </div>
                                    <span className="text-base font-bold text-slate-700 group-hover:text-brand-orange transition-colors">Featured Product Panel</span>
                                </label>
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input type="checkbox" checked={formData.is_active} onChange={(e) => handleInputChange('is_active', e.target.checked)} className="peer sr-only" />
                                        <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer-checked:bg-brand-blue transition-all duration-300"></div>
                                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-6 shadow-sm"></div>
                                    </div>
                                    <span className="text-base font-bold text-slate-700 group-hover:text-brand-blue transition-colors">Publicly Active</span>
                                </label>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className={labelClasses}>Short Summary <span className="text-slate-400 font-normal ml-2">(Max 2 Lines)</span></label>
                                    <textarea value={formData.shortDescription} onChange={(e) => handleInputChange('shortDescription', e.target.value)} className={`${inputClasses} resize-none`} rows={2} placeholder="Brief elevator pitch..." />
                                </div>
                            </div>

                            {availableAttributes.length > 0 && (
                                <div className="border-t border-slate-100 pt-8 space-y-4">
                                    <h3 className="text-base font-extrabold text-slate-900 px-1">Core Feature/Spec</h3>
                                    <p className="text-xs text-slate-500 px-1 -mt-1 mb-2">Category-linked fields — compact layout for quick entry.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4">
                                        {availableAttributes.map(attr => (
                                            <div key={attr.attribute_id}>
                                                <label className={specLabelClasses}>{attr.name} <span className="text-slate-400 font-normal">{attr.unit ? `(${attr.unit})` : ''}</span></label>
                                                {attr.type === 'boolean' ? (
                                                    <div className="relative group">
                                                        <select value={formData.attributes[attr.attribute_id] || ''} onChange={(e) => handleAttributeChange(attr.attribute_id, e.target.value)} className={`${specSelectClasses} pr-8`}>
                                                            <option value="">Not Specified</option>
                                                            <option value="true">Yes / True</option>
                                                            <option value="false">No / False</option>
                                                        </select>
                                                        <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                                                    </div>
                                                ) : attr.type === 'number' ? (
                                                    <input type="number" step="any" value={formData.attributes[attr.attribute_id] || ''} onChange={(e) => handleAttributeChange(attr.attribute_id, e.target.value)} className={specInputClasses} placeholder="0" />
                                                ) : attr.type === 'select' ? (
                                                    <div className="relative group">
                                                        <select
                                                            value={formData.attributes[attr.attribute_id] || ''}
                                                            onChange={(e) => handleAttributeChange(attr.attribute_id, e.target.value)}
                                                            className={`${specSelectClasses} pr-8`}
                                                        >
                                                            <option value="">Choose…</option>
                                                            {(() => {
                                                                let options = [];
                                                                if (attr.options) {
                                                                    if (Array.isArray(attr.options)) {
                                                                        options = attr.options;
                                                                    } else if (typeof attr.options === 'string') {
                                                                        try { options = JSON.parse(attr.options); } catch (e) { options = []; }
                                                                    }
                                                                }
                                                                return options.map((opt: string) => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ));
                                                            })()}
                                                        </select>
                                                        <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                                                    </div>
                                                ) : (
                                                    <input type="text" value={formData.attributes[attr.attribute_id] || ''} onChange={(e) => handleAttributeChange(attr.attribute_id, e.target.value)} className={specInputClasses} placeholder="Value…" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-slate-100 pt-10 space-y-8">
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 px-1 mb-1">Search optimization</h3>
                                    <p className="text-sm text-slate-500 mb-6 px-1">URL slug, page title, and meta description for search and social previews.</p>
                                </div>
                                <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-50 via-white to-sky-50/60 p-6 md:p-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-violet-600 mb-2">Suggested SEO</p>
                                        <p className="text-slate-700 font-semibold max-w-xl">
                                            We derive a URL slug, page title (~60 chars), and meta description (~160 chars) from the product name, summary, and long description — good defaults for draft products; edits here stay manual until you apply again.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={applySuggestedSeo}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-7 py-3.5 font-bold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-700 shrink-0"
                                    >
                                        <Sparkles size={18} aria-hidden /> Apply SEO suggestions
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div>
                                            <label className={labelClasses}>Product URL Permalink</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xs">/product/</span>
                                                <input type="text" value={formData.slug} onChange={(e) => handleInputChange('slug', e.target.value)} className="w-full pl-24 pr-5 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-medium text-slate-800 shadow-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>
                                                Meta Title <span className="font-normal text-slate-400">({(formData.meta_title || '').length}/60 guideline)</span>
                                            </label>
                                            <input type="text" value={formData.meta_title} onChange={(e) => handleInputChange('meta_title', e.target.value)} className={inputClasses} />
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div>
                                            <label className={labelClasses}>
                                                Meta Description <span className="font-normal text-slate-400">({(formData.meta_description || '').length}/160 guideline)</span>
                                            </label>
                                            <textarea rows={4} value={formData.meta_description} onChange={(e) => handleInputChange('meta_description', e.target.value)} className={`${inputClasses} resize-none`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'specs' && (
                        <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div>
                                <label className={labelClasses}>Extended Product Description</label>
                                <p className="text-sm text-slate-500 mb-4 px-1">Full product narrative with rich formatting. Category field specs live under Basic Info.</p>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(val) => handleInputChange('description', val)}
                                    placeholder="Comprehensive product breakdown with rich formatting..."
                                    editorMinHeight="clamp(22rem, calc(100vh - 17rem), 56rem)"
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'guide' && (
                        <motion.div key="guide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 px-1">Product Guide</h3>
                                <p className="text-sm text-slate-500 mb-4 px-1 mt-1">Describe product usage instruction/guide and application scope.</p>
                                <RichTextEditor
                                    value={formData.guideScope}
                                    onChange={(val) => handleInputChange('guideScope', val)}
                                    placeholder="Usage steps, dilution ratios, safety notes, where the product applies…"
                                    editorMinHeight="clamp(14rem, calc(100vh - 28rem), 36rem)"
                                />
                            </div>

                            <section className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-6 md:p-8 shadow-sm">
                                <h4 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2 px-1">
                                    <Images size={20} className="text-brand-blue shrink-0" aria-hidden /> Instruction images
                                </h4>
                                <p className="text-sm text-slate-500 mb-5 px-1">Photos for how-to diagrams or packaging callouts. Saved with the product.</p>
                                {(formData.guide_instruction_images?.length > 0 || guideImagePending.length > 0) ? (
                                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
                                        {(formData.guide_instruction_images || []).map((urlPath: string, idx: number) => (
                                            <li key={`guide-img-${idx}-${urlPath}`} className="relative group rounded-xl border border-slate-200 overflow-hidden aspect-square bg-slate-50">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={resolveImageUrl(urlPath)} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1.5 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="flex gap-0.5">
                                                        <button
                                                            type="button"
                                                            aria-label="Move earlier"
                                                            onClick={() => moveGuideImageUrl(idx, -1)}
                                                            disabled={idx === 0}
                                                            className="p-1.5 rounded-lg bg-white/95 text-slate-800 disabled:opacity-40"
                                                        >
                                                            <ArrowUp size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            aria-label="Move later"
                                                            onClick={() => moveGuideImageUrl(idx, 1)}
                                                            disabled={idx === formData.guide_instruction_images.length - 1}
                                                            className="p-1.5 rounded-lg bg-white/95 text-slate-800 disabled:opacity-40"
                                                        >
                                                            <ArrowDown size={14} />
                                                        </button>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        aria-label="Remove"
                                                        onClick={() => removeGuideImageUrl(idx)}
                                                        className="p-1.5 rounded-lg bg-white/95 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                        {guideImagePending.map((g, idx) => (
                                            <li key={g.tempId} className="relative rounded-xl border-2 border-dashed border-brand-blue/35 overflow-hidden aspect-square bg-blue-50/40">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={g.previewUrl} alt="" className="w-full h-full object-cover opacity-95" />
                                                <span className="absolute left-1.5 top-1.5 rounded-md bg-brand-blue text-white text-[9px] font-black px-1.5 py-0.5 uppercase">New</span>
                                                <button
                                                    type="button"
                                                    aria-label="Remove staged file"
                                                    onClick={() => removeGuideImagePending(idx)}
                                                    className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-black/55 text-white hover:bg-black/75"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 italic mb-5 px-1">No instruction images yet.</p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <label className="flex-1 cursor-pointer rounded-xl border-2 border-slate-200 hover:border-brand-blue bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 hover:bg-blue-50/50 transition-colors">
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                addGuideFilesFromDisk(e.target.files);
                                                e.target.value = '';
                                            }}
                                        />
                                        <Upload className="inline-block mr-2 text-brand-blue align-middle" size={16} aria-hidden /> Upload images
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMediaPickerConfig({ type: 'guide' });
                                            setIsMediaPickerOpen(true);
                                        }}
                                        className="flex-1 rounded-xl border-2 border-brand-orange/35 bg-orange-50/40 hover:bg-orange-50 px-4 py-3 text-sm font-bold text-slate-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Images size={16} aria-hidden /> Media library
                                    </button>
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
                                <h4 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-2 px-1">
                                    <Video size={20} className="text-red-600 shrink-0" aria-hidden /> Instruction videos (YouTube)
                                </h4>
                                <p className="text-sm text-slate-500 mb-5 px-1">Add one or more links. Thumbnails and titles load from YouTube.</p>
                                <div className="space-y-6">
                                    {formData.guide_instruction_video_urls.map((url: string, idx: number) => (
                                        <div key={`guide-v-${idx}`} className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
                                            <div className="flex-1 min-w-0">
                                                <YoutubeUrlField
                                                    label={formData.guide_instruction_video_urls.length > 1 ? `Video ${idx + 1}` : 'YouTube URL'}
                                                    value={url}
                                                    onChange={(v) => handleGuideVideoUrlChange(idx, v)}
                                                    hint="Paste a watch, Shorts, embed, or youtu.be link."
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeGuideVideoUrl(idx)}
                                                disabled={formData.guide_instruction_video_urls.length === 1 && !url.trim()}
                                                className="shrink-0 self-start p-2.5 text-slate-400 hover:text-brand-orange hover:bg-orange-50 rounded-xl border border-transparent hover:border-orange-100 disabled:opacity-30 disabled:pointer-events-none"
                                                aria-label="Remove video row"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addGuideVideoUrl}
                                        className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/40 transition-colors"
                                    >
                                        <Plus size={18} aria-hidden /> Add another video
                                    </button>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'list' && (
                        <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="overflow-x-auto rounded-[2rem] border border-slate-200 shadow-sm bg-white">
                                <table className="w-full text-left font-sans">
                                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-extrabold tracking-wider border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-5">Product title</th>
                                            <th className="px-6 py-5">Core Feature</th>
                                            <th className="px-6 py-5 text-center w-28">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.models.map((model: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-3 align-top">
                                                    <input
                                                        type="text"
                                                        value={model.name}
                                                        onChange={(e) => handleModelChange(idx, 'name', e.target.value)}
                                                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-sm"
                                                        placeholder="Product title (e.g. 1L Refill)"
                                                    />
                                                </td>
                                                <td className="p-3 align-top">
                                                    <input type="text" value={model.key_spec} onChange={(e) => handleModelChange(idx, 'key_spec', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-sm" placeholder="Core feature / key spec" />
                                                </td>
                                                <td className="p-3 text-center align-middle">
                                                    <button type="button" onClick={() => removeModel(idx)} className="p-2.5 text-slate-400 hover:text-brand-orange hover:bg-orange-50 rounded-xl transition-all duration-300">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" onClick={addModel} className="group relative overflow-hidden flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 text-slate-600 font-bold hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/50 transition-all duration-300">
                                <Plus size={20} className="group-hover:scale-125 transition-transform duration-300" aria-hidden /> Add row
                            </button>
                        </motion.div>
                    )}

                    {activeTab === 'media' && (
                        <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-14">
                            <section className="rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8 shadow-sm">
                                <h3 className="text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                                    <ImageIcon className="text-brand-blue shrink-0" size={22} aria-hidden /> Cover image
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 px-1">Main photo used on listings, cards, and share previews.</p>
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="shrink-0">
                                        <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-slate-200 w-52 h-52 grid place-items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            {coverPreview ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>No cover</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-4 w-full min-w-0">
                                        <label className="cursor-pointer border-2 border-dashed border-slate-300 hover:border-brand-blue rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-white hover:bg-blue-50/40 transition-all duration-300 group shadow-sm">
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
                                                    e.target.value = '';
                                                }}
                                            />
                                            <Upload size={24} className="text-slate-400 group-hover:text-brand-blue mb-3" aria-hidden />
                                            <p className="text-base font-bold text-slate-800">Upload from device</p>
                                            <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP recommended</p>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMediaPickerConfig({ type: 'cover' });
                                                setIsMediaPickerOpen(true);
                                            }}
                                            className="w-full py-4 rounded-3xl border-2 border-brand-blue/25 text-brand-blue font-bold hover:bg-brand-blue hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            <Images size={20} aria-hidden /> Choose from Media Library
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
                                <h3 className="text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                                    <Video size={22} className="text-red-600 shrink-0" aria-hidden /> Product showcase video
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 px-1">
                                    Optional YouTube link featured as a showcase clip alongside images. Thumbnail and title load from YouTube.
                                </p>
                                <YoutubeUrlField
                                    label="YouTube URL"
                                    value={formData.showcase_video_url}
                                    onChange={(v) => handleInputChange('showcase_video_url', v)}
                                    hint="Use the main marketing or demo video for this product."
                                />
                            </section>

                            <section className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm">
                                <h3 className="text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2">
                                    <Images size={22} className="text-brand-orange shrink-0" aria-hidden /> Gallery images
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 px-1">
                                    Extra photos for the product carousel. Staged uploads are sent when you hit <strong>Save product</strong>.
                                </p>
                                {(formData.gallery_urls?.length > 0 || galleryPending.length > 0) ? (
                                    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                                        {(formData.gallery_urls || []).map((urlPath: string, idx: number) => (
                                            <li key={`g-url-${idx}-${urlPath}`} className="relative group rounded-2xl border border-slate-200 overflow-hidden aspect-square bg-slate-50">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={resolveImageUrl(urlPath)} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-2 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            aria-label="Move earlier"
                                                            onClick={() => moveGalleryUrl(idx, -1)}
                                                            disabled={idx === 0}
                                                            className="p-2 rounded-xl bg-white/95 text-slate-800 disabled:opacity-40"
                                                        >
                                                            <ArrowUp size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            aria-label="Move later"
                                                            onClick={() => moveGalleryUrl(idx, 1)}
                                                            disabled={idx === formData.gallery_urls.length - 1}
                                                            className="p-2 rounded-xl bg-white/95 text-slate-800 disabled:opacity-40"
                                                        >
                                                            <ArrowDown size={16} />
                                                        </button>
                                                    </span>
                                                    <button
                                                        type="button"
                                                        aria-label="Remove"
                                                        onClick={() => removeGalleryUrl(idx)}
                                                        className="p-2 rounded-xl bg-white/95 text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <span className="absolute left-2 top-2 rounded-lg bg-black/55 text-white text-[10px] font-black px-2 py-0.5 uppercase">{idx + 1}</span>
                                            </li>
                                        ))}
                                        {galleryPending.map((g, idx) => (
                                            <li key={g.tempId} className="relative rounded-2xl border-2 border-dashed border-brand-blue/35 overflow-hidden aspect-square bg-blue-50/40">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={g.previewUrl} alt="" className="w-full h-full object-cover opacity-95" />
                                                <span className="absolute left-2 top-2 rounded-lg bg-brand-blue text-white text-[10px] font-black px-2 py-0.5 uppercase">New</span>
                                                <button
                                                    type="button"
                                                    aria-label="Remove staged file"
                                                    onClick={() => removeGalleryPending(idx)}
                                                    className="absolute right-2 top-2 p-2 rounded-xl bg-black/55 text-white hover:bg-black/75"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 italic mb-6 px-1">No gallery images yet.</p>
                                )}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <label className="flex-1 cursor-pointer rounded-2xl border-2 border-slate-200 hover:border-brand-blue bg-slate-50/60 px-5 py-4 text-center font-bold text-slate-700 hover:bg-blue-50/50 transition-colors">
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                                addGalleryFilesFromDisk(e.target.files);
                                                e.target.value = '';
                                            }}
                                        />
                                        <Upload className="inline-block mr-2 text-brand-blue align-middle" size={18} aria-hidden /> Upload gallery photos
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMediaPickerConfig({ type: 'gallery' });
                                            setIsMediaPickerOpen(true);
                                        }}
                                        className="flex-1 rounded-2xl border-2 border-brand-orange/35 bg-orange-50/40 hover:bg-orange-50 px-5 py-4 font-bold text-slate-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Images size={18} aria-hidden /> Add from library (multiple)
                                    </button>
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                selectedId={null}
                multiSelect={mediaPickerConfig.type === 'gallery' || mediaPickerConfig.type === 'guide'}
            />
        </motion.div>
    );
};

export default ProductForm;
