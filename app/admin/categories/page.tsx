'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, Trash2, Eye, Grid, List as ListIcon,
    Box, ChevronRight, Loader2, ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';

export default function CategoryManagerPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/categories');
            const data = res.data || [];
            setCategories(data);
            
            const parentIds = new Set<string>();
            data.forEach((c: any) => {
                if (data.some((child: any) => child.parent_category_id === c.category_id)) {
                    parentIds.add(c.category_id);
                }
            });
            setExpandedIds(parentIds);
        } catch (err: any) {
            console.error("Failed to load categories", err);
            setError(err.message || "Failed to load categories");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedIds(newExpanded);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter(c => c.category_id !== id));
        } catch (err: any) {
            console.error("Failed to delete category", err);
            alert(err.response?.data?.error || "Failed to delete category.");
        }
    };

    const handleInlineUpdate = async (id: string, field: string, value: any) => {
        setUpdatingId(`${id}-${field}`);
        try {
            const currentCat = categories.find(c => c.category_id === id);
            const updatedCat = { ...currentCat, [field]: value };

            const payload = {
                name: updatedCat.name,
                slug: updatedCat.slug,
                parent_category_id: updatedCat.parent_category_id,
                description: updatedCat.description,
                short_description: updatedCat.short_description,
                meta_title: updatedCat.meta_title,
                meta_description: updatedCat.meta_description,
                is_active: updatedCat.is_active,
                display_order: updatedCat.display_order,
                level: updatedCat.level
            };

            await api.put(`/categories/${id}`, payload);
            setCategories(categories.map(c => c.category_id === id ? { ...c, [field]: value } : c));
        } catch (err: any) {
            console.error("Inline update failed", err);
            alert("Failed to update: " + (err.response?.data?.error || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredCategories = useMemo(() => {
        let result = [...categories];
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(cat => {
                const name = cat.name || '';
                const slug = cat.slug || '';
                return name.toLowerCase().includes(lowerQuery) ||
                    slug.toLowerCase().includes(lowerQuery);
            });
        }
        return result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }, [categories, searchQuery]);

    const categoryTree = useMemo(() => {
        const build = (items: any[], parentId: string | null = null): any[] => {
            return items
                .filter(item => item.parent_category_id === (parentId || null))
                .map(item => ({
                    ...item,
                    children: build(items, item.category_id)
                }));
        };
        return build(filteredCategories);
    }, [filteredCategories]);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Categories</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Categories Catalog</h1>
                    <p className="text-slate-500 mt-1 font-medium">Define logic, visual identity, and search visibility for your product groups.</p>
                </div>
                <Link href="/admin/categories/new" className="admin-cta-primary shrink-0">
                    <Plus size={20} aria-hidden />
                    Add new category
                </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/40 mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or slug..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-medium placeholder:text-slate-400"
                    />
                </div>
                <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}>
                        <ListIcon size={18} />
                    </button>
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}>
                        <Grid size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <div className="bg-white rounded-[3rem] border border-slate-100 p-32 text-center shadow-sm">
                        <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-800">Synchronizing Architecture</h3>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-32 text-center">
                        <Box size={48} className="text-slate-200 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-800">No Categories Mapped</h3>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCategories.map((cat) => {
                            const hasChildren = categories.some(child => child.parent_category_id === cat.category_id);
                            return (
                                <div key={cat.category_id} className={`rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col relative ${hasChildren ? 'bg-red-50/20 border-2 border-red-500' : 'bg-white border border-slate-100'}`}>
                                    <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-slate-50">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={resolveImageUrl(cat.cover_image_url)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 z-10">
                                            <Link href={`/category/${cat.slug}`} target="_blank" className="p-3 bg-white rounded-xl text-slate-800 hover:text-emerald-500 shadow-lg"><Eye size={20} /></Link>
                                            <Link href={`/admin/categories/${cat.category_id}`} className="p-3 bg-white rounded-xl text-slate-800 hover:text-brand-blue shadow-lg"><Edit2 size={20} /></Link>
                                            <button onClick={() => handleDelete(cat.category_id)} className="p-3 bg-white rounded-xl text-slate-800 hover:text-red-500 shadow-lg"><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-900 line-clamp-2 mb-4 h-12 leading-tight">{cat.name}</h3>
                                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold">
                                            <div className="text-slate-800 flex items-center gap-1.5"><Box size={14}/> {cat.product_count || 0} Products</div>
                                            <div className={cat.is_active ? 'text-emerald-500' : 'text-slate-400'}>{cat.is_active ? 'ACTIVE' : 'ARCHIVED'}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                    <th className="px-6 py-5">Category Master</th>
                                    <th className="px-6 py-5">Root Category</th>
                                    <th className="px-6 py-5 text-center">Order</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                    <th className="px-6 py-5 text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50 text-sm">
                                {categoryTree.map((cat) => (
                                    <CategoryRow 
                                        key={cat.category_id} 
                                        cat={cat} 
                                        level={0} 
                                        categories={categories} 
                                        handleDelete={handleDelete} 
                                        handleInlineUpdate={handleInlineUpdate}
                                        updatingId={updatingId}
                                        expandedIds={expandedIds}
                                        toggleExpand={toggleExpand}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const CategoryRow = ({ cat, level, categories, handleDelete, handleInlineUpdate, updatingId, expandedIds, toggleExpand }: any) => {
    const isExpanded = expandedIds.has(cat.category_id);
    const hasChildren = cat.children && cat.children.length > 0;
    const isUpdating = (field: string) => updatingId === `${cat.category_id}-${field}`;

    return (
        <>
            <tr className={`transition-all group ${hasChildren ? 'bg-red-50/10' : ''}`}>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div style={{ width: `${level * 24}px` }} className="shrink-0" />
                        <button onClick={() => toggleExpand(cat.category_id)} className={`p-1 rounded-lg ${hasChildren ? 'text-slate-400 hover:text-brand-blue' : 'opacity-0'}`}>
                            <ChevronDown size={16} className={isExpanded ? 'rotate-180' : ''} />
                        </button>
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={resolveImageUrl(cat.cover_image_url)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold text-slate-900">{cat.name}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <select
                        value={cat.parent_category_id || ''}
                        onChange={(e) => handleInlineUpdate(cat.category_id, 'parent_category_id', e.target.value || null)}
                        className="bg-slate-50 border border-slate-200 text-[11px] font-bold p-1 rounded-lg outline-none"
                    >
                        <option value="">Root</option>
                        {categories.filter((c: any) => c.category_id !== cat.category_id).map((c: any) => (
                            <option key={c.category_id} value={c.category_id}>{c.name}</option>
                        ))}
                    </select>
                </td>
                <td className="px-6 py-4 text-center">
                    <input
                        type="number"
                        value={cat.display_order}
                        onChange={(e) => handleInlineUpdate(cat.category_id, 'display_order', parseInt(e.target.value) || 0)}
                        className="w-12 bg-slate-50 border border-slate-200 text-center font-bold text-xs rounded-lg p-1"
                    />
                </td>
                <td className="px-6 py-4 text-center">
                    <button
                        onClick={() => handleInlineUpdate(cat.category_id, 'is_active', !cat.is_active)}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold border ${cat.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400'}`}
                    >
                        {cat.is_active ? 'Active' : 'Closed'}
                    </button>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/categories/${cat.category_id}`} className="text-slate-400 hover:text-brand-blue"><Edit2 size={16} /></Link>
                        <button onClick={() => handleDelete(cat.category_id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                </td>
            </tr>
            {isExpanded && hasChildren && cat.children.map((child: any) => (
                <CategoryRow key={child.category_id} cat={child} level={level + 1} categories={categories} handleDelete={handleDelete} handleInlineUpdate={handleInlineUpdate} updatingId={updatingId} expandedIds={expandedIds} toggleExpand={toggleExpand} />
            ))}
        </>
    );
};
