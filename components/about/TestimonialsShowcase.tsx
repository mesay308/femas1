'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TestimonialsShowcaseProps {
    testimonials: any[];
}

const TestimonialsShowcase = ({ testimonials }: TestimonialsShowcaseProps) => {
    // Only show active and approved testimonials
    const activeTestimonials = testimonials.filter(t => t.is_approved === 1 || t.is_approved === true);
    
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        if (activeTestimonials.length <= 1) return;
        const timer = setInterval(() => {
            setDirection(1);
            setActiveIndex((prev) => (prev + 1) % activeTestimonials.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [activeTestimonials.length]);

    const handleNext = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % activeTestimonials.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + activeTestimonials.length) % activeTestimonials.length);
    };

    if (activeTestimonials.length === 0) return null;

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        })
    };

    const resolveUrl = (url: string | null) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${base}${cleanUrl}`;
    };

    return (
        <section className="py-32 bg-slate-950 relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            
            <div className="container mx-auto px-4 max-w-[1000px] relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full typo-kicker mb-4 border border-white/20 font-bold uppercase tracking-wider">
                        <Star size={14} className="text-brand-orange" fill="currentColor" /> Client Trust
                    </span>
                    <h2 className="typo-section-h2 text-white mb-6 font-bold uppercase tracking-tight">What Our Partners Say</h2>
                </div>

                <div className="relative mt-20 max-w-5xl mx-auto">
                    <Quote className="absolute -top-16 -left-8 md:-left-16 w-32 h-32 md:w-48 md:h-48 text-white/[0.03] rotate-180 pointer-events-none" />

                    <div className="overflow-hidden relative min-h-[400px] flex items-center justify-center">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={activeIndex}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.4 } }}
                                className="w-full flex flex-col items-center justify-center text-center px-4"
                            >
                                <p className="typo-hero-support text-slate-200 mb-12 max-w-4xl leading-relaxed md:leading-tight font-medium">
                                    "{activeTestimonials[activeIndex].content}"
                                </p>
                                
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/20 overflow-hidden mb-5 p-1 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                                        {activeTestimonials[activeIndex].client_image ? (
                                            <Image 
                                                src={resolveUrl(activeTestimonials[activeIndex].client_image)} 
                                                alt={activeTestimonials[activeIndex].client_name}
                                                fill
                                                className="object-cover rounded-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-brand-orange to-red-500 rounded-full flex items-center justify-center text-2xl font-bold">
                                                {activeTestimonials[activeIndex].client_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="typo-kicker text-brand-orange mb-3 block font-bold uppercase tracking-wider">Client Stories</span>
                                    <h4 className="typo-card-title text-white text-xl mb-2 font-bold">{activeTestimonials[activeIndex].client_name}</h4>
                                    <p className="typo-kicker text-brand-blue font-bold uppercase tracking-wider">{activeTestimonials[activeIndex].client_position}</p>
                                    <p className="typo-pull-quote text-slate-400 mb-8 leading-relaxed font-serif italic font-medium">{activeTestimonials[activeIndex].company_name}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Interactive Controls */}
                    {activeTestimonials.length > 1 && (
                        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 md:-px-12 pointer-events-none">
                            <button 
                                onClick={handlePrev}
                                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300 pointer-events-auto shadow-lg"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={handleNext}
                                className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 transition-all duration-300 pointer-events-auto shadow-lg"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}

                    {/* Pagination Dots */}
                    {activeTestimonials.length > 1 && (
                        <div className="flex justify-center gap-3 mt-16">
                            {activeTestimonials.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setDirection(idx > activeIndex ? 1 : -1);
                                        setActiveIndex(idx);
                                    }}
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                        activeIndex === idx ? 'w-12 bg-brand-orange shadow-[0_0_15px_rgba(255,165,0,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'
                                    }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsShowcase;
