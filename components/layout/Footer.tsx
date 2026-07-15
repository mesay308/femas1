'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Linkedin, Youtube, BadgeCheck, Award, Shield, MessageCircle } from 'lucide-react';
import siteConfig from '@/config/siteConfig';
import api from '@/api/axios';

type Category = {
    category_id: string;
    name: string;
    slug: string;
    parent_category_id?: string | null;
    is_active?: boolean;
    display_order?: number;
};

const Footer = ({ logoUrl = '/logo.png' }: { logoUrl?: string }) => {
    const [settings, setSettings] = useState<any>(null);
    const [topCategories, setTopCategories] = useState<Category[]>([]);

    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data)).catch(() => {});

        api.get('/categories').then(res => {
            const all: Category[] = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            const topLevel = all
                .filter(c => c.is_active !== false && !c.parent_category_id)
                .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                .slice(0, 6);
            setTopCategories(topLevel);
        }).catch(() => {});
    }, []);

    const primaryPhone = settings?.primary_phone || '';
    const salesEmail = settings?.sales_email || '';
    const supportEmail = settings?.support_email || '';
    const address = settings?.address || '';
    const whatsappNumber = settings?.whatsapp_number || primaryPhone;
    const tagline = settings?.tagline || siteConfig.companyTagline;
    const brandName = settings?.brand_name || siteConfig.companyName;
    const legalName = settings?.legal_name || siteConfig.companyLegalName;

    return (
        <footer className="bg-[#1a202c] text-gray-300 pt-20 pb-10 border-t-4 border-brand-blue">
            <div className="container mx-auto px-4 max-w-[1440px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: About */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-brand-blue relative">
                                <Image src={logoUrl} alt={brandName} fill className="object-contain p-1" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg leading-tight">{brandName}</h3>
                            </div>
                        </Link>

                        {tagline && (
                            <p className="typo-footer-link text-gray-400">
                                {tagline}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-gray-300">
                                <BadgeCheck size={14} className="text-brand-blue" /> Turkish Engineering
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-gray-300">
                                <Award size={14} className="text-brand-orange" /> Bespoke Integration
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-gray-300">
                                <Shield size={14} className="text-green-500" /> Certified Safe
                            </div>
                        </div>

                        {address && (
                            <div className="flex items-start gap-3 typo-footer-link text-gray-400 mt-4">
                                <MapPin size={18} className="text-brand-blue mt-0.5 shrink-0" />
                                <span className="leading-snug">{address}</span>
                            </div>
                        )}
                    </div>

                    {/* Column 2: Solutions (dynamic from /api/categories) */}
                    <div>
                        <h3 className="typo-footer-heading text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-brand-orange rounded-full"></span>
                            Our Product Lines
                        </h3>
                        <ul className="space-y-3.5">
                            {topCategories.length > 0 ? (
                                topCategories.map(cat => (
                                    <li key={cat.category_id}>
                                        <Link
                                            href={`/category/${cat.slug}`}
                                            className="typo-footer-link text-gray-400 hover:text-brand-blue hover:pl-1 transition-all flex items-center gap-2"
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li>
                                    <Link
                                        href="/products"
                                        className="typo-footer-link text-gray-400 hover:text-brand-blue hover:pl-1 transition-all flex items-center gap-2"
                                    >
                                        Browse All Products
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Column 3: Connect & Support */}
                    <div>
                        <h3 className="typo-footer-heading text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-brand-blue rounded-full"></span>
                            Get In Touch
                        </h3>
                        <div className="space-y-5">
                            {primaryPhone && (
                                <a href={`tel:${primaryPhone.replace(/\s+/g, '')}`} className="flex items-center gap-4 group">
                                    <div className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-brand-blue transition-colors border border-white/10">
                                        <Phone size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="typo-kicker text-gray-500 group-hover:text-brand-blue transition-colors">Call Us 24/7</p>
                                        <p className="text-white font-bold tracking-wide">{primaryPhone}</p>
                                    </div>
                                </a>
                            )}

                            {whatsappNumber && (
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors border border-white/10">
                                        <MessageCircle size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="typo-kicker text-gray-500 group-hover:text-green-500 transition-colors">Chat on Whatsapp</p>
                                        <p className="text-white font-medium">{whatsappNumber}</p>
                                    </div>
                                </div>
                            )}

                            {salesEmail && (
                                <a href={`mailto:${salesEmail}`} className="flex items-center gap-4 group">
                                    <div className="w-11 h-11 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-brand-orange transition-colors border border-white/10">
                                        <Mail size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="typo-kicker text-gray-500 group-hover:text-brand-orange transition-colors">Sales Email</p>
                                        <p className="text-white font-medium text-sm">{salesEmail}</p>
                                    </div>
                                </a>
                            )}

                            {supportEmail && (
                                <a href={`mailto:${supportEmail}`} className="flex items-center gap-4 group px-4 py-2 bg-white/5 rounded-xl border border-white/10 hover:border-brand-blue/30 hover:bg-white/10 transition-all">
                                    <Shield size={16} className="text-gray-400 group-hover:text-brand-blue" />
                                    <span className="text-sm font-medium text-gray-300">{supportEmail}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Column 4: Stay Informed */}
                    <div>
                        <h3 className="typo-footer-heading text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                            Stay Informed
                        </h3>
                        <p className="typo-footer-link text-gray-400 mb-4">
                            Subscribe for new Femas product launches, custom design services, and kitchen improvement tips for Ethiopian homes.
                        </p>

                        <form className="relative mb-8" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
                            />
                            <button className="absolute right-1 top-1 bottom-1 bg-brand-blue hover:bg-blue-600 text-white px-4 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors">
                                Join
                            </button>
                        </form>

                        <div className="flex gap-3">
                            {settings?.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#1877F2] hover:text-white text-gray-400 transition-all"><Facebook size={18} /></a>
                            )}
                            {settings?.telegram_url && (
                                <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#0088cc] hover:text-white text-gray-400 transition-all"><MessageCircle size={18} /></a>
                            )}
                            {settings?.linkedin_url && (
                                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#0A66C2] hover:text-white text-gray-400 transition-all"><Linkedin size={18} /></a>
                            )}
                            {settings?.youtube_url && (
                                <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#FF0000] hover:text-white text-gray-400 transition-all"><Youtube size={18} /></a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 typo-footer-copy text-gray-500">
                    <p>&copy; {new Date().getFullYear()} {legalName}. All rights reserved.</p>

                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-brand-blue transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-brand-blue transition-colors">Terms of Service</Link>
                        <Link href="/sitemap.xml" className="hover:text-brand-blue transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
