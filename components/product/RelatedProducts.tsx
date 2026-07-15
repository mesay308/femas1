'use client';

import Link from 'next/link';
import { ArrowRight, Layers } from 'lucide-react';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
    products: any[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
    if (!products || products.length === 0) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="typo-section-h2 text-2xl flex items-center gap-2 font-bold">
                    <div className="bg-brand-orange/10 p-2 rounded-xl text-brand-orange">
                        <Layers size={20} />
                    </div>
                    More in this range
                </h3>
                <Link href="/products" className="text-brand-blue hover:text-brand-orange typo-nav-item text-sm transition-colors flex items-center gap-1 font-bold uppercase tracking-wider">
                    View All <ArrowRight size={14} />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={String(product.id)} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
