'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Sun, Droplets, Zap, Shield, Settings, Truck, Wrench, Battery, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ICON_MAP: Record<string, any> = {
    'Solar Pumps': Sun,
    'Submersible': Droplets,
    'Surface & Booster': Zap,
    'Fire Protection': Shield,
    'Controllers': Settings,
    'Engine Driven': Truck,
    'Accessories': Wrench,
    'Solar BOS': Battery,
    'Hot Water': Sun,
    'Borehole': Droplets,
};

const resolveUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${base}${cleanUrl}`;
};

interface CategoryCardProps {
    category: {
        category_id: number;
        name: string;
        slug: string;
        cover_image_url?: string;
        short_description?: string;
        product_count?: number;
    };
    index?: number;
}

const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
    const Icon = ICON_MAP[category.name] || ICON_MAP[Object.keys(ICON_MAP).find(k => category.name.includes(k)) || ''] || Package;
    const imageUrl = resolveUrl(category.cover_image_url) || 'https://placehold.co/800x600/png?text=Category';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group flex flex-col bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-500 h-full"
        >
            {/* Image Section */}
            <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Icon Badge Overlay */}
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center text-brand-blue shadow-lg border border-white/20">
                    <Icon size={20} />
                </div>
            </div>
            
            {/* Content Area */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col items-start relative">
                {/* Vertical Accent Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue/20 group-hover:bg-brand-blue transition-all duration-500"></div>

                <div className="mb-4 w-full">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-brand-blue transition-colors mb-1 line-clamp-1">
                        {category.name}
                    </h3>
                    {/* Brand Orange Horizontal Accent */}
                    <div className="w-12 h-1 bg-brand-orange mt-3 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                    {category.short_description || "High-performance technical equipment engineered for the most demanding environmental standards."}
                </p>

                <Link 
                    href={`/category/${category.slug}`} 
                    className="mt-auto group/btn inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] text-brand-blue hover:text-brand-orange transition-all duration-300"
                >
                    View Solutions
                    <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                </Link>
            </div>
        </motion.div>
    );
};

export default CategoryCard;
