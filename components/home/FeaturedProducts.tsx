'use client';

import { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '../product/ProductCard';

interface Badge {
    type: 'primary' | 'secondary';
    text: string;
}

interface Product {
    id: string | number;
    title: string;
    sku: string;
    price: string | null;
    images: string[];
    badges: Badge[];
    benefits: string[];
    applicationNote: string;
}

interface FeaturedProductsProps {
  products: Product[];
}

const FeaturedProducts = ({ products }: FeaturedProductsProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (!products || products.length === 0) return null;

    return (
        <section id="featured-products" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-[1440px] relative">
                
                {/* Centered Heading Style */}
                <div className="text-center mb-16 relative">
                    <span className="inline-block bg-brand-orange/15 text-brand-orange px-5 py-1.5 rounded-full typo-kicker border border-brand-orange/20 mb-4">
                        <Sparkles size={12} className="inline mr-1.5 -mt-0.5" /> Bestsellers
                    </span>
                    <h2 className="typo-section-h2 text-slate-900 mb-6">Family <span className="text-brand-blue">Favorites</span></h2>
                    <p className="typo-card-desc text-slate-600 max-w-2xl mx-auto">Hand-picked best sellers from our cooking stoves, compact round ovens, and custom cabinetry lines. <span className="text-brand-blue font-medium">Advanced Turkish Technology. Quality guaranteed.</span></p>
                </div>

                {/* Carousel Container */}
                <div className="relative group">
                    
                    {/* Left Navigation Button */}
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-6 z-20 bg-white text-brand-blue p-3 md:p-4 rounded-full shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-brand-blue hover:text-white hover:scale-110 hidden sm:flex items-center justify-center"
                        aria-label="Previous products"
                    >
                        <ChevronLeft size={24} strokeWidth={2.5} />
                    </button>

                    {/* Scrollable Area */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-12 pt-4 -mx-4 px-4 no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {products.map((product) => (
                            <div key={String(product.id)} className="flex w-full flex-none snap-start flex-col px-4 md:w-1/2 lg:w-1/4">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    {/* Right Navigation Button */}
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-6 z-20 bg-white text-brand-blue p-3 md:p-4 rounded-full shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-brand-blue hover:text-white hover:scale-110 hidden sm:flex items-center justify-center"
                        aria-label="Next products"
                    >
                        <ChevronRight size={24} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Footer Link to Main Product Engine */}
                <div className="mt-16 text-center">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-4 bg-brand-blue text-white px-12 py-5 rounded-2xl font-semibold text-sm uppercase tracking-wide shadow-lg hover:bg-brand-orange hover:-translate-y-1 transition-all group active:scale-95"
                    >
                        VIEW ALL PRODUCTS
                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default FeaturedProducts;
