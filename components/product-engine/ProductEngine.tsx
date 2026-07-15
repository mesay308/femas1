'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';
import api from '@/api/axios';
import ProductGrid from './ProductGrid';
import ProductFilterSidebar from './ProductFilterSidebar';
import ProductToolbar from './ProductToolbar';

interface ProductEngineProps {
    baseFilters?: Record<string, any>;
    initialTitle?: string;
}

const ProductEngineInner = ({ baseFilters = {}, initialTitle = "Product Catalog" }: ProductEngineProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Data States
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Extract current filters from URL
    const currentSearch = searchParams.get('search') || '';
    const currentCategory = searchParams.get('category_id') || '';
    const currentBrand = searchParams.get('brand_id') || '';
    const currentSort = searchParams.get('sort') || 'newest';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Stringify baseFilters to avoid infinite loops
    const baseFiltersString = JSON.stringify(baseFilters);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const parsedBaseFilters = JSON.parse(baseFiltersString);
            const params: any = {
                ...parsedBaseFilters,
                search: currentSearch,
                sort: currentSort,
                page: currentPage,
                limit: pagination.limit,
            };

            const catParam = currentCategory?.trim();
            const brandParam = currentBrand?.trim();
            if (catParam) {
                params.category_id = catParam;
            } else if (parsedBaseFilters.category_id != null && String(parsedBaseFilters.category_id).trim() !== '') {
                params.category_id = parsedBaseFilters.category_id;
            }

            if (brandParam) {
                params.brand_id = brandParam;
            } else if (parsedBaseFilters.brand_id != null && String(parsedBaseFilters.brand_id).trim() !== '') {
                params.brand_id = parsedBaseFilters.brand_id;
            }

            // Remove empty params
            Object.keys(params).forEach((key) => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const res = await api.get('/products', { params });
            const responseData = res.data.data || res.data;
            const responsePagination = res.data.pagination || { total: responseData.length, page: 1, totalPages: 1, limit: 12 };
            
            setProducts(Array.isArray(responseData) ? responseData : []);
            setPagination(responsePagination);
        } catch (err) {
            console.error('Failed to fetch products for engine:', err);
            setError('Failed to load products. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }, [baseFiltersString, currentSearch, currentCategory, currentBrand, currentSort, currentPage, pagination.limit]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Handlers for updating URL params
    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        
        // Multi-select logic for specific keys
        if (['category_id', 'brand_id'].includes(key)) {
            const currentValues = params.get(key) ? params.get(key)!.split(',') : [];
            const newValue = value.toString();
            
            if (currentValues.includes(newValue)) {
                // Remove if already present
                const filtered = currentValues.filter(v => v !== newValue);
                if (filtered.length > 0) {
                    params.set(key, filtered.join(','));
                } else {
                    params.delete(key);
                }
            } else {
                // Add if not present
                currentValues.push(newValue);
                params.set(key, currentValues.join(','));
            }
        } else if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        if (key !== 'page') params.set('page', '1');
        
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams]);

    const clearAllFilters = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    return (
        <div className="product-engine site-container py-12">
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
                <button 
                    onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm"
                >
                    <SlidersHorizontal size={18} />
                    {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar */}
                <div className={`w-full lg:w-[300px] xl:w-[320px] flex-shrink-0 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
                    <ProductFilterSidebar 
                        currentCategory={currentCategory}
                        currentBrand={currentBrand}
                        onUpdateFilter={updateFilter}
                        onClearFilters={clearAllFilters}
                    />
                </div>

                {/* Main Content */}
                <div className="w-full flex-1 flex flex-col min-w-0 pt-6">
                    <ProductToolbar 
                        title={initialTitle}
                        totalItems={pagination.total}
                        currentSort={currentSort}
                        currentSearch={currentSearch}
                        onUpdateFilter={updateFilter}
                    />
                    
                    <ProductGrid 
                        products={products} 
                        isLoading={isLoading} 
                        error={error}
                        pagination={pagination}
                        onPageChange={(newPage) => updateFilter('page', newPage.toString())}
                    />
                </div>
            </div>
        </div>
    );
};

const ProductEngine = (props: ProductEngineProps) => (
    <Suspense fallback={
        <div className="min-h-[500px] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin"></div>
        </div>
    }>
        <ProductEngineInner {...props} />
    </Suspense>
);

export default ProductEngine;
