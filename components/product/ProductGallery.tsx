'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Maximize2, Package } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

const ProductGallery = ({ images, title }: ProductGalleryProps) => {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const hasImages = images && images.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 min-w-0"
        >
            {/* Main image — inner panel matches ProductInfo content surfaces */}
            <div className="relative group flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/70 p-4 shadow-sm md:rounded-[2.5rem] md:p-8 mb-4 md:mb-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,165,223,0.06)_0%,transparent_55%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,121,32,0.04)_0%,transparent_50%)]" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full h-full flex items-center justify-center relative z-10"
                    >
                        {hasImages ? (
                            <Image
                                src={images[activeImageIndex]}
                                alt={`${title} - Main`}
                                fill
                                className="object-contain p-2 md:p-4 rounded-[1.5rem] md:rounded-[3rem]"
                            />
                        ) : (
                            <div className="text-brand-blue/20">
                                <Package size={192} />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <div className="bg-white/40 backdrop-blur-md border border-white/60 p-3 rounded-2xl shadow-lg hover:bg-white/60 transition-colors cursor-pointer">
                        <Maximize2 className="text-brand-blue" size={20} />
                    </div>
                </div>
            </div>

            {/* Thumbnail Grid */}
            {hasImages && images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                    {images.map((img, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`
                                relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border p-1.5 transition-all duration-300 md:rounded-2xl md:p-2
                                ${activeImageIndex === idx
                                    ? 'border-brand-blue bg-white shadow-md ring-4 ring-brand-blue/10'
                                    : 'border-slate-200/80 bg-white/70 hover:border-brand-blue/30 hover:bg-white'}
                            `}
                            aria-label={`View image ${idx + 1}`}
                        >
                            <Image 
                                src={img} 
                                alt={`Thumbnail ${idx + 1}`} 
                                fill 
                                className="object-cover p-1 rounded-[0.75rem] md:rounded-[1.5rem]" 
                            />
                            {activeImageIndex !== idx && (
                                <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></div>
                            )}
                        </motion.button>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default ProductGallery;
