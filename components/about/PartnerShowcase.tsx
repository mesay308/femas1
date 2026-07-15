'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PartnerShowcaseProps {
    brands: any[];
}

const PartnerShowcase = ({ brands }: PartnerShowcaseProps) => {
    if (!brands || brands.length === 0) return null;

    // Duplicate brands array to create a seamless infinite scroll effect
    const duplicatedBrands = [...brands, ...brands, ...brands];

    const resolveUrl = (url: string | null) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${base}${cleanUrl}`;
    };

    return (
        <div className="py-4 overflow-hidden relative">
            {/* Gradient overlays */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white/70 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white/70 to-transparent z-10 pointer-events-none" />

            <div className="max-w-[1200px] mx-auto mb-10">
                <div className="text-center">
                    <span className="inline-block bg-brand-orange/10 text-brand-orange px-4 py-1.5 rounded-full typo-kicker mb-3 border border-brand-orange/20 font-bold uppercase tracking-wider">Global Network</span>
                    <h2 className="typo-section-h2 text-slate-900 font-bold uppercase tracking-tight">Our Trusted Partners</h2>
                </div>
            </div>

            <div className="relative flex overflow-hidden group">
                <motion.div
                    className="flex whitespace-nowrap gap-12 md:gap-24 items-center pl-12 md:pl-24"
                    animate={{
                        x: ['0%', '-33.33%'],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                >
                    {duplicatedBrands.map((brand, index) => {
                        const logoUrl = brand.logo_url ? resolveUrl(brand.logo_url) : null;
                        return (
                            <div 
                                key={`${brand.brand_id}-${index}`} 
                                className="flex flex-col items-center justify-center min-w-[150px] md:min-w-[200px] opacity-60 hover:opacity-100 hover:scale-110 transition-all duration-300 grayscale hover:grayscale-0"
                            >
                                {logoUrl ? (
                                    <div className="relative h-16 md:h-20 w-40">
                                        <Image 
                                            src={logoUrl} 
                                            alt={brand.name} 
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                ) : (
                                    <span className="typo-section-h2 text-slate-300 uppercase font-bold">{brand.name}</span>
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

export default PartnerShowcase;
