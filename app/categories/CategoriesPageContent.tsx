'use client';

import { useState, useEffect } from 'react';
import api from '@/api/axios';
import CategoriesContent from './CategoriesContent';
import PageSkeleton from '@/components/shared/PageSkeleton';

export default function CategoriesPageContent() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        api.get('/categories')
            .then((res) => {
                if (cancelled) return;
                const data = Array.isArray(res.data) ? res.data : [];
                const filtered = data
                    .filter((cat: any) => cat.is_active && cat.parent_category_id !== null)
                    .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
                setCategories(filtered);
            })
            .catch((err) => {
                console.error('Error fetching categories:', err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return <PageSkeleton message="Loading categories..." />;
    }

    return <CategoriesContent initialCategories={categories} />;
}
