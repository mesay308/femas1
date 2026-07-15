'use client';

import { Factory, Truck, ShieldCheck, Handshake } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

/** Public asset — filename contains a space */
const DELIVERY_TRUCK_SRC = '/images/proinstallation.jpg';

const services = [
    { icon: Factory, title: 'Advanced Turkish Quality', desc: 'Bringing top-tier engineering and safety to Ethiopian homes.' },
    { icon: Truck, title: 'Pan-Ethiopia Distribution', desc: 'Deliveries and installations across Addis Ababa and regional hubs.' },
    { icon: ShieldCheck, title: 'Safety-Certified Stoves & Ovens', desc: 'Equipped with Flame Failure Devices and precision temperature controls.' },
    { icon: Handshake, title: 'Bespoke Design Support', desc: 'End-to-end custom measurement, 3D design, and integration.' },
];

const AfterSales = () => {
    return (
        <section className="relative overflow-hidden border-t border-slate-100 bg-[#f8fafc] py-20 md:py-28">
            <div
                className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand-blue/[0.08] blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-brand-orange/[0.07] blur-3xl"
                aria-hidden
            />

            <div className="container relative z-10 mx-auto max-w-[1440px] px-4">
                <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-stretch lg:gap-16">
                    <motion.div
                        className="w-full lg:w-1/2"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-orange bg-brand-orange px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" aria-hidden />
                            Our Promise
                        </span>
                        <h2 className="typo-section-h2 text-slate-900">
                            Turkish Technology.{' '}
                            <span className="text-brand-blue">Bespoke Fitting.</span>
                        </h2>
                        <p className="typo-card-desc mt-4 max-w-xl text-slate-600">
                            Based in Addis Ababa, Femas brings advanced Turkish engineering and premium custom kitchen cabinet design straight to your home — tailored perfectly for the Ethiopian lifestyle.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                            {services.map((svc, idx) => (
                                <motion.div
                                    key={svc.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.2) }}
                                    className="group/card flex gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-md"
                                >
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-blue/15 bg-brand-blue/10 text-brand-blue transition-all duration-300 group-hover/card:border-brand-blue/30 group-hover/card:bg-brand-blue group-hover/card:text-white">
                                        <svc.icon size={22} strokeWidth={2} aria-hidden />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="typo-card-title text-slate-900 transition-colors group-hover/card:text-brand-blue">{svc.title}</h4>
                                        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{svc.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-10 flex flex-wrap gap-3">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center rounded-2xl bg-brand-blue px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5 hover:bg-brand-orange hover:shadow-brand-orange/25"
                            >
                                Contact sales
                            </Link>
                            <Link
                                href="/products"
                                className="inline-flex items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:border-brand-blue hover:bg-brand-blue/5 hover:text-brand-blue"
                            >
                                View products
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="relative w-full lg:w-1/2"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.5, delay: 0.06 }}
                    >
                        <div className="relative aspect-[4/3] min-h-[280px] w-full overflow-hidden rounded-[2rem] border border-slate-200/90 bg-slate-100 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.18)] lg:min-h-[32rem]">
                            <Image
                                src={DELIVERY_TRUCK_SRC}
                                alt="Femas kitchen appliance delivery and installation in Addis Ababa"
                                fill
                                className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02]"
                                sizes="(min-width: 1024px) 50vw, 100vw"
                                priority={false}
                            />
                            <div
                                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent"
                                aria-hidden
                            />
                            <div className="absolute inset-x-5 bottom-5 z-10 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-xl backdrop-blur-md md:inset-x-8 md:bottom-8">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white shadow-md">
                                        <Truck size={22} strokeWidth={2} aria-hidden />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900">Professional Installation</p>
                                        <p className="mt-0.5 text-sm font-medium text-slate-600">
                                            Dedicated team handling delivery and custom integration of kitchen appliances and cabinetry.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AfterSales;
