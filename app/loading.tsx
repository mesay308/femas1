'use client';

import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-6">
                {/* Logo Pulse Effect */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-[#00a5df] rounded-full blur-2xl"
                />
                
                {/* Central Loader */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#00a5df]/10 border-t-[#00a5df] rounded-full animate-spin"></div>
                </div>
                
                {/* Inner Icon Placeholder / Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#f98c14] rounded-full shadow-[0_0_10px_#f98c14]"></div>
                </div>
            </div>
            
            <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-2">Syncing Infrastructure</p>
                <div className="flex gap-1 justify-center">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: [0.2, 1, 0.2],
                                scale: [0.8, 1, 0.8]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                            className="w-1.5 h-1.5 bg-[#00a5df] rounded-full"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
