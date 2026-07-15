'use client';

import { motion } from 'framer-motion';
import { Droplets, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import QuickRequest from '@/components/home/QuickRequest';
import CategoryCard from '@/components/categories/CategoryCard';

interface CategoriesContentProps {
    initialCategories: any[];
}

const CategoriesContent = ({ initialCategories }: CategoriesContentProps) => {
    return (
        <div className="bg-[#f8fafc] min-h-screen relative overflow-hidden">
            {/* ── Background Gradients ── */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-droplets-gradient opacity-40"></div>
                <div className="absolute top-[20%] -left-[10%] w-[40%] h-[40%] bg-brand-blue/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-brand-orange/5 rounded-full blur-[100px]"></div>
            </div>

            {/* ── Hero Section (Who We Are Style Background) ── */}
            <section className="relative min-h-[600px] flex items-center overflow-hidden z-10 bg-slate-950 text-white">
                {/* Subtle ambient glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div 
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-brand-blue/15 rounded-full blur-[180px] mix-blend-screen" 
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-[30%] -left-[15%] w-[50%] h-[50%] bg-brand-orange/10 rounded-full blur-[160px] mix-blend-screen" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
                </div>

                <div className="site-container relative z-10 py-20">
                    <div className="max-w-3xl mx-auto md:mx-0">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-10 md:p-12 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
                        >
                            <nav className="flex items-center flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                <ChevronRight size={10} className="text-white/20" />
                                <span className="text-brand-orange/80">Product Categories</span>
                            </nav>

                            <h1 className="text-white font-black text-3xl sm:text-4xl md:text-5xl leading-[1.1] mb-6 uppercase tracking-tight">
                                Find Your <br />
                                <span className="text-brand-blue">Femas Appliances</span> <br />
                                <span className="text-xl sm:text-2xl md:text-3xl opacity-70 text-white font-bold">Solution</span>
                            </h1>

                            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed mb-10 max-w-xl font-medium border-l-2 border-brand-blue/50 pl-6">
                                Browse our product lines organized by category so you can quickly find the right freestanding stoves, compact ovens, or kitchen cabinetry layout.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button 
                                    onClick={() => document.getElementById('categories-list')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-brand-blue text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:brightness-110 hover:-translate-y-1 shadow-xl shadow-brand-blue/20"
                                >
                                    Browse Categories
                                </button>
                                <Link 
                                    href="/contact"
                                    className="bg-white/5 text-white border border-white/10 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:bg-white/10 hover:-translate-y-1"
                                >
                                    Find a Distributor
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Main Catalog Section ── */}
            <div id="categories-list" className="site-container relative z-10 py-12 lg:py-16">
                {/* Home Page Style Title Section */}
                <div className="text-center mb-10 relative">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="typo-section-h2 text-slate-900 mb-6"
                    >
                        Engineered for <span className="text-brand-blue">Ethiopian Homes</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="typo-card-desc text-slate-600 max-w-2xl mx-auto"
                    >
                        Explore our premium range of Femas kitchen appliances &mdash; freestanding stoves, compact round ovens, and custom cabinetry built for modern Ethiopian homes.
                    </motion.p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {initialCategories.map((cat, index) => (
                        <CategoryCard key={cat.category_id} category={cat} index={index} />
                    ))}
                </div>
            </div>

            {/* ── Reusable Contact Hub ── */}
            <QuickRequest />
        </div>
    );
};

export default CategoriesContent;
