'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Shield, Puzzle, Wrench, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProductEngine from '@/components/product-engine/ProductEngine';

const ProductsContent = () => {
    // Premium engineering background image
    const heroImage = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop';

    return (
        <div className="bg-[#f8fafc] min-h-screen">
            {/* ── Premium Hero Section ── */}
            <section className="relative min-h-[700px] h-[90vh] flex items-center overflow-hidden bg-slate-950 text-white">
                {/* Subtle ambient glow from Who We Are style */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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

                <div className="site-container relative z-10 py-24 md:py-32">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-[60%] w-full"
                        >
                            {/* Refined Glassmorphism Card */}
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-10 md:p-14 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                <nav className="flex items-center flex-wrap gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50 mb-6">
                                    <Link href="/" className="hover:text-white transition-colors">Home</Link>
                                    <ChevronRight size={10} className="text-white/30" />
                                    <span className="text-brand-orange">Products</span>
                                </nav>

                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className="text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight mb-6 uppercase tracking-tight"
                                >
                                    Explore the full <span className="text-brand-orange">Femas Catalogue</span>
                                </motion.h1>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                >
                                    <div
                                        className="text-slate-300 text-sm sm:text-lg leading-relaxed border-l-4 border-brand-blue/50 pl-6 mb-10 font-medium"
                                    >
                                        From premium Turkish cooking stoves to bespoke cabinetry systems, browse the complete Femas product range — engineered for modern living.
                                    </div>
                                </motion.div>

                                {/* CTAs */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="flex flex-col sm:flex-row gap-4 items-center mb-10"
                                >
                                    <button
                                        onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="w-full sm:w-auto bg-brand-orange text-white px-8 py-4 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:bg-brand-orange/80 hover:-translate-y-1 transition-all shadow-xl shadow-brand-orange/20 uppercase tracking-widest"
                                    >
                                        Browse by Type
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => window.dispatchEvent(new CustomEvent('open-quote-modal'))}
                                        className="w-full sm:w-auto bg-white/5 backdrop-blur-md text-white border-2 border-white/20 px-8 py-3.5 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 hover:bg-white/20 transition-all uppercase tracking-widest"
                                    >
                                        Project Quote Inquiry
                                    </button>
                                </motion.div>

                                {/* Trust Bar */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/10 pt-8"
                                >
                                    <div className="flex items-center gap-3">
                                        <Shield className="text-brand-orange flex-shrink-0" size={24} />
                                        <span className="text-xs font-bold text-white/90 leading-tight uppercase tracking-wider">Turkish Engineering</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Puzzle className="text-brand-orange flex-shrink-0" size={24} />
                                        <span className="text-xs font-bold text-white/90 leading-tight uppercase tracking-wider">Injera &amp; Specialty Ready</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Wrench className="text-brand-orange flex-shrink-0" size={24} />
                                        <span className="text-xs font-bold text-white/90 leading-tight uppercase tracking-wider">Flame Failure Certified Safety</span>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Side CTA - Floating Down Arrow */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="flex flex-col items-center"
                        >
                            <button
                                onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-5 rounded-2xl flex items-center gap-4 transition-all duration-500 shadow-2xl hover:bg-white/20 hover:-translate-y-2"
                            >
                                <span className="text-brand-orange text-sm sm:text-base font-black uppercase tracking-[0.2em]">View Catalog</span>
                                <motion.div
                                    animate={{ y: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    <ChevronDown size={24} className="text-brand-orange group-hover:text-brand-blue transition-colors" />
                                </motion.div>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Products Section ── */}
            <div id="products-grid" className="bg-droplets-gradient relative z-10 border-t border-slate-100 pb-16 md:pb-24 overflow-hidden">
                {/* Decorative background elements matching Home's Why Us section */}
                <div className="absolute top-0 left-[-100px] w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[60px] pointer-events-none"></div>
                <div className="absolute bottom-0 right-[-50px] w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[60px] pointer-events-none"></div>

                <ProductEngine
                    initialTitle="Available Solutions"
                />
            </div>
        </div>
    );
};

export default ProductsContent;
