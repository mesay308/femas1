'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake, Zap, Award, Target, Rocket, Settings, Briefcase, Droplets, Users } from 'lucide-react';
import siteConfig from '@/config/siteConfig';

interface CoreValuesProps {
    values: any[];
}

const CoreValues = ({ values }: CoreValuesProps) => {
    const getIcon = (title: string, index: number) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('integr') || lowerTitle.includes('trust')) return ShieldCheck;
        if (lowerTitle.includes('customer') || lowerTitle.includes('partner')) return HeartHandshake;
        if (lowerTitle.includes('innovat') || lowerTitle.includes('agil')) return Zap;
        if (lowerTitle.includes('qualit') || lowerTitle.includes('excel')) return Award;
        if (lowerTitle.includes('focu') || lowerTitle.includes('result')) return Target;
        if (lowerTitle.includes('water') || lowerTitle.includes('pump')) return Droplets;
        if (lowerTitle.includes('team') || lowerTitle.includes('people')) return Users;

        const fallbacks = [ShieldCheck, Zap, Award, Rocket, Settings, Briefcase];
        return fallbacks[index % fallbacks.length];
    };

    return (
        <div className="py-4 relative">
            <div className="max-w-[1200px] mx-auto">

                {values && values.length > 0 && values[0].title !== '' && (
                    <div className="mb-16">
                        <div className="text-center mb-12 max-w-3xl mx-auto">
                            <span className="typo-kicker text-brand-blue inline-flex items-center gap-2 mb-4 font-bold uppercase tracking-wider">Our DNA</span>
                            <h2 className="typo-section-h2 text-slate-900 font-bold uppercase tracking-tight">Core Values</h2>
                            <p className="typo-card-desc text-slate-500 mt-4 font-medium">The foundational principles that guide every decision, project, and relationship at {siteConfig.companyName}.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {values.map((val, idx) => {
                                const IconComp = getIcon(val.title, idx);
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                                        className="group relative bg-[#f6fafd] bg-gradient-to-br from-white via-[#f6fafd] to-[#f0f9ff] rounded-[2rem] p-8 border border-gray-200/50 hover:border-brand-blue/40 hover:-translate-y-2 transition-all duration-500 overflow-hidden shadow-sm"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                        <div className="relative z-10">
                                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-brand-blue mb-6 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white transition-all duration-500">
                                                <IconComp size={26} strokeWidth={1.5} />
                                            </div>
                                            <h3 className="typo-card-title text-slate-900 mb-3 group-hover:text-brand-blue transition-colors font-bold">{val.title}</h3>
                                            <p className="typo-card-desc text-slate-500 leading-relaxed font-medium">{val.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default CoreValues;
