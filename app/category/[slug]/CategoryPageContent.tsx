'use client';

import { useState, useEffect } from 'react';
import api from '@/api/axios';
import CategoryContent from './CategoryContent';
import PageSkeleton from '@/components/shared/PageSkeleton';

interface CategoryPageContentProps {
    slug: string;
}

export default function CategoryPageContent({ slug }: CategoryPageContentProps) {
    const [category, setCategory] = useState<any>(null);
    const [productsCount, setProductsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function fetchCategory() {
            try {
                const res = await api.get(`/categories/slug/${slug}`);
                if (cancelled) return;
                const cat = res.data;
                setCategory(cat);

                // Update page title dynamically
                if (cat?.name) {
                    document.title = `${cat.name} | Femas`;
                }

                // Fetch product count
                try {
                    const prodRes = await api.get(`/products?category_id=${cat.category_id}&limit=1`);
                    if (!cancelled) {
                        setProductsCount(prodRes.data.pagination?.total || 0);
                    }
                } catch { /* ignore */ }
            } catch {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchCategory();
        return () => { cancelled = true; };
    }, [slug]);

    if (loading) {
        return <PageSkeleton message="Loading category..." />;
    }

    if (notFound || !category) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center bg-[#f8fafc]">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Category Not Found</h1>
                    <p className="text-slate-600">The requested category could not be found.</p>
                </div>
            </div>
        );
    }

    return <CategoryContent category={category} productsCount={productsCount} />;
}
