'use client';

import { motion } from 'framer-motion';
import { Target, Eye } from 'lucide-react';

interface MissionVisionProps {
    profile: any;
}

const MissionVision = ({ profile }: MissionVisionProps) => {
    const mission = profile?.mission || 'To provide sustainable, high-quality, and reliable solutions that empower our customers and communities.';
    const vision = profile?.vision || 'To be the leading and most trusted engineering partner in East Africa, recognized for our innovation, commitment to quality, and positive impact on society.';

    return (
        <div className="py-4 relative overflow-hidden">
            <div className="max-w-[1200px] mx-auto relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Mission Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="group relative bg-[#f6fafd] bg-gradient-to-br from-white via-[#f6fafd] to-[#f0f9ff] rounded-[2rem] md:rounded-[3rem] p-10 md:p-14 border border-gray-200/50 overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-sm"
                    >
                        <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-blue/10 rounded-full blur-[60px] group-hover:bg-brand-blue/20 group-hover:scale-110 transition-all duration-700 ease-out" />
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 text-brand-blue flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                                <Target size={32} strokeWidth={1.5} />
                            </div>
                            <h2 className="typo-section-h2 text-slate-900 mb-6 flex items-center gap-4 font-bold uppercase tracking-tight">
                                Our Mission
                                <span className="h-px flex-1 bg-gradient-to-r from-brand-blue/20 to-transparent block ml-2"></span>
                            </h2>
                            <p className="typo-body-long text-slate-600 font-medium">
                                {mission}
                            </p>
                        </div>
                    </motion.div>

                    {/* Vision Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="group relative bg-[#f6fafd] bg-gradient-to-br from-white via-[#f6fafd] to-[#f0f9ff] rounded-[2rem] md:rounded-[3rem] p-10 md:p-14 border border-gray-200/50 overflow-hidden hover:-translate-y-2 transition-all duration-500 shadow-sm"
                    >
                        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-700 ease-out" />
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-emerald-100/50 text-emerald-500 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                <Eye size={32} strokeWidth={1.5} />
                            </div>
                            <h2 className="typo-section-h2 text-slate-900 mb-6 flex items-center gap-4 font-bold uppercase tracking-tight">
                                Our Vision
                                <span className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent block ml-2"></span>
                            </h2>
                            <p className="typo-body-long text-slate-600 font-medium">
                                {vision}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default MissionVision;
