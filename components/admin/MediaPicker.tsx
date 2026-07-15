'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Upload, Search, Check, Image as ImageIcon,
    Video, FileText, Loader2
} from 'lucide-react';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';

interface Asset {
    asset_id: string;
    path: string;
    filename: string;
    original_name: string;
    mime_type: string;
}

interface MediaPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (asset: any) => void;
    selectedId?: string | string[] | null;
    multiSelect?: boolean;
}

const MediaPicker = ({ isOpen, onClose, onSelect, selectedId, multiSelect = false }: MediaPickerProps) => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
    const [tempSelected, setTempSelected] = useState<string[]>(
        selectedId ? (Array.isArray(selectedId) ? selectedId : [selectedId as string]) : []
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
            setTempSelected(selectedId ? (Array.isArray(selectedId) ? selectedId : [selectedId as string]) : []);
        }
    }, [isOpen, selectedId]);

    const fetchAssets = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/media');
            setAssets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            setActiveTab('library');
            if (newAssets.length > 0) handleSelect(newAssets[0]);
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleSelect = (asset: Asset) => {
        if (multiSelect) {
            setTempSelected(prev =>
                prev.includes(asset.asset_id)
                    ? prev.filter(id => id !== asset.asset_id)
                    : [...prev, asset.asset_id]
            );
        } else {
            setTempSelected([asset.asset_id]);
        }
    };

    const handleConfirm = () => {
        const selectedAssets = assets.filter(a => tempSelected.includes(a.asset_id));
        onSelect(multiSelect ? selectedAssets : selectedAssets[0]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                                <ImageIcon className="text-brand-blue" /> Media Repository
                            </h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Select or upload assets</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex border-b border-slate-50 bg-slate-50/50 p-2 gap-2">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'library' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Select from Library
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'upload' ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Upload Local File
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'library' ? (
                            <div className="space-y-6">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search assets..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-blue outline-none transition-all text-sm font-medium"
                                    />
                                </div>

                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <Loader2 className="animate-spin text-brand-blue" size={32} />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {assets.filter(a => {
                                            if (!a) return false;
                                            const name = a.original_name || a.filename || 'Unnamed Asset';
                                            return name.toLowerCase().includes(searchQuery.toLowerCase());
                                        }).map(asset => {
                                            const mime = asset.mime_type || '';
                                            const name = asset.original_name || asset.filename || 'Unnamed Asset';
                                            return (
                                                <div
                                                    key={asset.asset_id}
                                                    onClick={() => handleSelect(asset)}
                                                    className={`relative aspect-square rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group ${tempSelected.includes(asset.asset_id)
                                                        ? 'border-brand-blue ring-4 ring-brand-blue/10 scale-95'
                                                        : 'border-slate-50 border-transparent hover:border-slate-200 shadow-sm'
                                                        }`}
                                                >
                                                    {mime.startsWith('image/') ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={resolveImageUrl(asset.path)}
                                                            alt={name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                            {mime.startsWith('video/') ? <Video /> : <FileText />}
                                                        </div>
                                                    )}
                                                    {tempSelected.includes(asset.asset_id) && (
                                                        <div className="absolute inset-0 bg-brand-blue/20 flex items-center justify-center">
                                                            <div className="bg-brand-blue text-white p-1 rounded-full">
                                                                <Check size={16} strokeWidth={3} />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                                        <p className="text-[10px] text-white truncate font-bold uppercase">{name}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                                <div className="w-20 h-20 bg-brand-blue/10 text-brand-blue rounded-3xl flex items-center justify-center mb-6">
                                    {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Drop local asset here</h3>
                                <p className="text-slate-400 font-medium mb-8">Securely upload images or PDF documents</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold hover:-translate-y-0.5 transition-all"
                                >
                                    Select File
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" multiple />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                            {tempSelected.length} Asset{tempSelected.length !== 1 ? 's' : ''} Staged
                        </p>
                        <div className="flex gap-4">
                            <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:text-slate-900 transition-colors">Cancel</button>
                            <button
                                onClick={handleConfirm}
                                disabled={tempSelected.length === 0}
                                className="px-10 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold disabled:opacity-50 transition-all active:scale-95"
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MediaPicker;
