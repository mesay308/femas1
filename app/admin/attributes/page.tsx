'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Save, X, Check, Tag, Loader2, ChevronRight } from 'lucide-react';
import api from '@/api/axios';

export default function AttributeManagerPage() {
    const [attributes, setAttributes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttr, setEditingAttr] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState<any>({
        name: '',
        code: '',
        type: 'text',
        unit: '',
        is_filterable: false,
        options: '',
        category_ids: []
    });

    useEffect(() => {
        fetchAttributes();
        fetchCategories();
    }, []);

    const fetchAttributes = async () => {
        try {
            const res = await api.get('/attributes');
            setAttributes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const handleOpenModal = (attr: any = null) => {
        if (attr) {
            setEditingAttr(attr);
            setFormData({
                name: attr.name,
                code: attr.code,
                type: attr.type,
                unit: attr.unit || '',
                is_filterable: attr.is_filterable,
                options: attr.options && Array.isArray(attr.options) ? attr.options.join(', ') : '',
                category_ids: attr.categories ? attr.categories.map((c: any) => c.category_id) : []
            });
        } else {
            setEditingAttr(null);
            setFormData({ name: '', code: '', type: 'text', unit: '', is_filterable: false, options: '', category_ids: [] });
        }
        setIsModalOpen(true);
    };

    const toggleCategory = (catId: number) => {
        setFormData((prev: any) => {
            const current = [...prev.category_ids];
            if (current.includes(catId)) {
                return { ...prev, category_ids: current.filter(id => id !== catId) };
            } else {
                return { ...prev, category_ids: [...current, catId] };
            }
        });
    };

    const handleSave = async () => {
        try {
            const payload = {
                name: formData.name,
                code: formData.code,
                type: formData.type,
                unit: formData.unit,
                is_filterable: formData.is_filterable,
                options: formData.type === 'select' ? formData.options.split(',').map((o: string) => o.trim()).filter((o: string) => o) : [],
                category_ids: formData.category_ids
            };

            if (editingAttr) {
                const res = await api.put(`/attributes/${editingAttr.attribute_id}`, payload);
                setAttributes(attributes.map(a => a.attribute_id === editingAttr.attribute_id ? res.data : a));
            } else {
                const res = await api.post('/attributes', payload);
                setAttributes([...attributes, res.data]);
            }
            setIsModalOpen(false);
        } catch (err: any) {
            console.error("Failed to save attribute", err);
            alert(err.response?.data?.error || err.message || "Failed to save attribute");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure? This will remove this attribute from all linked categories and products.')) {
            try {
                await api.delete(`/attributes/${id}`);
                setAttributes(attributes.filter(a => a.attribute_id !== id));
            } catch (err) {
                console.error(err);
                alert("Failed to delete attribute.");
            }
        }
    };

    return (
        <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Attributes</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Attributes & specs</h1>
                    <p className="mt-1 text-slate-500">Define technical specifications and assign them to product categories.</p>
                </div>
                <button type="button" onClick={() => handleOpenModal()} className="admin-cta-primary">
                    <Plus size={20} aria-hidden />
                    Add attribute
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 font-bold">
                            <th className="px-6 py-5">Attribute</th>
                            <th className="px-6 py-5">Code</th>
                            <th className="px-6 py-5">Type</th>
                            <th className="px-6 py-5">Unit</th>
                            <th className="px-6 py-5">Categories</th>
                            <th className="px-6 py-5 text-center">Filterable</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="inline-block animate-spin text-brand-blue"/></td></tr>
                        ) : attributes.map((attr) => (
                            <tr key={attr.attribute_id} className="group transition-all hover:bg-brand-blue/[0.06]">
                                <td className="px-6 py-4 font-bold text-slate-800">{attr.name}</td>
                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{attr.code}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase text-slate-600 border border-slate-200">{attr.type}</span></td>
                                <td className="px-6 py-4 text-slate-500">{attr.unit || '-'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {attr.categories?.map((cat: any) => (
                                            <span key={cat.category_id} className="flex items-center gap-1 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 py-0.5 text-[9px] font-bold text-brand-blue">
                                                <Tag size={8}/> {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {attr.is_filterable ? <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><Check size={14}/></div> : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button type="button" onClick={() => handleOpenModal(attr)} className="p-2 text-slate-400 hover:text-brand-blue"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDelete(attr.attribute_id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-[2rem] w-full max-w-lg p-8 z-10 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-extrabold text-slate-900">{editingAttr ? 'Edit Attribute' : 'New Attribute'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Attribute Name</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="admin-input-ring w-full rounded-2xl border border-slate-200 px-5 py-3 outline-none" placeholder="e.g. Bottle Size" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">System Code</label>
                                        <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none font-mono text-sm" placeholder="bottle_size" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Unit</label>
                                        <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none" placeholder="mL, L, kg, g" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                        <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none">
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="select">Select</option>
                                            <option value="boolean">Boolean</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center pt-8">
                                        <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-sm">
                                            <input type="checkbox" checked={formData.is_filterable} onChange={e => setFormData({ ...formData, is_filterable: e.target.checked })} className="h-5 w-5 accent-brand-blue rounded" />
                                            Filterable
                                        </label>
                                    </div>
                                </div>
                                {formData.type === 'select' && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Options (comma separated)</label>
                                        <input type="text" value={formData.options} onChange={e => setFormData({ ...formData, options: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none" placeholder="Opt1, Opt2, Opt3" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Applicable Categories</label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-40 overflow-y-auto">
                                        {categories.map(cat => {
                                            const isSelected = formData.category_ids.includes(cat.category_id);
                                            return (
                                                <button key={cat.category_id} type="button" onClick={() => toggleCategory(cat.category_id)} className={`rounded-lg px-3 py-1.5 text-[11px] font-black uppercase transition-all ${isSelected ? 'bg-brand-blue text-white shadow-md' : 'border border-slate-200 bg-white text-slate-500'}`}>
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-10 flex flex-wrap justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-cta-neutral">
                                    Discard
                                </button>
                                <button type="button" onClick={handleSave} className="admin-cta-primary">
                                    <Save size={20} aria-hidden />
                                    Save attribute
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
