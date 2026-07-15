'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Plus, Edit2, Trash2, Save, X, Building2, Upload, 
    Search, Grid, List as ListIcon, ExternalLink, 
    Link as LinkIcon, Info, LayoutGrid, Hash, Loader2,
    ChevronRight
} from 'lucide-react';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';

export default function ClientManagerPage() {
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // View & Filter state
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        website_url: '',
        category: 'Government',
        display_order: 0,
        logo: null as File | null,
        is_active: true
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const CATEGORIES = ['Government', 'NGO', 'Corporate', 'International', 'Partner'];

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/clients?all=true');
            setClients(res.data);
        } catch (err) {
            console.error("Failed to fetch clients", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (client: any = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                name: client.name || '',
                website_url: client.website_url || '',
                category: client.category || 'Government',
                display_order: client.display_order || 0,
                logo: null,
                is_active: client.is_active !== undefined ? Boolean(client.is_active) : true
            });
            setPreviewUrl(client.logo_url ? resolveImageUrl(client.logo_url) : null);
        } else {
            setEditingClient(null);
            setFormData({ 
                name: '', 
                website_url: '', 
                category: 'Government', 
                display_order: clients.length > 0 ? Math.max(...clients.map(c => c.display_order)) + 1 : 0, 
                logo: null,
                is_active: true
            });
            setPreviewUrl(null);
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!formData.name) return alert("Client name is required");
        
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('website_url', formData.website_url);
            data.append('category', formData.category);
            data.append('display_order', String(formData.display_order));
            data.append('is_active', String(formData.is_active));

            if (formData.logo instanceof File) {
                data.append('logo', formData.logo);
            }

            if (editingClient) {
                const res = await api.put(`/clients/${editingClient.client_id}`, data);
                setClients(prev => prev.map(c => c.client_id === editingClient.client_id ? res.data : c));
            } else {
                const res = await api.post('/clients', data);
                setClients(prev => [...prev, res.data]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save client", err);
            alert("Failed to save client");
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuickOrderUpdate = async (client: any, newOrder: string) => {
        try {
            const updated = { ...client, display_order: parseInt(newOrder) };
            await api.put(`/clients/${client.client_id}`, updated);
            setClients(prev => prev.map(c => c.client_id === client.client_id ? { ...c, display_order: parseInt(newOrder) } : c));
        } catch (err) {
            console.error("Failed to update order", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await api.delete(`/clients/${id}`);
                setClients(prev => prev.filter(c => c.client_id !== id));
            } catch (err) {
                console.error("Failed to delete client", err);
                alert("Failed to delete client");
            }
        }
    };

    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = !selectedCategory || c.category === selectedCategory;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => a.display_order - b.display_order);
    }, [clients, searchQuery, selectedCategory]);

    const inputClasses = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 font-medium text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10";
    const labelClasses = "block text-sm font-bold text-slate-700 mb-2 px-1";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto"
        >
            {/* Header Section */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Clients</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Clients & partners</h1>
                    <p className="mt-2 font-medium text-slate-500">Logos and links for your public client showcase.</p>
                </div>
                <button
                    type="button"
                    onClick={() => handleOpenModal()}
                    className="admin-cta-primary"
                >
                    <Plus size={20} aria-hidden />
                    Add client
                </button>
            </div>

            {/* Filters Bar */}
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/40 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search clients..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto items-center">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none hover:border-brand-blue/30 transition-all cursor-pointer shadow-sm"
                    >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>

                    <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Grid View"
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow text-brand-blue' : 'text-slate-400 hover:text-slate-600'}`}
                            title="List View"
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Display */}
            {isLoading ? (
                <div className="text-center py-24 bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/40">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Profiles...</p>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-20 text-slate-400 italic bg-white rounded-3xl shadow-sm border border-slate-100">
                    No clients found matching your criteria.
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredClients.map((client) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={client.client_id}
                            className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 group relative flex flex-col"
                        >
                            <div className="h-40 flex items-center justify-center mb-6 bg-slate-50 rounded-[1.5rem] p-6 overflow-hidden relative group-hover:bg-blue-50/50 transition-colors">
                                {client.logo_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img 
                                        src={resolveImageUrl(client.logo_url)} 
                                        alt={client.name} 
                                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-700" 
                                        onError={(e: any) => { e.target.src = '/images/placeholder.svg'; }}
                                    />
                                ) : (
                                    <Building2 className="text-slate-200" size={64} />
                                )}
                                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md text-[10px] font-bold text-slate-400 px-2 py-1 rounded-lg border border-white">
                                    #{client.display_order}
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-brand-blue transition-colors line-clamp-1">{client.name}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                        {client.category}
                                    </span>
                                    {!client.is_active && (
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                            Hidden
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-6 pt-5 border-t border-slate-50">
                                <a 
                                    href={client.website_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className={`p-2 rounded-xl transition-all ${client.website_url ? 'text-slate-400 hover:text-brand-orange hover:bg-brand-orange/10' : 'text-slate-200 pointer-events-none'}`}
                                    title="Visit Website"
                                >
                                    <ExternalLink size={18} />
                                </a>
                                <div className="flex gap-1.5">
                                    <button 
                                        onClick={() => handleOpenModal(client)} 
                                        className="p-2.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-all"
                                        title="Edit Client"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(client.client_id)} 
                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        title="Delete Client"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-extrabold">
                                    <th className="px-6 py-5">Client Identity</th>
                                    <th className="px-6 py-5">Category</th>
                                    <th className="px-6 py-5">Website</th>
                                    <th className="px-6 py-5">Sort Order</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredClients.map((client) => (
                                    <tr key={client.client_id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-200 flex-shrink-0 flex items-center justify-center p-2 group- transition-all">
                                                    {client.logo_url ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={resolveImageUrl(client.logo_url)} className="max-h-full max-w-full object-contain" alt={client.name} onError={(e: any) => { e.target.src = '/images/placeholder.svg'; }} />
                                                    ) : (
                                                        <Building2 className="text-slate-300" size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors">{client.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-medium tracking-tight">ID: {client.client_id.substring(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-brand-blue border border-blue-100">
                                                {client.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {client.website_url ? (
                                                <a href={client.website_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-orange transition-colors">
                                                    <LinkIcon size={12} /> URL
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-300 italic">No link</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Hash size={12} className="text-slate-300" />
                                                <input 
                                                    type="number"
                                                    defaultValue={client.display_order}
                                                    onBlur={(e) => handleQuickOrderUpdate(client, e.target.value)}
                                                    className="w-16 px-2 py-1 bg-transparent border border-transparent hover:border-slate-200 focus:border-brand-blue focus:bg-white rounded-lg text-sm font-bold text-slate-700 outline-none transition-all"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <button onClick={() => handleOpenModal(client)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(client.client_id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Form Design (Add/Edit) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[2.5rem] w-full max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl z-[110] flex flex-col mx-4"
                        >
                            {/* Modal Header - Fixed */}
                            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                        {editingClient ? 'Edit Partner Info' : 'Onboard New Client'}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Configure client profile and display metrics.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2.5 bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm border border-slate-200 transition-all hover:rotate-90">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body - Scrollable */}
                            <div className="p-8 space-y-8 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className={labelClasses}>Corporate / Organization Name</label>
                                            <div className="relative group">
                                                <Building2 size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className={`${inputClasses} pl-12`}
                                                    placeholder="e.g. Shoa Supermarket"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClasses}>Sector Category</label>
                                            <select
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className={`${inputClasses} appearance-none cursor-pointer`}
                                            >
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClasses}>Official Website URL</label>
                                            <div className="relative group">
                                                <LinkIcon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                                                <input
                                                    type="url"
                                                    value={formData.website_url}
                                                    onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                                                    className={`${inputClasses} pl-12`}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className={labelClasses}>Sort Priority</label>
                                            <div className="relative group">
                                                <Hash size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                                                <input
                                                    type="number"
                                                    value={formData.display_order}
                                                    onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                                    className={`${inputClasses} pl-12`}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        {/* Logo Upload Area */}
                                        <div>
                                            <label className={labelClasses}>Brand Logo Asset</label>
                                            <div className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 min-h-[155px]">
                                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-3 border border-slate-200 overflow-hidden shrink-0">
                                                    {previewUrl ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={previewUrl} className="max-h-full max-w-full object-contain" alt="Preview" onError={(e: any) => { e.target.src = '/images/placeholder.svg'; }} />
                                                    ) : (
                                                        <Upload size={24} className="text-slate-200" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="admin-cta-upload">
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                        <Upload size={14} aria-hidden /> Upload logo
                                                    </label>
                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium px-1 leading-tight">PNG/SVG with transparent background.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="flex items-center gap-3 p-5 rounded-3xl bg-brand-blue/5 border border-brand-blue/10">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.is_active} 
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })} 
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                                    </label>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 leading-none">Display publicly on website</p>
                                        <p className="text-[11px] text-slate-500 mt-1">Hidden clients are saved but won't appear on the live showcase.</p>
                                    </div>
                                    <div className="ml-auto">
                                        <Info size={16} className="text-slate-300" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 gap-4 border-t border-slate-100 bg-slate-50 px-8 py-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-cta-neutral flex-1">
                                    Discard
                                </button>
                                <button type="button" onClick={handleSave} disabled={isSaving} className="admin-cta-primary flex-[1.5]">
                                    <Save size={20} aria-hidden />
                                    <span>{isSaving ? 'Saving…' : 'Save client'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
