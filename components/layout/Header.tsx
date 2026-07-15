'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Phone, ChevronDown, Menu, User, Facebook, Linkedin, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MegaMenu from './MegaMenu';
import SearchOverlay from './SearchOverlay';
import QuoteModal from './QuoteModal';
import siteConfig from '@/config/siteConfig';
import api from '@/api/axios';

const Header = ({ logoUrl = '/logo.png' }: { logoUrl?: string }) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [settings, setSettings] = useState<any>(null);

    // Load site settings from API
    useEffect(() => {
        api.get('/settings').then(res => setSettings(res.data)).catch(() => {});
    }, []);

    const primaryPhone = settings?.primary_phone || '';
    const secondaryPhone = settings?.secondary_phone || '';
    const telegramUrl = settings?.telegram_url || '#';
    const linkedinUrl = settings?.linkedin_url || '#';
    const facebookUrl = settings?.facebook_url || '#';
    const youtubeUrl = settings?.youtube_url || '#';

    // Handle scroll effect for compacting header if needed
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const handleOpenQuote = () => setIsQuoteOpen(true);
        window.addEventListener('open-quote-modal', handleOpenQuote);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('open-quote-modal', handleOpenQuote);
        };
    }, []);

    // Language Switcher Logic
    const [currentLang, setCurrentLang] = useState('en');

    useEffect(() => {
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
        }
        const langCookie = getCookie('googtrans');
        if (langCookie) {
            const lang = langCookie.split('/').pop();
            if (lang && ['en', 'am', 'om', 'tr'].includes(lang)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCurrentLang(lang);
            }
        }
    }, []);

    const changeLanguage = (lang: string) => {
        const cookieValue = `/en/${lang}`;
        document.cookie = `googtrans=${cookieValue}; path=/;`;
        document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
        window.location.reload();
    };

    interface NavItem {
        name: string;
        href?: string;
        hasMegaMenu?: boolean;
        hasDropdown?: boolean;
        subItems?: Array<{ label: string; desc: string; href: string }>;
    }

    const navItems: NavItem[] = [
        { name: 'HOME', href: '/' },
        { name: 'PRODUCTS', href: '/products', hasMegaMenu: true },
        { name: 'WHO WE ARE', href: '/who-we-are' },
        { name: 'RESOURCES', href: '/resources' },
        { name: 'CONTACT', href: '/contact' }
    ];

    return (
        <>
            {/* Top Header - Premium Modern Design */}
            <div className="relative bg-brand-blue z-50 shadow-md border-b border-black/5">
                {/* Dynamic Ambient Glows & Gradients */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {/* Femas Primary Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-blue via-brand-blue to-brand-blue/80"></div>
                    
                    {/* Glowing Orbs */}
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
                    <div className="absolute top-1/2 right-[15%] w-64 h-64 bg-brand-orange/40 rounded-full blur-[80px] transform -translate-y-1/2"></div>
                    
                    {/* Subtle Texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.04]"></div>
                </div>

                <div className="container mx-auto px-4 max-w-[1440px] relative z-10 h-[96px] flex items-center justify-between">

                    {/* Left: Logo & Company Name */}
                    <Link href="/" className="flex items-center gap-5 group">
                        {/* Logo */}
                        <div className="relative h-[60px] w-[160px] md:h-[80px] md:w-[220px] flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                            {logoUrl ? (
                                <Image 
                                    src={logoUrl} 
                                    alt={siteConfig.companyName} 
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <span className="text-3xl md:text-5xl font-matura tracking-wide text-white drop-shadow-md">
                                    {siteConfig.companyName}
                                </span>
                            )}
                        </div>
                    </Link>

                    {/* Right: Contact, Socials, Lang, User */}
                    <div className="flex items-center justify-end gap-5 text-white">

                        {/* Social Icons & Phone Container */}
                        <div className="hidden lg:flex items-center gap-6 mr-2">
                            {/* Phones Row - Premium typography */}
                            <div className="flex flex-col items-end justify-center">
                                {primaryPhone && (
                                    <div className="flex items-center gap-2 group/phone cursor-pointer">
                                        <div className="p-1.5 rounded-full bg-white/20 text-white transition-all duration-300 group-hover/phone:bg-white group-hover/phone:text-brand-blue shadow-sm">
                                            <Phone size={14} className="fill-current" />
                                        </div>
                                        <span className="font-semibold tracking-wide text-white transition-colors text-[15px] drop-shadow-sm">{primaryPhone}</span>
                                    </div>
                                )}
                                {secondaryPhone && (
                                    <div className="flex items-center gap-2 mt-1 opacity-80 hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-medium tracking-wider text-white drop-shadow-sm">{secondaryPhone}</span>
                                    </div>
                                )}
                            </div>

                            {/* Separator */}
                            <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>

                            {/* Socials Row - Glassmorphism buttons */}
                            <div className="flex items-center gap-2.5">
                                {settings?.telegram_url && (
                                    <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" className="relative p-2 rounded-xl bg-white/5 hover:bg-[#0088cc] text-slate-300 hover:text-white border border-white/10 hover:border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,136,204,0.3)] group/social overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity"></div>
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 relative z-10">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.638z" />
                                        </svg>
                                    </a>
                                )}
                                {settings?.linkedin_url && (
                                    <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="relative p-2 rounded-xl bg-white/5 hover:bg-[#0A66C2] text-slate-300 hover:text-white border border-white/10 hover:border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(10,102,194,0.3)] group/social overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity"></div>
                                        <Linkedin size={16} className="relative z-10" />
                                    </a>
                                )}
                                {settings?.facebook_url && (
                                    <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="relative p-2 rounded-xl bg-white/5 hover:bg-[#1877F2] text-slate-300 hover:text-white border border-white/10 hover:border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(24,119,242,0.3)] group/social overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity"></div>
                                        <Facebook size={16} className="relative z-10" />
                                    </a>
                                )}
                                {settings?.youtube_url && (
                                    <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="relative p-2 rounded-xl bg-white/5 hover:bg-[#FF0000] text-slate-300 hover:text-white border border-white/10 hover:border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(255,0,0,0.3)] group/social overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover/social:opacity-100 transition-opacity"></div>
                                        <Youtube size={16} className="relative z-10" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Mobile Phone Icon */}
                        {primaryPhone && (
                            <a href={`tel:${primaryPhone.replace(/\s/g, '')}`} className="lg:hidden bg-brand-orange text-white p-2.5 rounded-xl shadow-lg">
                                <Phone size={18} className="fill-current" />
                            </a>
                        )}

                        {/* Action Buttons: Lang & User - Integrated pill design */}
                        <div className="flex items-center bg-white/20 border border-white/30 rounded-2xl p-1 backdrop-blur-md shadow-sm">
                            {/* Language Switcher */}
                            <div className="relative group">
                                <button className="text-white hover:bg-white/20 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition uppercase tracking-wider drop-shadow-sm">
                                    {currentLang === 'en' ? 'EN' : currentLang === 'am' ? 'AM' : currentLang === 'om' ? 'OM' : currentLang === 'tr' ? 'TR' : 'EN'}
                                    <ChevronDown size={14} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                                </button>
                                {/* Dropdown */}
                                <div className="absolute top-full right-0 pt-3 hidden group-hover:block w-full min-w-[100px] z-50">
                                    <div className="bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden py-1">
                                        <button onClick={() => changeLanguage('en')} className="block w-full text-center px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-xs font-bold transition-colors">English</button>
                                        <button onClick={() => changeLanguage('am')} className="block w-full text-center px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-xs font-bold transition-colors">Amharic</button>
                                        <button onClick={() => changeLanguage('om')} className="block w-full text-center px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-xs font-bold transition-colors">Oromifa</button>
                                        <button onClick={() => changeLanguage('tr')} className="block w-full text-center px-4 py-2.5 hover:bg-gray-50 text-gray-800 text-xs font-bold transition-colors">Turkish</button>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[1px] h-5 bg-white/40 mx-1"></div>

                            {/* User Icon */}
                            <Link href="/admin" className="text-brand-orange hover:text-white px-3 py-2 rounded-xl hover:bg-brand-orange transition-all duration-300 flex items-center justify-center drop-shadow-sm">
                                <User size={18} strokeWidth={2.5} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar - Sticky */}
            <header className={`sticky top-0 w-full z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-all duration-300 ${scrolled ? 'h-11' : 'h-[52px]'}`}>
                <div className="container mx-auto px-4 max-w-[1440px] h-full flex items-center justify-between">

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1 xl:gap-6 h-full mr-auto">
                        {navItems.map((item) => (
                            <div
                                key={item.name}
                                className="h-full flex items-center relative group"
                                onMouseEnter={() => (item.hasMegaMenu || item.hasDropdown) && setActiveMenu(item.name)}
                                onMouseLeave={() => setActiveMenu(null)}
                            >
                                <Link
                                    href={item.href || (item.hasDropdown ? '/who-we-are' : '#')}
                                    className={`px-3 py-2 rounded-lg flex items-center gap-1.5 text-base font-medium transition-all ${activeMenu === item.name ? 'text-brand-blue font-bold bg-brand-blue/5 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-300 hover:text-brand-blue hover:bg-brand-blue/5 dark:hover:bg-gray-800'}`}
                                >
                                    {item.name}
                                    {(item.hasMegaMenu || item.hasDropdown || ['BRANDS', 'SERVICES', 'RESOURCES'].includes(item.name)) && <ChevronDown size={14} strokeWidth={2.5} className="opacity-70" />}
                                </Link>

                                {/* Mega Menu Dropdown */}
                                <AnimatePresence>
                                    {activeMenu === item.name && item.hasMegaMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="fixed left-0 right-0 top-[calc(100%)] w-full bg-white dark:bg-gray-900 shadow-xl border-t border-gray-100 dark:border-gray-800 p-8 z-40 max-h-[80vh] overflow-y-auto"
                                        >
                                            <div className="container mx-auto">
                                                <MegaMenu category={item.name} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Simple Dropdown for WHO WE ARE */}
                                <AnimatePresence>
                                    {activeMenu === item.name && item.hasDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="fixed left-0 right-0 top-[calc(100%)] w-full bg-white dark:bg-gray-900 shadow-xl border-t border-gray-100 dark:border-gray-800 p-8 z-40"
                                        >
                                            <div className="container mx-auto max-w-[1440px]">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                                    <div className="lg:col-span-1">
                                                        <h4 className="font-bold text-brand-blue dark:text-brand-blue mb-4 border-b dark:border-gray-700 pb-2 uppercase tracking-wider text-xs">Organization</h4>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">Discover Femas Kitchen Appliance, bringing advanced Turkish engineering and custom kitchen cabinetry solutions to homes in Addis Ababa, Ethiopia.</p>
                                                        <Link href="/who-we-are" onClick={() => setActiveMenu(null)} className="inline-flex items-center gap-2 text-brand-blue font-bold text-[10px] uppercase tracking-[0.1em] hover:gap-3 transition-all">
                                                            Detailed Profile <ChevronDown size={14} className="-rotate-90" />
                                                        </Link>
                                                    </div>

                                                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                                        {item.subItems?.map((sub, idx) => (
                                                            <div key={idx}>
                                                                <Link
                                                                    href={sub.href}
                                                                    onClick={() => setActiveMenu(null)}
                                                                    className="group block"
                                                                >
                                                                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-blue transition-colors mb-1 uppercase tracking-wider">
                                                                        {sub.label}
                                                                    </div>
                                                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug font-medium">
                                                                        {sub.desc}
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </nav>

                    {/* Utility Icons (Search + Call) */}
                    <div className="hidden lg:flex items-center gap-2">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-brand-blue transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <Search size={20} />
                        </button>

                        {/* Call Icon */}
                        {primaryPhone && (
                            <a href={`tel:${primaryPhone.replace(/\s/g, '')}`} className="p-2.5 text-brand-blue hover:bg-brand-blue/10 rounded-full transition" aria-label="Call Us">
                                <Phone size={20} className="fill-current" />
                            </a>
                        )}

                        <button
                            onClick={() => setIsQuoteOpen(true)}
                            className="ml-2 bg-brand-orange hover:bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Bulk Order Inquiry
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className="lg:hidden p-2 text-gray-700 dark:text-gray-200 ml-auto" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu size={24} />
                    </button>
                </div>

                {/* Mobile Menu Drawer */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="lg:hidden bg-white border-b border-gray-100 overflow-hidden absolute top-full left-0 w-full shadow-lg"
                        >
                            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <div key={item.name} className="border-b border-gray-50 last:border-none pb-2">
                                        {item.hasMegaMenu || item.hasDropdown ? (
                                            <>
                                                <div className="flex items-center justify-between py-2 text-gray-800 font-semibold cursor-pointer hover:text-brand-blue" onClick={() => setActiveMenu(activeMenu === item.name ? null : item.name)}>
                                                    {item.name}
                                                    <ChevronDown size={16} className={`transition-transform ${activeMenu === item.name ? 'rotate-180' : ''}`} />
                                                </div>

                                                {/* Mobile Submenu */}
                                                <AnimatePresence>
                                                    {activeMenu === item.name && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            className="overflow-hidden pl-4 text-sm text-gray-600 flex flex-col gap-2"
                                                        >
                                                            {item.hasDropdown && item.subItems && (
                                                                <>
                                                                    {item.subItems.map((sub, idx) => (
                                                                        <Link
                                                                            key={idx}
                                                                            href={sub.href}
                                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                                            className="py-1 block hover:text-brand-blue"
                                                                        >
                                                                            {sub.label}
                                                                        </Link>
                                                                    ))}
                                                                </>
                                                            )}
                                                            {item.name === 'PRODUCTS' && (
                                                                <>
                                                                    <Link href="/category/freestanding-stoves" className="py-1 block hover:text-brand-blue">Freestanding Stoves</Link>
                                                                    <Link href="/category/round-ovens" className="py-1 block hover:text-brand-blue">Round Ovens</Link>
                                                                    <Link href="/category/custom-cabinetry" className="py-1 block hover:text-brand-blue">Custom Cabinetry</Link>
                                                                    <Link href="/products" className="py-1 block hover:text-brand-blue">View All Products</Link>
                                                                </>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </>
                                        ) : (
                                            <Link
                                                href={item.href || '#'}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="block py-2 text-gray-800 font-semibold hover:text-brand-blue"
                                            >
                                                {item.name}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                                {/* Mobile Utility Links */}
                                <div className="flex flex-col gap-3 mt-4">
                                    <button
                                        onClick={() => {
                                            setIsQuoteOpen(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="bg-brand-blue text-white w-full py-3 rounded-lg font-semibold"
                                    >
                                        Bulk Order Inquiry
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
        </>
    );
};

export default Header;
