'use client';

import { motion } from 'framer-motion';
import { X, Calendar, MapPin, Building2, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import { useState, useEffect } from 'react';

const resolveUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${base}${cleanUrl}`;
};

interface ProjectModalProps {
    project: any;
    onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Parse images
    let dbImages = [];
    try {
        dbImages = typeof project.gallery_images === 'string' ? JSON.parse(project.gallery_images) : (project.gallery_images || []);
    } catch (e) {}
    
    const allImages = project.cover_image_url ? [project.cover_image_url, ...dbImages] : dbImages;
    const fullUrlImages = allImages.map((img: string) => resolveUrl(img));

    const nextImage = () => setCurrentImageIndex(p => (p + 1) % fullUrlImages.length);
    const prevImage = () => setCurrentImageIndex(p => (p - 1 + fullUrlImages.length) % fullUrlImages.length);

    // Parse description safely
    const cleanHTML = typeof window !== 'undefined' && project.detailed_description 
        ? DOMPurify.sanitize(project.detailed_description) 
        : project.detailed_description || '';

    // Parse sector safely
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
    
    const year = project.completion_date ? new Date(project.completion_date).getFullYear() : 'Recent';
    const locationParts = Array.from(new Set([project.city, project.region, project.location].filter(Boolean)));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/50 backdrop-blur-md hover:bg-white text-slate-700 rounded-full flex items-center justify-center transition-colors shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* Left Column: Media Gallery */}
                <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[300px] md:min-h-full flex flex-col">
                    {fullUrlImages.length > 0 ? (
                        <>
                            <div className="relative flex-1 bg-black overflow-hidden group">
                                <Image
                                    src={fullUrlImages[currentImageIndex]}
                                    alt={`${project.title} - Image ${currentImageIndex + 1}`}
                                    fill
                                    className="object-contain"
                                />
                                {fullUrlImages.length > 1 && (
                                    <>
                                        <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-brand-blue text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-brand-blue text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Thumbnails */}
                            {fullUrlImages.length > 1 && (
                                <div className="h-24 bg-white p-2 flex gap-2 overflow-x-auto border-r border-slate-100">
                                    {fullUrlImages.map((img: string, idx: number) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`relative h-full aspect-video rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? 'border-brand-blue opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <Image src={img} alt="Thumbnail" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            No images available
                        </div>
                    )}
                </div>

                {/* Right Column: Narrative & Specs */}
                <div className="w-full md:w-1/2 flex flex-col max-h-[50vh] md:max-h-[90vh]">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                                {project.title}
                            </h2>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                                    <Calendar size={14} className="text-brand-blue" />
                                    {year}
                                </span>
                                {locationParts.length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-medium">
                                        <MapPin size={14} className="text-brand-orange" />
                                        {locationParts.join(', ')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            {project.client_name && (
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Client</span>
                                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                                        <Building2 size={16} className="text-brand-blue" />
                                        {project.client_name}
                                    </div>
                                </div>
                            )}
                            {sectorText && (
                                <div>
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Sector</span>
                                    <div className="text-brand-blue font-bold">
                                        {sectorText}
                                    </div>
                                </div>
                            )}
                            {project.equipment_installed && (
                                <div className="sm:col-span-2 mt-2 pt-4 border-t border-slate-200">
                                    <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Installed Equipment</span>
                                    <div className="flex items-start gap-2 text-slate-700 text-sm bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                        <Wrench size={16} className="text-brand-orange shrink-0 mt-0.5" />
                                        <span>{project.equipment_installed}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Narrative */}
                        <div className="prose prose-slate prose-brand max-w-none">
                            {project.short_description && (
                                <p className="text-lg font-medium text-slate-700 leading-relaxed mb-6">
                                    {project.short_description}
                                </p>
                            )}
                            
                            {cleanHTML ? (
                                <div dangerouslySetInnerHTML={{ __html: cleanHTML }} className="text-slate-600 leading-loose" />
                            ) : (
                                <p className="text-slate-600 leading-loose whitespace-pre-wrap">
                                    {project.detailed_description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Fixed Bottom CTA */}
                    <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] mt-auto shrink-0">
                        <button 
                            onClick={() => {
                                onClose();
                                window.dispatchEvent(new CustomEvent('open-quote-modal'));
                            }}
                            className="w-full bg-brand-orange hover:bg-[#e07b0e] text-white py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg hover:shadow-brand-orange/30 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <Wrench size={18} />
                            Request a Quote for a Similar Project
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

