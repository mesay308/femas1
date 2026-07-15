'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, MapPin, Tag } from 'lucide-react';

const resolveUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${base}${cleanUrl}`;
};

interface ProjectCardProps {
    project: any;
    index: number;
    onClick: () => void;
}

export default function ProjectCard({ project, index, onClick }: ProjectCardProps) {
    const imageUrl = resolveUrl(project.cover_image_url) || 'https://placehold.co/800x600/png?text=Project';

    const parseJsonSafe = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') {
            try { 
                const parsed = JSON.parse(data); 
                return Array.isArray(parsed) ? parsed[0] : parsed;
            } catch (e) { return data; }
        }
        return Array.isArray(data) ? data[0] : data;
    };

    const sectorText = parseJsonSafe(project.sector);

    // Format location and deduplicate
    const locationParts = Array.from(new Set([project.city, project.region, project.location].filter(Boolean)));
    const locationText = locationParts.length > 0 ? locationParts.join(', ') : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onClick={onClick}
            className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500"
        >
            {/* Full Background Image */}
            <Image
                src={imageUrl}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Base Overlay for slight darkening of the whole image */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500"></div>

            {/* Bottom Frosted Content Section */}
            <div className="absolute bottom-0 w-full p-6 bg-black/60 backdrop-blur-md border-t border-white/10 transition-transform duration-500 transform translate-y-2 group-hover:translate-y-0">
                
                {/* Tech Badge & Location Row */}
                <div className="flex justify-between items-start mb-3 gap-2">
                    {sectorText && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-blue/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-sm shadow-sm max-w-[50%] truncate">
                            <Tag size={12} className="shrink-0" />
                            <span className="truncate">{sectorText}</span>
                        </span>
                    )}

                    <span className="inline-flex items-center gap-1 text-slate-300 text-xs font-medium ml-auto">
                        <MapPin size={12} className="text-brand-orange" />
                        <span className="line-clamp-1">{locationText}</span>
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-brand-orange transition-colors duration-300 line-clamp-2">
                    {project.title}
                </h3>

                {/* Summary */}
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-2 mb-4 group-hover:text-white/90 transition-colors">
                    {project.short_description || project.detailed_description?.replace(/<[^>]+>/g, '').substring(0, 100)}
                </p>

                {/* Action Button (Ghost) */}
                <div className="flex items-center gap-2 text-white/80 text-sm font-semibold uppercase tracking-wider group-hover:text-white transition-colors duration-300">
                    <span className="border-b border-transparent group-hover:border-white/50 pb-0.5 transition-colors">
                        View Project Details
                    </span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300 text-brand-orange" />
                </div>
            </div>
        </motion.div>
    );
}
