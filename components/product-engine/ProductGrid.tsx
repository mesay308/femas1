'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Box, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import ProductCard from '../product/ProductCard';
import siteConfig from '@/config/siteConfig';

const SkeletonCard = () => (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex flex-col h-full animate-pulse">
        <div className="flex gap-2 mb-4">
            <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
            <div className="w-20 h-6 bg-slate-100 rounded-full"></div>
        </div>
        <div className="w-full h-[180px] bg-slate-100 rounded-3xl mb-6"></div>
        <div className="w-3/4 h-6 bg-slate-100 rounded-lg mb-3"></div>
        <div className="w-1/2 h-6 bg-slate-100 rounded-lg mb-6"></div>
        <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="h-4 bg-slate-100 rounded"></div>
            <div className="h-4 bg-slate-100 rounded"></div>
            <div className="h-4 bg-slate-100 rounded"></div>
            <div className="h-4 bg-slate-100 rounded"></div>
        </div>
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center mb-4">
            <div className="w-24 h-6 bg-slate-100 rounded-lg"></div>
            <div className="w-20 h-4 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="flex gap-2">
            <div className="flex-1 h-10 bg-slate-100 rounded-xl"></div>
            <div className="flex-1 h-10 bg-slate-100 rounded-xl"></div>
        </div>
    </div>
);

const parseJsonSafe = (data: any) => {
    if (!data) return [];
    if (typeof data === 'string') {
        try { return JSON.parse(data); } catch (e) { return []; }
    }
    return data;
};

const resolveUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base}${url.startsWith('/') ? url : `/${url}`}`;
};

interface ProductGridProps {
    products: any[];
    isLoading: boolean;
    error: string | null;
    pagination: { total: number, page: number, limit: number, totalPages: number };
    onPageChange: (page: number) => void;
}

const ProductGrid = ({ products, isLoading, error, pagination, onPageChange }: ProductGridProps) => {
    if (error) {
        return (
            <div className="bg-red-50 p-12 rounded-[2rem] text-center border-2 border-red-100">
                <p className="text-red-500 font-bold mb-2 uppercase tracking-wider">Error Loading Catalog</p>
                <p className="text-red-400 text-sm font-normal">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-[500px]">
            {/* Loading Skeletons */}
            {isLoading && (
                <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: pagination.limit || 6 }).map((_, i) => (
                        <div key={i}><SkeletonCard /></div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && products.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center flex flex-col items-center"
                >
                    <Box size={48} className="text-slate-300 mb-6" />
                    <h3 className="text-2xl font-bold text-slate-500 mb-2 uppercase tracking-wider">No Matching Products</h3>
                    <p className="text-slate-400 font-normal">Try adjusting your search criteria or clearing filters.</p>
                </motion.div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
                <AnimatePresence mode="popLayout">
                    {!isLoading && products.map((product, idx) => {
                        const badges = parseJsonSafe(product.badge).filter((b: string) => [
                            'new arrival', 'best seller', 'limited stock', 'featured', 
                            'concentrated', 'hard-water hero', 'eco-friendly', 'skin-friendly'
                        ].includes(b.toLowerCase())).map((b: string) => ({
                            type: b.toLowerCase().includes('new') || b.toLowerCase().includes('best') ? 'primary' : 'secondary',
                            text: b
                        }));
                        const applications = parseJsonSafe(product.applications);
                        const coverUrl = product.cover_image_url ? resolveUrl(product.cover_image_url) : null;

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05, duration: 0.3 }}
                                key={product.product_id}
                            >
                                <ProductCard product={{
                                    id: product.slug || product.product_id,
                                    title: product.name,
                                    sku: product.sku,
                                    price: product.base_price > 0 ? `${siteConfig.currencySymbol} ${Number(product.base_price).toLocaleString()}` : null,
                                    images: coverUrl ? [coverUrl] : [],
                                    badges: badges,
                                    benefits: applications,
                                    applicationNote: product.short_description || ''
                                }} />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {!isLoading && pagination.totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                    <button 
                        onClick={() => onPageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-brand-blue disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex items-center gap-1 mx-4">
                        {Array.from({ length: pagination.totalPages }).map((_, i) => {
                            const pageNum = i + 1;
                            if (
                                pageNum === 1 || 
                                pageNum === pagination.totalPages || 
                                (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-all text-sm ${
                                            pageNum === pagination.page 
                                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' 
                                                : 'text-slate-500 hover:bg-slate-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            }
                            if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                                return <span key={pageNum} className="text-slate-300">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button 
                        onClick={() => onPageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="p-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-brand-blue disabled:opacity-50 disabled:pointer-events-none transition-all shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
