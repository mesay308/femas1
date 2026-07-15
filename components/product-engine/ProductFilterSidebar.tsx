'use client';

import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X, ChevronRight, ChevronDown } from 'lucide-react';
import api from '@/api/axios';

interface ProductFilterSidebarProps {
    currentCategory: string;
    currentBrand: string;
    onUpdateFilter: (key: string, value: string) => void;
    onClearFilters: () => void;
}

const ProductFilterSidebar = ({ 
    currentCategory,
    currentBrand,
    onUpdateFilter, 
    onClearFilters 
}: ProductFilterSidebarProps) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const activeCategoryIds = useMemo(() => currentCategory ? currentCategory.split(',') : [], [currentCategory]);
    const activeBrandIds = useMemo(() => currentBrand ? currentBrand.split(',') : [], [currentBrand]);

    const [expandedSections, setExpandedSections] = useState({
        products: true,
        brands: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/brands')
                ]);
                setCategories(catRes.data);
                setBrands(brandRes.data);
            } catch (err) {
                console.error('Failed to fetch filter data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const categoryTree = useMemo(() => {
        const map: any = {};
        const roots: any[] = [];
        categories.forEach(cat => {
            map[cat.category_id] = { ...cat, children: [] };
        });
        categories.forEach(cat => {
            if (cat.parent_category_id && map[cat.parent_category_id]) {
                map[cat.parent_category_id].children.push(map[cat.category_id]);
            } else {
                roots.push(map[cat.category_id]);
            }
        });
        return roots;
    }, [categories]);

    const isCategoryOrChildActive = (cat: any): boolean => {
        if (activeCategoryIds.includes(cat.category_id.toString())) return true;
        if (cat.children && cat.children.length > 0) {
            return cat.children.some((child: any) => isCategoryOrChildActive(child));
        }
        return false;
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const hasActiveFilters = !!(currentCategory || currentBrand);

    const renderCategoryItem = (cat: any, depth = 0) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const isActive = activeCategoryIds.includes(cat.category_id.toString());
        const isChildActive = hasChildren && cat.children.some((child: any) => isCategoryOrChildActive(child));
        const shouldExpand = isActive || isChildActive;

        return (
            <div key={cat.category_id} className="select-none relative">
                <div 
                    className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors ${
                        isActive ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => onUpdateFilter('category_id', cat.category_id)}
                >
                    <span className={`text-sm leading-snug flex-1 ${isActive ? 'font-bold' : (depth === 0 ? 'font-bold text-slate-800' : 'font-medium text-slate-500')}`}>
                        {cat.name}
                    </span>
                    {cat.product_count > 0 && (
                        <span className={`text-[10px] ml-auto px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {cat.product_count}
                        </span>
                    )}
                </div>
                {hasChildren && shouldExpand && (
                    <div className="mt-1 space-y-1">
                        {cat.children.map((child: any) => 
                            renderCategoryItem(child, depth + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sticky top-24 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="typo-kicker text-slate-800 flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                    <SlidersHorizontal size={16} className="text-brand-blue" />
                    Filters
                </h3>
                {hasActiveFilters && (
                    <button 
                        onClick={onClearFilters}
                        className="text-[10px] uppercase font-bold text-slate-400 hover:text-brand-orange transition-colors flex items-center gap-1"
                    >
                        Clear All <X size={12} />
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex flex-col gap-2 animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-8 bg-slate-100 rounded-lg w-full"></div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div>
                            <div 
                                className="flex items-center gap-2 py-2 px-2 cursor-pointer group border-b border-slate-50 mb-3"
                                onClick={() => toggleSection('products')}
                            >
                                <button className="p-0.5 text-slate-400 group-hover:text-brand-blue transition-colors">
                                    {expandedSections.products ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <span className="font-black text-slate-900 text-xs uppercase tracking-widest">Products</span>
                            </div>
                            {expandedSections.products && (
                                <div className="space-y-1">
                                    {categoryTree.map((cat) => renderCategoryItem(cat))}
                                </div>
                            )}
                        </div>

                        <div>
                            <div 
                                className="flex items-center gap-2 py-2 px-2 cursor-pointer group border-b border-slate-50 mb-3"
                                onClick={() => toggleSection('brands')}
                            >
                                <button className="p-0.5 text-slate-400 group-hover:text-brand-blue transition-colors">
                                    {expandedSections.brands ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                                <span className="font-black text-slate-900 text-xs uppercase tracking-widest">Brands</span>
                            </div>
                            {expandedSections.brands && (
                                <div className="space-y-1">
                                    {brands.map((brand) => {
                                        const isActive = activeBrandIds.includes(brand.brand_id.toString());
                                        return (
                                            <div 
                                                key={brand.brand_id}
                                                className={`flex items-center justify-between py-1.5 px-3 rounded-lg cursor-pointer transition-colors ${
                                                    isActive ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'
                                                }`}
                                                onClick={() => onUpdateFilter('brand_id', brand.brand_id)}
                                            >
                                                <span className="text-sm leading-snug flex-1">
                                                    {brand.name}
                                                </span>
                                                {brand.product_count > 0 && (
                                                    <span className={`text-[10px] ml-auto px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        {brand.product_count}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductFilterSidebar;
