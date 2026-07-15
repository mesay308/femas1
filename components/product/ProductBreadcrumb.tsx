'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface ProductBreadcrumbProps {
    category: string;
    /** When set, category name links to the public category page */
    categorySlug?: string;
    productName: string;
}

const ProductBreadcrumb = ({ category, categorySlug, productName }: ProductBreadcrumbProps) => {
    const categoryHref = categorySlug ? `/category/${categorySlug}` : null;

    return (
        <nav className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto whitespace-nowrap py-3 no-scrollbar">
            <Link href="/" className="flex shrink-0 items-center gap-1 font-medium text-slate-600 transition-colors hover:text-brand-blue">
                <Home size={14} aria-hidden />
                <span>Home</span>
            </Link>
            <ChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden />
            <Link href="/products" className="shrink-0 font-medium text-slate-600 transition-colors hover:text-brand-blue">
                Products
            </Link>
            <ChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden />
            {categoryHref ? (
                <Link href={categoryHref} className="shrink-0 max-w-[40vw] truncate font-medium text-slate-600 transition-colors hover:text-brand-blue">
                    {category}
                </Link>
            ) : (
                <span className="max-w-[40vw] truncate text-slate-500">{category}</span>
            )}
            <ChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden />
            <span className="truncate font-semibold text-brand-blue">{productName}</span>
        </nav>
    );
};

export default ProductBreadcrumb;
