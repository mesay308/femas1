'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Upload, Search, Trash2, Check, ImageIcon, Video,
    FileText, Loader2, ExternalLink, CheckCircle2, ChevronRight
} from 'lucide-react';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';

export default function MediaLibraryPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [filterType, setFilterType] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/media');
            setAssets(res.data);
        } catch (err) {
            console.error("Failed to fetch assets", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const res = await api.post('/media/upload', formData);
            const newAssets = res.data.data;
            setAssets([...newAssets, ...assets]);
            if (newAssets.length > 0) setSelectedAsset(newAssets[0]);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this asset?")) return;

        try {
            await api.delete(`/media/${id}`);
            setAssets(assets.filter(a => a.asset_id !== id));
            if (selectedAsset?.asset_id === id) setSelectedAsset(null);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const filteredAssets = assets.filter(asset => {
        if (!asset) return false;
        const name = asset.original_name || asset.filename || 'Unnamed Asset';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const mime = asset.mime_type || '';
        const matchesType = filterType === 'all' ||
            (filterType === 'image' && mime.startsWith('image/')) ||
            (filterType === 'video' && mime.startsWith('video/')) ||
            (filterType === 'file' && !mime.startsWith('image/') && !mime.startsWith('video/'));
        return matchesSearch && matchesType;
    });

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-[1600px] mx-auto p-6 lg:p-10 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Media</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Media Hub</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage all your digital assets across the platform.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="admin-cta-primary flex-1 md:flex-none shrink-0"
                    >
                        {isUploading ? <Loader2 className="animate-spin" size={20} aria-hidden /> : <Upload size={20} aria-hidden />}
                        <span>Upload assets</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                <div className="xl:col-span-3 space-y-6">
                    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {([
                                { value: 'all', label: 'All Assets' },
                                { value: 'image', label: 'Images' },
                                { value: 'video', label: 'Videos' },
                                { value: 'file', label: 'Files' },
                            ] as const).map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setFilterType(tab.value)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === tab.value ? 'bg-brand-blue text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                            <Loader2 className="animate-spin text-brand-blue mb-4" size={40} />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Repository...</p>
                        </div>
                    ) : filteredAssets.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredAssets.map(asset => {
                                const mime = asset.mime_type || '';
                                const name = asset.original_name || asset.filename || 'Unnamed Asset';
                                return (
                                    <motion.div
                                        key={asset.asset_id}
                                        layout
                                        whileHover={{ y: -4 }}
                                        onClick={() => setSelectedAsset(asset)}
                                        className={`relative group bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden ${selectedAsset?.asset_id === asset.asset_id ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-slate-100 hover:border-brand-blue/30 shadow-sm'}`}
                                    >
                                        <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                                            {mime.startsWith('image/') ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={resolveImageUrl(asset.path)} alt={name} className="w-full h-full object-cover" />
                                            ) : mime.startsWith('video/') ? (
                                                <Video size={32} className="text-slate-400" />
                                            ) : (
                                                <FileText size={32} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="p-3 border-t border-slate-50">
                                            <p className="text-xs font-bold text-slate-700 truncate">{name}</p>
                                        </div>
                                        {selectedAsset?.asset_id === asset.asset_id && (
                                            <div className="absolute top-2 right-2 bg-brand-blue text-white p-1 rounded-full">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                            <ImageIcon className="text-slate-300 mb-4" size={48} />
                            <p className="text-slate-400 font-bold">No assets found</p>
                        </div>
                    )}
                </div>

                <div className="xl:col-span-1">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sticky top-10">
                        {selectedAsset ? (
                            <div className="space-y-6">
                                <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center">
                                    {selectedAsset.mime_type.startsWith('image/') ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={resolveImageUrl(selectedAsset.path)} alt="" className="w-full h-full object-contain" />
                                    ) : (
                                        <FileText size={48} className="text-slate-300" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 break-words">{selectedAsset.original_name}</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
                                        Added on {new Date(selectedAsset.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 font-medium tracking-wide uppercase">Type</span>
                                            <span className="text-slate-900 font-bold">{selectedAsset.mime_type}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500 font-medium tracking-wide uppercase">Size</span>
                                            <span className="text-slate-900 font-bold">{formatSize(selectedAsset.file_size)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <a href={resolveImageUrl(selectedAsset.path)} target="_blank" className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">
                                            <ExternalLink size={16} /> Open Origin
                                        </a>
                                        <button onClick={() => handleDelete(selectedAsset.asset_id)} className="flex items-center justify-center gap-2 px-4 py-3 text-red-500 bg-red-50 rounded-xl font-bold hover:bg-red-100 transition-all text-sm">
                                            <Trash2 size={16} /> Delete Asset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                    <CheckCircle2 className="text-slate-200" size={32} />
                                </div>
                                <h3 className="font-bold text-slate-900">Select an asset</h3>
                                <p className="text-sm text-slate-400 mt-2">View details and manage properties here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
