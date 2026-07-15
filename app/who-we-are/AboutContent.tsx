'use client';

import { motion } from 'framer-motion';
import { 
    Flame, 
    Calendar, 
    Building2, 
    ShieldCheck, 
    CheckCircle2, 
    FileText, 
    ArrowRight, 
    Zap, 
    Home, 
    Award, 
    Sparkles, 
    Wrench,
    Layers
} from 'lucide-react';
import Link from 'next/link';
import MissionVision from '@/components/about/MissionVision';
import CoreValues from '@/components/about/CoreValues';
import PartnerShowcase from '@/components/about/PartnerShowcase';
import GlobalPresence from '@/components/about/GlobalPresence';
import TestimonialsShowcase from '@/components/about/TestimonialsShowcase';
import SEOContent from '@/components/home/SEOContent';
import siteConfig from '@/config/siteConfig';

interface AboutContentProps {
    initialData: {
        profile: any;
        brands: any[];
        testimonials: any[];
        blogs: any[];
    };
}

const AboutContent = ({ initialData }: AboutContentProps) => {
    const { profile, brands, testimonials, blogs } = initialData;

    // Premium Core Values Fallback
    const displayValues = (profile?.core_values && profile.core_values.length > 0)
        ? profile.core_values
        : [
            {
                title: "Turkish Engineering",
                description: "Sourcing premium appliances with Turkish manufacturing excellence and safety technologies like Flame Failure Devices."
            },
            {
                title: "Bespoke Integration",
                description: "Providing perfect visual harmony and space efficiency by custom-fitting cabinetry and appliances to your floor plan."
            },
            {
                title: "Ethiopian Lifestyle Focus",
                description: "Designing solutions tailored for the local home, including spacious round ovens ideal for injera and custom modular cabinets."
            },
            {
                title: "End-to-End Service",
                description: "Accompanying you from initial 3D design to precise home measurement, delivery, and professional installation."
            }
        ];

    // Premium Geographic Locations Fallback
    const displayAddresses = (profile?.physical_addresses && profile.physical_addresses.length > 0)
        ? profile.physical_addresses
        : [
            {
                branch_name: "Femas Showroom & Headquarters",
                address: "Bole Road, Near Edna Mall",
                city: "Addis Ababa",
                country: "Ethiopia",
                google_map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.523583685458!2d38.7865243!3d9.0022218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85aaf4cf7f2b%3A0x8670d9a6fc43cb2e!2sEdna%20Mall!5e0!3m2!1sen!2set!4v1716160000000!5m2!1sen!2set"
            }
        ];

    const displayEmails = (profile?.corporate_contacts?.emails && profile.corporate_contacts.emails.length > 0)
        ? profile.corporate_contacts.emails
        : [{ email_address: "info@femasappliances.com" }];

    const displayPhones = (profile?.corporate_contacts?.phones && profile.corporate_contacts.phones.length > 0)
        ? profile.corporate_contacts.phones
        : [{ phone_number: "+251 911 234 567" }];

    // Container Motion Variants
    const containerVariants = {
        initial: {},
        animate: {
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const cardVariants = {
        initial: { opacity: 0, y: 30 },
        animate: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.8, ease: "easeOut" } 
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="min-h-screen bg-slate-50/50"
        >
            {/* ───── SECTION 1: OVERVIEW & BRAND STORY ───── */}
            <section className="py-20 site-container relative z-10 scroll-mt-24">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-sm relative overflow-hidden">
                    {/* Background Radial Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                        <div className="lg:col-span-7">
                            <span className="font-matura text-brand-orange text-2xl inline-block mb-3 select-none">
                                Advanced Cooking Solutions
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
                                ELEVATING THE ETHIOPIAN <span className="text-brand-blue">COOKING EXPERIENCE</span>
                            </h1>
                            <div className="w-16 h-1.5 bg-brand-blue rounded-full mb-8" />
                            
                            <div className="space-y-6 text-slate-600 font-medium leading-relaxed text-base md:text-lg">
                                <p>
                                    For the past three years, <strong className="text-slate-900">Femas Kitchen Appliance</strong> has specialized in bringing advanced Turkish technology and manufacturing excellence to the Ethiopian market, offering durable and professional-style appliances designed to elevate the home cooking experience.
                                </p>
                                <p>
                                    Our comprehensive product range includes a diverse selection of freestanding dual-fuel and all-electric stoves, energy-efficient compact round ovens, and premium custom-made kitchen cabinetry systems. We pride ourselves on delivering long-lasting products that combine functionality with elegant design, ensuring every kitchen we touch is both beautiful and efficient.
                                </p>
                                <p>
                                    We offer seamless appliance-to-cabinetry integration, providing a complete, personalized kitchen transformation from initial measurements and 3D design to the final professional installation, ensuring zero wasted space and a flawless fit.
                                </p>
                            </div>
                        </div>

                        {/* Right side: Quick stats dashboard */}
                        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-[#f8fafd] to-[#f0f6fc] border border-blue-100/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-blue shadow-sm border border-slate-100 mb-6">
                                    <Layers size={24} />
                                </div>
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none mb-2">100%</h3>
                                    <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Custom Sizing Fit</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#fbfaf6] to-[#f7f2e5] border border-amber-100/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-orange shadow-sm border border-slate-100 mb-6">
                                    <Flame size={24} />
                                </div>
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none mb-2">Turkish</h3>
                                    <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Engineering Tech</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#fdfbfd] to-[#faf5fd] border border-purple-100/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#7F4AA6] shadow-sm border border-slate-100 mb-6">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none mb-2">FFD</h3>
                                    <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Flame Failure Safety</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#fafdfa] to-[#f4fbf4] border border-emerald-100/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100 mb-6">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-none mb-2">3+</h3>
                                    <p className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-wider">Years of Service</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── SECTION 2: MISSION & VISION ───── */}
            <section id="about-mission" className="py-8 site-container relative z-10 scroll-mt-24">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-4 md:p-10 border border-slate-100 shadow-sm">
                    <MissionVision profile={profile} />
                </div>
            </section>

            {/* ───── SECTION 3: CORE VALUES (CORE DNA) ───── */}
            <section id="about-values" className="py-8 site-container relative z-10 scroll-mt-24">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-sm">
                    <CoreValues values={displayValues} />
                </div>
            </section>

            {/* ───── SECTION 4: WHY CHOOSE US (WHY FEMAS?) ───── */}
            <section className="py-12 site-container relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-sm">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-brand-orange px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-xs mb-4">
                            <Sparkles size={14} /> Our Competitive Edge
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
                            WHY ETHIOPIA CHOOSES <span className="text-brand-blue">FEMAS</span>
                        </h2>
                        <p className="text-slate-500 mt-4 font-medium text-base md:text-lg">
                            We bridge advanced Turkish technology with custom measurements tailored for local kitchens.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center mb-6">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Turkish Engineering</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                                Renowned Turkish technology, ensuring superior build quality and safety features like Flame Failure Devices.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-amber-50 text-brand-orange rounded-xl flex items-center justify-center mb-6">
                                <Layers size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Bespoke Integration</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                                We offer seamless appliance-to-cabinetry integration, providing a complete, personalized kitchen transformation.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                                <Home size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Tailored for Ethiopia</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                                From spacious compact round ovens perfect for injera to modular cabinet units sized for local home floor plans.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <Wrench size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-3">Professional Support</h3>
                            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                                End-to-end design and installation support from our dedicated Bole road team to ensure a perfect home setup.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ───── SECTION 5: TECHNICAL PROFILE MATRIX ───── */}
            <section className="py-12 site-container relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-sm">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-brand-blue px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-xs mb-4">
                            <FileText size={14} /> Corporate Profile
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">
                            CORPORATE SPECIFICATIONS
                        </h2>
                        <p className="text-slate-500 mt-4 font-medium text-base md:text-lg">
                            Technical profile and corporate capacity details for Femas Kitchen Appliance.
                        </p>
                    </div>

                    <div className="max-w-[900px] mx-auto bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                        <div className="divide-y divide-slate-200/60 font-semibold text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-2">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center">Corporate Entity</span>
                                <span className="md:col-span-2 text-slate-950 text-base">Femas Kitchen Appliance</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-2">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center">Registered Brand</span>
                                <span className="md:col-span-2 text-brand-blue text-base font-bold font-matura tracking-wide">Femas (Brand Identity)</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-2">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center">Headquarters &amp; Showroom</span>
                                <span className="md:col-span-2 text-slate-950 text-base">Bole Road, Near Edna Mall, Addis Ababa, Ethiopia</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-2">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center">Years in Business</span>
                                <span className="md:col-span-2 text-slate-950 text-base">3 Years</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-2">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center">Operating Sectors</span>
                                <span className="md:col-span-2 text-slate-950 text-base">Freestanding Stoves (Dual-Fuel/Electric), Compact Round Ovens, and Custom Cabinetry Systems</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-2">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center">Distribution Channels</span>
                                <span className="md:col-span-2 text-slate-950 text-base">Showroom Direct, Custom Residential Projects, and Corporate Kitchen Development</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Showcase Section */}
            {brands?.length > 0 && (
                <section className="py-8 site-container relative z-10">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-4 md:p-10 border border-slate-100 shadow-sm">
                        <PartnerShowcase brands={brands} />
                    </div>
                </section>
            )}

            {/* Testimonials Section */}
            {testimonials?.length > 0 && (
                <section className="py-8">
                    <TestimonialsShowcase testimonials={testimonials} />
                </section>
            )}

            {/* Geographic / Map Section */}
            <section className="py-8 site-container relative z-10">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[3rem] p-4 md:p-10 border border-slate-100 shadow-sm">
                    <GlobalPresence 
                        addresses={displayAddresses} 
                        emails={displayEmails} 
                        phones={displayPhones} 
                    />
                </div>
            </section>

            {/* ───── SECTION 6: PREMIUM PARTNER CALL-TO-ACTION ───── */}
            <section className="py-16 site-container relative z-10">
                <div className="bg-slate-950 rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-20 text-white relative overflow-hidden border border-slate-800 shadow-xl">
                    {/* Decorative glowing gradient orbs */}
                    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[130px] pointer-events-none mix-blend-screen" />
                    <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-brand-orange/8 rounded-full blur-[110px] pointer-events-none mix-blend-screen" />

                    <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
                        <span className="font-matura text-brand-orange text-2xl inline-block mb-4 tracking-wider select-none">
                            Transform Your Space
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 uppercase leading-tight">
                            TRANSFORM YOUR <span className="text-brand-blue">KITCHEN TODAY</span>
                        </h2>
                        <p className="text-slate-400 font-medium text-base md:text-lg mb-10 max-w-2xl leading-relaxed">
                            Schedule a custom kitchen measurement, request a 3D cabinetry layout, or explore our advanced Turkish cooking appliances.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                            <Link 
                                href="/contact" 
                                className="w-full sm:w-auto bg-brand-orange hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Get a Quote <ArrowRight size={16} />
                            </Link>
                            <Link 
                                href="/products" 
                                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Explore Products
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Content & Footer Blogs */}
            <SEOContent blogs={blogs} />
        </motion.div>
    );
};

export default AboutContent;
