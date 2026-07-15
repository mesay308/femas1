'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    LayoutDashboard,
    Package,
    Megaphone,
    Award,
    ShieldCheck,
    LogOut,
    X,
    Menu as MenuIcon,
    Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import siteConfig from '@/config/siteConfig';
import api from '@/api/axios';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [logoUrl, setLogoUrl] = useState('/logo.png');
    const [avatarBgHex, setAvatarBgHex] = useState('02488a');

    useEffect(() => {
        api.get('/profile').then(res => {
            if (res.data?.logo_light) {
                let cleanPath = res.data.logo_light.startsWith('/') ? res.data.logo_light : `/${res.data.logo_light}`;
                const base = process.env.NEXT_PUBLIC_API_URL || '';
                if (!process.env.NEXT_PUBLIC_API_URL) {
                    if (cleanPath.startsWith('/uploads') && !cleanPath.startsWith('/api/uploads')) {
                        cleanPath = `/api${cleanPath}`;
                    }
                }
                setLogoUrl(base ? `${base}${cleanPath}` : cleanPath);
            }
            const pc = res.data?.primary_color?.toString().trim();
            if (pc) setAvatarBgHex(pc.replace(/^#/, ''));
        }).catch(() => {});
    }, []);
    
    // Track which sidebar groups are expanded
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'manage-product': pathname?.includes('/products') || pathname?.includes('/categories') || pathname?.includes('/attributes'),
        'marketing': pathname?.includes('/content') || pathname?.includes('/clients') || pathname?.includes('/brands') || pathname?.includes('/blogs'),
        'company-data': pathname?.includes('/profile') || pathname?.includes('/contact'),
        'user-role': pathname?.includes('/users') || pathname?.includes('/role')
    });

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const navGroups = [
        {
            id: 'manage-product',
            title: 'Manage Product',
            icon: Package,
            items: [
                { label: 'All Products', path: '/admin/products' },
                { label: 'Add New Product', path: '/admin/products/new' },
                { label: 'All Categories', path: '/admin/categories' },
                { label: 'Add New Category', path: '/admin/categories/new' },
                { label: 'Attributes & Specs', path: '/admin/attributes' },
            ]
        },
        {
            id: 'marketing',
            title: 'Marketing',
            icon: Megaphone,
            items: [
                { label: 'Hero', path: '/admin/content/hero' },
                { label: 'Testimonial', path: '/admin/content/testimonials' },
                { label: 'Clients', path: '/admin/clients' },
                { label: 'Partner Brands', path: '/admin/brands' },
                { label: 'Blog', path: '/admin/blogs' },
            ]
        },
        {
            id: 'company-data',
            title: 'Company Data',
            icon: Award,
            items: [
                { label: 'Profile', path: '/admin/profile' },
                { label: 'Contact Details', path: '/admin/contact-setup' },
            ]
        },
        {
            id: 'user-role',
            title: 'User and Role',
            icon: ShieldCheck,
            items: [
                { label: 'Users', path: '/admin/users' }, 
                { label: 'Roles', path: '/admin/roles' }, 
            ]
        }
    ];

    const filteredNavGroups = useMemo(() => {
        if (!user) return [];
        if (user.is_system_admin) return navGroups;

        const permissions = user.permissions || {};
        return navGroups.filter(group => {
            const sectionPerms = permissions[group.id] || {};
            return sectionPerms.view === true;
        });
    }, [user]);

    const sidebarVariants = {
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    } as const;

    const handleNavClick = () => {
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
    };

    const renderGroup = (group: typeof navGroups[0]) => {
        const isExpanded = expandedGroups[group.id];
        const isAnyItemActive = group.items.some(item => pathname === item.path);

        return (
            <div key={group.id} className="space-y-1">
                <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border-l-[3px] pl-3 pr-2 py-2.5 text-sm font-medium transition-all duration-300 group ${
                        isAnyItemActive
                            ? 'border-brand-orange text-white font-bold bg-white/10'
                            : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <group.icon
                        size={18}
                        className={
                            isAnyItemActive ? 'text-brand-orange' : 'text-white/50 group-hover:text-brand-orange'
                        }
                    />
                    <span>{group.title}</span>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className={`ml-auto ${isExpanded ? 'text-brand-orange' : 'text-white/50 group-hover:text-brand-orange'}`}
                    >
                        <ChevronDown size={14} />
                    </motion.div>
                </button>

                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden pl-11 space-y-1"
                        >
                            {group.items.map((item) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={handleNavClick}
                                        className={`block py-2 px-3 rounded-lg text-xs font-medium transition-all ${isActive
                                            ? 'text-brand-blue bg-white font-bold shadow-sm'
                                            : 'text-white/65 hover:text-brand-orange hover:translate-x-1'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                variants={sidebarVariants}
                initial="open"
                animate={isOpen ? "open" : "closed"}
                className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-blue border-r border-white/10 shadow-xl flex flex-col"
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 mb-2">
                    <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoUrl} alt={siteConfig.companyName} className="h-10 w-auto object-contain drop-shadow-[0_0_2px_white]" />
                        <span className="font-bold text-lg text-white tracking-tight">Admin</span>
                    </Link>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 py-4 px-4 space-y-8 overflow-y-auto scrollbar-hide">
                    <div>
                        <Link
                            href="/admin"
                            onClick={handleNavClick}
                            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden ${pathname === '/admin'
                                ? 'text-brand-blue shadow-md shadow-black/20'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {pathname === '/admin' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white z-0"
                                />
                            )}
                            <LayoutDashboard size={18} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${pathname === '/admin' ? 'text-brand-blue' : 'text-white/50 group-hover:text-white'}`} />
                            <span className="relative z-10">Dashboard</span>
                        </Link>
                    </div>

                    {/* Render first groups: manage-product, marketing, company-data */}
                    {filteredNavGroups
                        .filter(g => g.id !== 'user-role')
                        .map(renderGroup)
                    }

                    <div>
                        <Link
                            href="/admin/media"
                            onClick={handleNavClick}
                            className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group overflow-hidden ${pathname?.startsWith('/admin/media')
                                ? 'text-brand-blue shadow-md shadow-black/20'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {pathname?.startsWith('/admin/media') && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white z-0"
                                />
                            )}
                            <ImageIcon size={18} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${pathname?.startsWith('/admin/media') ? 'text-brand-blue' : 'text-white/50 group-hover:text-white'}`} />
                            <span className="relative z-10">Media Gallery</span>
                        </Link>
                    </div>

                    {/* Render user-role group */}
                    {filteredNavGroups
                        .filter(g => g.id === 'user-role')
                        .map(renderGroup)
                    }
                </nav>

                <div className="p-4 border-t border-white/10 bg-black/20 ring-1 ring-inset ring-brand-orange/25">
                    <div 
                        onClick={logout}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group border border-transparent hover:border-white/10"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={(user as any)?.profile_image ? (() => {
                                let cleanPath = (user as any).profile_image.startsWith('/') ? (user as any).profile_image : `/${(user as any).profile_image}`;
                                const base = process.env.NEXT_PUBLIC_API_URL || '';
                                if (!process.env.NEXT_PUBLIC_API_URL) {
                                    if (cleanPath.startsWith('/uploads') && !cleanPath.startsWith('/api/uploads')) {
                                        cleanPath = `/api${cleanPath}`;
                                    }
                                }
                                return base ? `${base}${cleanPath}` : cleanPath;
                            })() : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Admin')}&background=${avatarBgHex}&color=fff`}
                            alt={user?.full_name || 'Admin'}
                            className="w-10 h-10 rounded-full shadow-md ring-2 ring-white/20 object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white group-hover:text-brand-orange transition-colors">{user?.full_name || 'Admin User'}</p>
                            <p className="text-xs text-white/60 truncate capitalize">{user?.role || 'Admin Panel'}</p>
                        </div>
                        <LogOut size={18} className="text-white/50 group-hover:text-red-400 transition-colors" />
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
