'use client';

import { ArrowRight, Flame, Layers } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CategoryCard from '@/components/categories/CategoryCard';

interface Category {
  category_id: number;
  name: string;
  slug: string;
  is_active: boolean;
  parent_category_id: number | null;
  cover_image_url?: string;
  short_description?: string;
  description?: string;
}

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
    if (!categories || categories.length === 0) return null;

    // Limit to 5 categories to leave room for the 6th "Explore More" card
    const displayCategories = categories.slice(0, 5);

    return (
        <section className="py-24 relative z-10 bg-[#f8fafc] overflow-hidden">
            <div className="container mx-auto px-4 max-w-[1440px]">
                <div className="text-center mb-16 relative">
                    <span className="inline-block bg-brand-orange text-white px-5 py-1.5 rounded-full typo-kicker border border-brand-orange mb-4 shadow-sm">
                        <Flame size={12} className="inline mr-1.5 -mt-0.5" /> Our Product Categories
                    </span>
                    <h2 className="typo-section-h2 text-slate-900 mb-6">Engineered for <span className="text-brand-blue">Ethiopian Homes</span></h2>
                    <p className="typo-card-desc text-slate-600 max-w-2xl mx-auto">Explore our premium range of Femas kitchen appliances &mdash; freestanding stoves, compact round ovens, and custom cabinetry built for modern Ethiopian homes.</p>
                </div>
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {displayCategories.map((cat, index) => (
                        <CategoryCard key={cat.category_id} category={cat} index={index} />
                    ))}

                    {/* 6th Card: Explore More CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: displayCategories.length * 0.1 }}
                        className="group flex flex-col bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 h-full relative"
                    >
                        {/* Ambient Background Glow */}
                        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-brand-blue/20 rounded-full blur-[80px] group-hover:bg-brand-blue/30 transition-colors"></div>
                        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-brand-orange/15 rounded-full blur-[80px] group-hover:bg-brand-orange/25 transition-colors"></div>
                        
                        <div className="relative z-10 p-8 sm:p-10 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-8 border border-white/20 group-hover:scale-110 transition-transform duration-500">
                                <Layers size={32} className="text-white" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
                                Discover <span className="text-brand-blue">More</span>
                            </h3>
                            
                            <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
                                View the full Femas catalogue across stoves, ovens, and custom cabinetry.
                            </p>
                            
                            <Link 
                                href="/categories"
                                className="inline-flex items-center gap-3 bg-brand-blue text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-orange hover:-translate-y-1 transition-all"
                            >
                                VIEW MORE CATEGORIES <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CategoryGrid;
