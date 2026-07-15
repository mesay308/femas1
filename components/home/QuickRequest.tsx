'use client';

import { Send, Clock, BadgeCheck, Phone, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/api/axios';

const QuickRequest = () => {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        api.get('/profile').then(res => setProfile(res.data)).catch(() => {});
    }, []);

    const salesPhone = profile?.sales_contacts?.[0]?.phone || '';

    return (
        <section className="py-24 bg-zinc-50 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(0,165,223,0.05),transparent)] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10 w-full max-w-[1440px]">
                <div className="bg-white rounded-[48px] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col lg:flex-row min-h-[700px]">

                    {/* Left Side: Contact Info (Dark Card) */}
                    <div className="lg:w-2/5 bg-gray-900 p-12 lg:p-16 text-white relative flex flex-col">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10 flex-grow">
                            <span className="inline-block px-4 py-1.5 bg-white/10 text-white typo-kicker rounded-full mb-8 border border-white/10">
                                Contact Hub
                            </span>
                            <h2 className="typo-section-h2 text-white mb-8 leading-tight">
                                Get a quote or <br />
                                <span className="text-brand-orange">partner with Femas.</span>
                            </h2>
                            <p className="text-gray-400 typo-card-desc mb-12 leading-relaxed font-normal">
                                Our sales team is ready to help you choose the best kitchen appliances, get custom cabinet dimensions, or apply to become an official retail partner.
                            </p>
                            
                            <div className="space-y-8">
                                <a href={`tel:${salesPhone.replace(/\s+/g, '')}`} className="flex items-center gap-6 group">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-300">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <div className="typo-kicker text-gray-500 mb-1">Sales Hotline</div>
                                        <div className="text-xl font-semibold group-hover:text-brand-orange transition-colors">{salesPhone}</div>
                                    </div>
                                </a>
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-blue">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <div className="typo-kicker text-gray-500 mb-1">Response Time</div>
                                        <div className="text-xl font-semibold">Within 10 Minutes</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-green-500">
                                        <BadgeCheck size={24} />
                                    </div>
                                    <div>
                                        <div className="typo-kicker text-gray-500 mb-1">Sales</div>
                                        <div className="text-xl font-semibold">Free Bulk Quotes</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-16 pt-12 border-t border-white/10 flex items-center gap-4 typo-card-meta text-gray-500">
                            <span className="w-8 h-[1px] bg-brand-orange opacity-40"></span>
                            Partnering for your success.
                        </div>
                    </div>

                    {/* Right Side: Request Form (Pristine White) */}
                    <div className="lg:w-3/5 p-12 lg:p-20 flex flex-col justify-center">
                        <div className="max-w-xl mx-auto w-full">
                            <div className="mb-10 text-center lg:text-left">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request a Call Back</h3>
                                <p className="typo-card-desc text-gray-500">Tell us about your project and we&apos;ll reach out shortly.</p>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="typo-form-label text-gray-400 uppercase tracking-wide ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue focus:bg-white outline-none transition-all duration-300 font-normal"
                                            placeholder="e.g. Almaz Tadesse"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="typo-form-label text-gray-400 uppercase tracking-wide ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue focus:bg-white outline-none transition-all duration-300 font-normal"
                                            placeholder="+1 555 123 4567"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="typo-form-label text-gray-400 uppercase tracking-wide ml-1">I&apos;m interested in...</label>
                                    <div className="relative">
                                        <select className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue focus:bg-white outline-none transition-all duration-300 cursor-pointer appearance-none font-medium">
                                            <option>Femaslux 60x60 Freestanding Dual-Fuel Stove & Oven</option>
                                            <option>Lux Compact Round Oven (1300W)</option>
                                            <option>Femaslux 50x50 Freestanding Dual-Fuel Stove & Oven</option>
                                            <option>Femaslux 60x90 Freestanding 6-Burner Dual-Fuel Stove & Oven</option>
                                            <option>Femaslux 50x50 Freestanding All-Electric Stove & Oven</option>
                                            <option>Premium Custom-Made Kitchen Cabinet System</option>
                                            <option>Become a Retailer / Distributor</option>
                                            <option>General Inquiry</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-semibold py-5 rounded-2xl shadow-xl shadow-brand-blue/20 hover:shadow-brand-blue/30 transform hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3"
                                    >
                                        <Send size={20} />
                                        Send Request Now
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-6 mt-8">
                                    <div className="flex items-center gap-2 typo-kicker text-gray-400 font-bold uppercase tracking-wider">
                                        <CheckCircle2 size={14} className="text-green-500" /> Secure Data
                                    </div>
                                    <div className="flex items-center gap-2 typo-kicker text-gray-400 font-bold uppercase tracking-wider">
                                        <CheckCircle2 size={14} className="text-green-500" /> Private
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default QuickRequest;
