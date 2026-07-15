'use client';

import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Map as MapIcon } from 'lucide-react';

interface GlobalPresenceProps {
    addresses: any[];
    emails: any[];
    phones: any[];
}

const GlobalPresence = ({ addresses, emails, phones }: GlobalPresenceProps) => {
    if (!addresses || addresses.length === 0) return null;

    // Use the first phone and email as primary contact for the headquarters
    const primaryPhone = phones && phones.length > 0 ? phones[0].phone_number : null;
    const primaryEmail = emails && emails.length > 0 ? emails[0].email_address : null;

    return (
        <div className="py-4 relative">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full typo-kicker mb-4 border border-emerald-100 font-bold uppercase tracking-wider">
                        <Globe size={14} /> Our Reach
                    </span>
                    <h2 className="typo-section-h2 text-slate-900 mb-4 font-bold uppercase tracking-tight">Geographic Presence</h2>
                    <p className="typo-card-desc text-slate-500 max-w-2xl mx-auto font-medium">Strategically located to support industrial, agricultural, and commercial operations across the nation.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Headquarters / Main Branch */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:col-span-3 bg-slate-950 text-white rounded-[2rem] md:rounded-[3rem] p-10 md:p-14 overflow-hidden relative shadow-lg border border-slate-800"
                    >
                        {/* Decorative map background */}
                        <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none flex items-center justify-end pr-12">
                            <MapIcon size={400} strokeWidth={0.5} />
                        </div>
                        <div className="absolute -top-[50%] -left-[10%] w-[80%] h-[150%] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
                        
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-brand-blue/20 border border-brand-blue/30 text-blue-300 px-4 py-1.5 rounded-full typo-kicker mb-8 shadow-[0_0_20px_rgba(37,99,235,0.2)] font-bold uppercase tracking-wider">
                                    Headquarters
                                </div>
                                <h3 className="typo-section-h2 text-white mb-8 font-bold uppercase tracking-tight">{addresses[0].branch_name || 'Main Office'}</h3>
                                
                                <ul className="space-y-6">
                                    <li className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <MapPin size={20} className="text-brand-orange" />
                                        </div>
                                        <div>
                                            <span className="typo-kicker text-brand-orange mb-3 block font-bold uppercase tracking-wider">Location</span>
                                            <p className="font-bold text-lg">{addresses[0].address}</p>
                                            <p className="text-white/60 font-medium">{addresses[0].city}, {addresses[0].country}</p>
                                        </div>
                                    </li>
                                    
                                    {primaryPhone && (
                                        <li className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                <Phone size={20} className="text-brand-blue" />
                                            </div>
                                            <div>
                                                <span className="typo-kicker text-brand-blue mb-1 block font-bold uppercase tracking-wider">Contact</span>
                                                <p className="font-bold text-lg">{primaryPhone}</p>
                                            </div>
                                        </li>
                                    )}

                                    {primaryEmail && (
                                        <li className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                                <Mail size={20} className="text-brand-blue" />
                                            </div>
                                            <div>
                                                <span className="typo-kicker text-brand-blue mb-1 block font-bold uppercase tracking-wider">General Inquiries</span>
                                                <p className="font-bold text-lg">{primaryEmail}</p>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </div>
                            
                            {/* Embedded Map */}
                            <div className="aspect-video lg:aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-900/50 border border-white/10 relative shadow-2xl group">
                                <div className="absolute inset-0 bg-brand-blue/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
                                {addresses[0].google_map_embed_url ? (
                                    <iframe 
                                        src={addresses[0].google_map_embed_url} 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }} 
                                        allowFullScreen={false} 
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Headquarters Location"
                                        className="filter grayscale-[40%] contrast-[1.1] opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                                    ></iframe>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                                        <MapPin size={64} className="mb-4 opacity-50" />
                                        <p className="typo-kicker font-bold uppercase tracking-wider">Map Data Unavailable</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Other Branches */}
                    {addresses.slice(1).map((address, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                            className="group bg-[#f6fafd] bg-gradient-to-br from-white via-[#f6fafd] to-[#f0f9ff] border border-gray-200/50 rounded-[2rem] p-8 md:p-10 hover:border-brand-blue/30 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full typo-badge mb-6 group-hover:bg-brand-blue/10 group-hover:text-brand-blue transition-colors font-bold uppercase tracking-wider">
                                    Regional Branch
                                </div>
                                <h2 className="typo-card-title text-xl text-slate-900 mb-3 font-bold">{address.branch_name}</h2>
                                <div className="flex items-start gap-3 text-slate-600 mb-6 font-medium">
                                    <MapPin size={20} className="text-brand-blue shrink-0 mt-0.5" />
                                    <span className="typo-card-desc text-lg leading-relaxed">{address.address}, {address.city}</span>
                                </div>
                                
                                {address.google_map_embed_url && (
                                    <a 
                                        href={address.google_map_embed_url.match(/src="([^"]+)"/)?.[1] || "#"} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 typo-kicker text-brand-orange hover:text-orange-600 transition-colors mt-4 group/link font-bold uppercase tracking-wider"
                                    >
                                        View on Map <span className="group-hover/link:translate-x-1 transition-transform">&rarr;</span>
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GlobalPresence;
