'use client';

import { Building2, Globe2, Handshake } from 'lucide-react';
import Image from 'next/image';

interface Client {
    name: string;
    logo: string;
}

interface ClientLogosProps {
  clients: Client[];
}

const ClientLogos = ({ clients }: ClientLogosProps) => {
    if (!clients || clients.length === 0) return null;

    return (
        <section className="py-20 bg-zinc-50 relative overflow-hidden">
            <div className="container mx-auto px-4 max-w-[1440px] text-center">
                <div className="mb-12">
                    <span className="inline-block bg-brand-orange/15 text-brand-orange px-5 py-1.5 rounded-full typo-kicker border border-brand-orange/20 mb-4 font-bold uppercase tracking-wider">
                        <Handshake size={12} className="inline mr-1.5 -mt-0.5" /> Trusted by Retailers & Distributors Across Ethiopia
                    </span>
                    <h2 className="typo-section-h2 text-gray-900 mb-4">
                        Stocked in stores <br />
                        <span className="text-brand-blue">across Ethiopia</span>
                    </h2>
                    <p className="typo-card-desc text-gray-500 max-w-2xl mx-auto">
                        We&apos;re proud to partner with premium appliance showrooms, construction developers, and retail distributors to bring Femas into Ethiopian homes.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center grayscale hover:grayscale-0 transition-all duration-500">
                    {clients.map((client, index) => (
                        <div key={index} className="w-full h-24 flex items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 border border-gray-100 group relative">
                            <Image
                                src={client.logo}
                                alt={client.name}
                                fill
                                className="object-contain p-4 opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-12 flex justify-center gap-8 typo-card-meta text-gray-400 font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <Building2 size={16} /> Modern Trade Partners
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe2 size={16} /> Wholesale Distributors
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ClientLogos;
