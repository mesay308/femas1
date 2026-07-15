'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, LifeBuoy } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#fffafa] flex items-center justify-center p-6 font-sans">
            <div className="max-w-xl w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(249,140,20,0.05)] border border-orange-50"
                >
                    <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <AlertTriangle size={40} className="text-[#f98c14]" />
                    </div>
                    
                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">System Malfunction</h1>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        Our engineering core encountered an unexpected internal error. Technical details have been logged for our maintenance team.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-2xl mb-10 text-left border border-slate-100">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Error Trace</p>
                        <p className="text-xs font-mono text-slate-600 break-words">{error.message || "Unknown system failure"}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={reset}
                            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-[#f98c14] text-white rounded-2xl font-bold shadow-xl shadow-[#f98c14]/20 hover:-translate-y-1 transition-all"
                        >
                            <RefreshCw size={20} />
                            Reboot Module
                        </button>
                        <a
                            href="/contact"
                            className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                        >
                            <LifeBuoy size={20} />
                            Contact Support
                        </a>
                    </div>
                </motion.div>
                
                <p className="mt-8 text-[10px] font-black uppercase text-slate-300 tracking-[0.4em]">
                    Internal Server Feedback Protocol Active
                </p>
            </div>
        </div>
    );
}
