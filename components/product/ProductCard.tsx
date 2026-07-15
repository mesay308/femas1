'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle, Phone, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/api/axios';

// Custom Telegram Icon Component
const TelegramIcon = ({ className, size = 24 }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
);

interface Badge {
    type: 'primary' | 'secondary';
    icon?: string;
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

const ProductCard = ({ product }: { product: Product }) => {
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data)).catch(() => {});
    }, []);

    const primaryPhone = settings?.primary_phone || '';
    const telegramUrl = settings?.telegram_url || '#';

    return (
        <div className="group relative bg-[#f6fafd] bg-gradient-to-br from-white via-[#f6fafd] to-[#f0f9ff] border border-gray-200/50 rounded-[32px] p-6 shadow-sm flex flex-col transition-all duration-300 h-full overflow-hidden hover:shadow-xl hover:-translate-y-1">
            {/* Background Decorative Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2.5 mb-5 relative z-10 min-h-[28px]">
                {product.badges?.map((badge, idx) => (
                    <span 
                        key={idx}
                        className={`inline-flex items-center gap-1.5 typo-badge px-4 py-1.5 rounded-full text-white shadow-sm border border-white/30 ${
                            badge.type === 'primary' ? 'bg-brand-blue shadow-[0_2px_8px_rgba(0,165,223,0.15)]' : 'bg-brand-orange shadow-[0_2px_8px_rgba(249,140,20,0.2)]'
                        }`}
                    >
                        {badge.text}
                    </span>
                ))}
            </div>

            {/* Image Area */}
            <Link href={`/product/${product.id}`} className="block relative w-full h-[180px] bg-gradient-to-br from-[#eef8fc] to-white rounded-3xl mb-6 overflow-hidden border border-[#00a5df]/10 flex items-center justify-center">
                {product.images?.[0] ? (
                    <Image 
                        src={product.images[0]} 
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-3xl"
                    />
                ) : (
                    <div className="text-brand-blue/30">
                        <PackageFallback size={48} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent mix-blend-overlay"></div>
            </Link>

            {/* Content */}
            <div className="flex-grow">
                <Link href={`/product/${product.id}`}>
                    <h3 className="typo-card-title text-gray-900 leading-tight mb-2 hover:text-brand-blue transition-colors line-clamp-2 min-h-[3rem]">{product.title}</h3>
                </Link>
                <div className="inline-block max-w-full truncate rounded-full border border-brand-blue/15 bg-brand-blue/5 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wide text-brand-blue">
                    SKU: {product.sku || '—'}
                </div>

                {product.benefits?.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 mb-5">
                        {product.benefits.slice(0, 4).map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                                <CheckCircle size={12} className="text-[#00a5df] shrink-0 translate-y-[2px]" />
                                <span className="leading-tight line-clamp-2">{benefit}</span>
                            </div>
                        ))}
                    </div>
                )}

                {product.applicationNote && (
                    <div className="bg-gray-50/50 border-l-4 border-brand-orange px-4 py-3 rounded-r-2xl text-xs text-gray-600 italic leading-relaxed mb-6 border border-gray-100 border-l-brand-orange">
                        <span className="line-clamp-2">{product.applicationNote}</span>
                    </div>
                )}
            </div>

            {/* Footer / Info Hint */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3 mb-4 mt-auto">
                {product.price && <span className="typo-price text-brand-blue">{product.price}</span>}
                <Link href={`/product/${product.id}`} className="text-sm font-semibold text-brand-blue hover:text-brand-orange flex items-center gap-1 transition-colors duration-300 ml-auto">
                    View Details <ArrowRight size={16} />
                </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-2">
                {primaryPhone && (
                    <a href={`tel:${primaryPhone.replace(/\s/g, '')}`} className="flex-1 bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <Phone size={14} /> Call Now
                    </a>
                )}
                {telegramUrl && telegramUrl !== '#' && (
                    <a href={`${telegramUrl}?text=${encodeURIComponent(`Hi, I'm interested in your ${product.title} (${product.sku}).`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-brand-blue hover:bg-[#0088cc] text-white flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5">
                        <TelegramIcon size={14} /> Start Chat
                    </a>
                )}
            </div>
        </div>
    );
};

const PackageFallback = ({ size }: { size: number }) => <Package size={size} className="text-brand-blue/30" aria-hidden />;

export default ProductCard;
