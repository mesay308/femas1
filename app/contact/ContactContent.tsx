'use client';

import { useState, useEffect } from 'react';
import api from '@/api/axios';
import HeroSection from '@/components/shared/HeroSection';
import PageSkeleton from '@/components/shared/PageSkeleton';

export default function ContactContent() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        api.get('/settings')
            .then((res) => {
                if (!cancelled) setSettings(res.data || null);
            })
            .catch(() => {
                if (!cancelled) setSettings(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    const phone = settings?.primary_phone || '';
    const email = settings?.sales_email || settings?.company_email || '';
    const address = settings?.address || '';

    return (
        <>
            <HeroSection
                slug="contact"
                fallback={{
                    eyebrow: 'Get in touch',
                    title: 'Talk to the Femas Team',
                    subtitle:
                        'Looking to order Femas appliances, request cabinetry custom sizing, or partner with us? Our team is one click away.',
                }}
            />
            {loading ? (
                <PageSkeleton message="Loading contact details..." />
            ) : (
                <div className="bg-[#f8fafc] pb-20 pt-16">
                    <div className="site-container">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm">
                                <h2 className="typo-section-h2 text-slate-900 mb-8 font-bold uppercase tracking-tight">Direct Support</h2>
                                <div className="space-y-8">
                                    {phone && (
                                        <div>
                                            <span className="typo-kicker text-brand-orange mb-2 block font-bold uppercase tracking-wider">Call Us</span>
                                            <p className="text-2xl font-bold text-slate-900">{phone}</p>
                                        </div>
                                    )}
                                    {email && (
                                        <div>
                                            <span className="typo-kicker text-brand-blue mb-2 block font-bold uppercase tracking-wider">Email Us</span>
                                            <p className="text-2xl font-bold text-slate-900">{email}</p>
                                        </div>
                                    )}
                                    {address && (
                                        <div>
                                            <span className="typo-kicker text-slate-500 mb-2 block font-bold uppercase tracking-wider">Visit Us</span>
                                            <p className="text-lg font-medium text-slate-600">{address}</p>
                                        </div>
                                    )}
                                    {!phone && !email && !address && (
                                        <p className="text-slate-500 italic">
                                            Contact information will appear here once configured in the admin dashboard.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-900 p-12 rounded-[3rem] text-white shadow-xl shadow-slate-900/20">
                                <h2 className="typo-section-h2 text-white mb-8 font-bold uppercase tracking-tight">Send a Message</h2>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <input type="text" placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-brand-blue transition-all" />
                                        <input type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-brand-blue transition-all" />
                                    </div>
                                    <input type="text" placeholder="Subject" className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-brand-blue transition-all" />
                                    <textarea placeholder="Your Message" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-brand-blue transition-all"></textarea>
                                    <button className="w-full bg-brand-blue hover:bg-blue-600 text-white py-5 rounded-xl font-bold uppercase tracking-widest transition-all">Submit Request</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
