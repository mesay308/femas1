'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface ProductToolbarProps {
    title: string;
    totalItems: number;
    currentSort: string;
    currentSearch: string;
    onUpdateFilter: (key: string, value: string) => void;
}

const ProductToolbar = ({ title, totalItems, currentSort, currentSearch, onUpdateFilter }: ProductToolbarProps) => {
    const [localSearch, setLocalSearch] = useState(currentSearch || '');

    // Sync local search with external changes
    useEffect(() => {
        setLocalSearch(currentSearch || '');
    }, [currentSearch]);

    // Debounce search update
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localSearch !== (currentSearch || '')) {
                onUpdateFilter('search', localSearch);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [localSearch, currentSearch, onUpdateFilter]);

    return (
        <div className="mb-10 flex flex-col xl:flex-row xl:items-start justify-between gap-8 border-b border-slate-100 pb-10">
            <div className="flex-1 pt-1.5">
                <h1 className="typo-section-h2 text-3xl md:text-4xl text-slate-900 mb-2 font-black uppercase tracking-tight leading-none">{title}</h1>
                <p className="text-slate-500 font-medium text-sm md:text-base">
                    Showing <span className="text-brand-blue font-bold">{totalItems}</span> result{totalItems !== 1 && 's'}
                </p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-start gap-5 flex-[1.5] justify-end">
                {/* Integrated Search */}
                <div className="relative group w-full md:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Search by model, SKU or name..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm font-medium text-slate-700 shadow-sm"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Sort By</span>
                    <div className="relative group min-w-[200px]">
                        <select
                            value={currentSort}
                            onChange={(e) => onUpdateFilter('sort', e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-200 hover:border-brand-blue/30 pl-4 pr-10 py-3 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-brand-blue/5 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A to Z</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-brand-blue transition-colors" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductToolbar;
