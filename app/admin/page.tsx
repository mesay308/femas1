'use client';

import { motion } from 'framer-motion';
import { Package, BookOpen, MessageSquare, TrendingUp, Users, ArrowUpRight, Award } from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
    const stats = [
        {
            title: 'Total Products',
            value: '124',
            icon: Package,
            change: '+12%',
            iconColor: 'text-brand-blue',
            bg: 'bg-brand-blue/10'
        },
        {
            title: 'Articles & Insights',
            value: '—',
            icon: BookOpen,
            change: 'Blog',
            iconColor: 'text-brand-orange',
            bg: 'bg-brand-orange/10'
        },
        {
            title: 'New Inquiries',
            value: '28',
            icon: MessageSquare,
            change: '+5 today',
            iconColor: 'text-brand-blue',
            bg: 'bg-brand-blue/10'
        },
        {
            title: 'Site Visits',
            value: '1.2k',
            icon: Users,
            change: '+18%',
            iconColor: 'text-brand-orange',
            bg: 'bg-brand-orange/10'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Welcome Back, Admin</h1>
                <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening across the Femas catalogue today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.iconColor}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="flex items-center gap-1 text-xs font-semibold text-brand-blue bg-brand-blue/10 px-2 py-1 rounded-full border border-brand-blue/15">
                                {stat.change}
                                <TrendingUp size={12} className="text-brand-orange" />
                            </span>
                        </div>

                        <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
                        <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[300px]"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">Performance Overview</h3>
                        <select className="bg-slate-50 border border-slate-200/80 text-sm text-slate-600 rounded-lg px-2 py-2 outline-none cursor-pointer hover:border-brand-blue/30 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        Chart Component Placeholder
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-brand-blue rounded-2xl p-6 text-white relative overflow-hidden border border-brand-blue/80 shadow-lg shadow-brand-blue/20"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/25 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                    <h3 className="font-bold text-xl mb-1 relative z-10">Quick actions</h3>
                    <p className="text-white/85 text-sm mb-6 relative z-10">
                        Primary tasks use your <span className="font-semibold text-white">brand primary</span>; marketing shortcuts use{' '}
                        <span className="font-semibold text-brand-orange">secondary</span>.
                    </p>

                    <div className="space-y-3 relative z-10">
                        <Link
                            href="/admin/products/new"
                            className="w-full bg-white text-brand-blue py-3 rounded-xl flex items-center justify-between px-4 font-semibold text-sm shadow-md hover:bg-white/95 hover:brightness-[1.02] transition-all"
                        >
                            <span>Add new product</span>
                            <ArrowUpRight size={16} aria-hidden />
                        </Link>
                        <Link
                            href="/admin/content/hero"
                            className="w-full bg-brand-orange text-white border border-white/25 py-3 rounded-xl flex items-center justify-between px-4 font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-black/10"
                        >
                            <span>Edit hero slides</span>
                            <ArrowUpRight size={16} aria-hidden />
                        </Link>
                        <Link
                            href="/admin/profile"
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/25 text-white py-3 rounded-xl flex items-center justify-between px-4 font-medium text-sm hover:bg-brand-orange/30 hover:border-brand-orange/50 transition-all"
                        >
                            <span className="flex items-center gap-3">
                                <Award size={18} className="text-brand-orange shrink-0" />
                                Update company profile
                            </span>
                            <ArrowUpRight size={16} className="opacity-90" aria-hidden />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
