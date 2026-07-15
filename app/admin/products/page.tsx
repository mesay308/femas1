'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Eye, Filter, Grid, List as ListIcon, Star, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';
import siteConfig from '@/config/siteConfig';

export default function ProductListPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({});
    const [categoriesList, setCategoriesList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Filter and view states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);

            const catMap: Record<string, string> = {};
            if (Array.isArray(catRes.data)) {
                catRes.data.forEach((c: any) => {
                    catMap[c.category_id] = c.name;
                });
            }
            setCategoriesList(catRes.data || []);
            setCategoriesMap(catMap);
            const productsArray = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.data || []);
            setProducts(productsArray);
        } catch (err: any) {
            console.error("Failed to load products", err);
            setError(err.message || "Failed to load products");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.product_id !== id));
        } catch (err) {
            console.error("Failed to delete product", err);
            alert("Failed to delete product");
        }
    };

    const handleInlineUpdate = async (id: string, field: string, value: any) => {
        setUpdatingId(`${id}-${field}`);
        try {
            const currentItem = products.find(p => p.product_id === id);
            const payload = { ...currentItem, [field]: value };
            await api.put(`/products/${id}`, payload);
            setProducts(products.map(p => p.product_id === id ? { ...p, [field]: value } : p));
        } catch (err: any) {
            console.error("Inline update failed", err);
            alert("Failed to save changes: " + (err.response?.data?.error || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    const formatStockStatus = (status: string) => {
        switch (status) {
            case 'in_stock': return 'In Stock';
            case 'low_stock': return 'Low Stock';
            case 'out_of_stock': return 'Out of Stock';
            default: return status || 'Unknown';
        }
    };

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (selectedCategory) {
            result = result.filter(product => String(product.category_id) === String(selectedCategory));
        }

        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(product => {
                const catName = categoriesMap[product.category_id] || '';
                const prodName = product.name || '';
                const prodSku = product.sku || '';
                return (
                    prodName.toLowerCase().includes(lowerQuery) ||
                    prodSku.toLowerCase().includes(lowerQuery) ||
                    catName.toLowerCase().includes(lowerQuery)
                );
            });
        }

        return result;
    }, [products, searchQuery, selectedCategory, categoriesMap]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Products</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Products Catalog</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your inventory, featured highlights, and categorization.</p>
                </div>
                <Link href="/admin/products/new" className="admin-cta-primary shrink-0">
                    <Plus size={20} aria-hidden />
                    Add new product
                </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/40 mb-6 flex flex-col xl:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, SKU or category..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-medium placeholder:text-slate-400"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative min-w-[220px] group">
                        <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-brand-blue transition-colors z-10" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 rounded-xl bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-bold text-slate-600 appearance-none cursor-pointer shadow-sm shadow-slate-200/50"
                        >
                            <option value="">Catalogue: All Categories</option>
                            {Object.entries(categoriesMap).map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                            ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none group-hover:text-brand-blue transition-colors" />
                    </div>

                    <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full">
                {isLoading ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/40 p-24 text-center">
                        <Loader2 className="w-10 h-10 text-brand-blue animate-spin mx-auto mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Catalog...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 rounded-2xl border border-red-100 p-12 text-center text-red-600 font-bold">
                        Error: {error}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/40 p-24 text-center text-slate-400 italic">
                        No products match your current filters.
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                                        <th className="px-6 py-5">Product Master</th>
                                        <th className="px-6 py-5">Categorization</th>
                                        <th className="px-6 py-5 text-center">Featured</th>
                                        <th className="px-6 py-5">Pricing</th>
                                        <th className="px-6 py-5">Inventory</th>
                                        <th className="px-6 py-5 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50 text-sm">
                                    {filteredProducts.map((product) => {
                                        const isUpdating = (field: string) => updatingId === `${product.product_id}-${field}`;
                                        const imageUrl = resolveImageUrl(product.cover_image_url);

                                        return (
                                            <motion.tr layout key={product.product_id} className="hover:bg-blue-50/20 transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex-shrink-0 overflow-hidden relative shadow-sm">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 leading-tight group-hover:text-brand-blue transition-colors">{product.name}</h3>
                                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">SKU: {product.sku || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="relative group/select">
                                                        {isUpdating('category_id') ? (
                                                            <div className="flex items-center justify-center p-2"><Loader2 size={14} className="text-brand-blue animate-spin" /></div>
                                                        ) : (
                                                            <div className="relative h-full">
                                                                <select
                                                                    value={product.category_id || ''}
                                                                    onChange={(e) => handleInlineUpdate(product.product_id, 'category_id', e.target.value)}
                                                                    className="w-full bg-slate-100/40 hover:bg-white border border-transparent hover:border-slate-200 p-2 rounded-xl text-[11px] font-extrabold text-slate-600 outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/20 transition-all appearance-none pr-8 cursor-pointer shadow-sm hover:shadow-md"
                                                                >
                                                                    <option value="">Uncategorized</option>
                                                                    {categoriesList.map(cat => (
                                                                        <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none group-hover/select:text-brand-blue transition-colors" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleInlineUpdate(product.product_id, 'is_featured', !product.is_featured)}
                                                        disabled={isUpdating('is_featured')}
                                                        className={`p-2 rounded-xl transition-all ${product.is_featured
                                                            ? 'bg-amber-50 text-amber-500 hover:bg-amber-100 border border-amber-100'
                                                            : 'bg-slate-50 text-slate-300 hover:text-slate-400 border border-slate-100'
                                                            }`}
                                                        title={product.is_featured ? 'Remove from Highlights' : 'Mark as Featured'}
                                                    >
                                                        {isUpdating('is_featured') ? <Loader2 size={18} className="animate-spin" /> : <Star size={18} fill={product.is_featured ? 'currentColor' : 'none'} />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 tracking-tighter">
                                                        {siteConfig.currencySymbol} {Number(product.base_price).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${product.stock_status === 'in_stock'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                        : 'bg-amber-50 text-amber-700 border-amber-100'
                                                        }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock_status === 'in_stock' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        {formatStockStatus(product.stock_status)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all">
                                                        <Link href={`/product/${product.product_id}`} target="_blank" className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg" title="View as Customer">
                                                            <Eye size={18} />
                                                        </Link>
                                                        <Link href={`/admin/products/${product.product_id}`} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg" title="Edit Product">
                                                            <Edit2 size={18} />
                                                        </Link>
                                                        <button onClick={() => handleDelete(product.product_id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete Product">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const imageUrl = resolveImageUrl(product.cover_image_url);
                            return (
                                <motion.div layout key={product.product_id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-lg transition-all flex flex-col relative">
                                    {product.is_featured && (
                                        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur p-2 rounded-xl text-amber-500 shadow-xl border border-amber-100">
                                            <Star size={16} fill="currentColor" />
                                        </div>
                                    )}
                                    <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 z-10">
                                            <Link href={`/product/${product.product_id}`} target="_blank" className="p-3 bg-white rounded-xl text-slate-800 hover:text-emerald-500 transition-all shadow-lg" title="View as Customer">
                                                <Eye size={20} />
                                            </Link>
                                            <Link href={`/admin/products/${product.product_id}`} className="p-3 bg-white rounded-xl text-slate-800 hover:text-brand-blue transition-all shadow-lg" title="Edit">
                                                <Edit2 size={20} />
                                            </Link>
                                            <button onClick={() => handleDelete(product.product_id)} className="p-3 bg-white rounded-xl text-slate-800 hover:text-red-500 transition-all shadow-lg" title="Delete">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest block mb-1">{categoriesMap[product.category_id] || 'Uncategorized'}</span>
                                        <h3 className="font-bold text-slate-900 line-clamp-2 mb-4 h-12 leading-tight">{product.name}</h3>
                                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="font-bold text-slate-800">{siteConfig.currencySymbol} {Number(product.base_price).toLocaleString()}</div>
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${product.stock_status === 'in_stock' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {product.stock_status === 'in_stock' ? 'IN' : 'LOW'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
