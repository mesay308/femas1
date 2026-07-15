'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans overflow-hidden relative">
            {/* Artistic Background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-orange-50 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <div className="max-w-2xl w-full text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm mb-6">
                        <Search size={40} className="text-[#00a5df]" />
                    </div>
                    <h1 className="text-[12rem] font-black leading-none text-slate-100 absolute left-1/2 -translate-x-1/2 top-0 -z-10 select-none">404</h1>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Route Not Found</h2>
                    <p className="text-xl text-slate-500 font-medium max-w-md mx-auto">
                        The engineering resource you're looking for has moved or no longer exists in our current infrastructure.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
                >
                    <Link 
                        href="/"
                        className="flex items-center gap-3 px-8 py-4 bg-[#00a5df] text-white rounded-2xl font-bold shadow-xl shadow-[#00a5df]/20 hover:-translate-y-1 transition-all"
                    >
                        <Home size={20} />
                        Back to HQ
                    </Link>
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                    >
                        <ArrowLeft size={20} />
                        Previous Station
                    </button>
                </motion.div>

                <div className="mt-20 pt-8 border-t border-slate-100">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">
                        Error Code: 404_INFRASTRUCTURE_MISSING
                    </p>
                </div>
            </div>
        </div>
    );
}
