'use client';

import { Shield, Truck, Headset } from 'lucide-react';
import siteConfig from '@/config/siteConfig';

const reasons = [
    {
        icon: Shield,
        title: 'Engineering you can trust',
        desc: 'Top-tier Turkish-engineered cooking stoves and round ovens with integrated safety features and long-lasting durability.',
    },
    {
        icon: Truck,
        title: 'Bespoke design & cabinetry',
        desc: 'Custom-made cabinetry measured specifically to fit your home floor plan with premium imported Turkish materials.',
    },
    {
        icon: Headset,
        title: 'Human support',
        desc: 'Reach our team for product selection, measurements, 3D designs, or installation support — we answer in plain language.',
    },
];

const WhyUsMini = () => {
    return (
        <div className="py-2">
            <h3 className="mb-8 text-center text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                <Shield className="mb-1 inline-block text-brand-blue opacity-90" size={26} aria-hidden />
                <span className="block sm:inline sm:pl-2">Why {siteConfig.companyName}?</span>
            </h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {reasons.map((reason, idx) => {
                    const Icon = reason.icon;
                    return (
                        <div
                            key={idx}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white text-brand-blue shadow-sm transition-colors group-hover:bg-brand-blue group-hover:text-white">
                                <Icon size={22} aria-hidden />
                            </div>
                            <h4 className="mb-2 font-bold text-slate-900">{reason.title}</h4>
                            <p className="text-sm leading-relaxed text-slate-600">{reason.desc}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WhyUsMini;
