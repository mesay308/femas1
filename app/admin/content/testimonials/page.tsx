// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Save, Upload, User, Edit2, ChevronRight } from 'lucide-react';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';

const TestimonialManager = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [formData, setFormData] = useState({ client_name: '', client_role: '', content: '', rating: 5, image: null });
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => { fetchTestimonials(); }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await api.get('/content/testimonials');
            setTestimonials(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('client_name', formData.client_name);
            data.append('client_role', formData.client_role);
            data.append('content', formData.content);
            data.append('rating', formData.rating);
            if (formData.image) data.append('image', formData.image);

            if (editingTestimonial) {
                await api.put(`/content/testimonials/${editingTestimonial.testimonial_id}`, data);
            } else {
                await api.post('/content/testimonials', data);
            }
            fetchTestimonials();
            setFormData({ client_name: '', client_role: '', content: '', rating: 5, image: null });
            setEditingTestimonial(null);
            setPreviewUrl(null);
        } catch (err) { alert("Failed to save testimonial"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try { await api.delete(`/content/testimonials/${id}`); fetchTestimonials(); } catch (err) { alert("Failed to delete"); }
        }
    };

    const handleEdit = (t) => {
        setEditingTestimonial(t);
        setFormData({
            client_name: t.client_name,
            client_role: t.client_role || '',
            content: t.content,
            rating: t.rating,
            image: null
        });
        setPreviewUrl(t.client_image_url ? resolveImageUrl(t.client_image_url) : null);
    };

    const resetForm = () => {
        setEditingTestimonial(null);
        setFormData({ client_name: '', client_role: '', content: '', rating: 5, image: null });
        setPreviewUrl(null);
    };

    const fieldClass = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition-all admin-input-ring';

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                    <Link href="/admin" className="admin-bc-link">
                        Dashboard
                    </Link>
                    <ChevronRight size={14} className="text-slate-400 shrink-0" aria-hidden />
                    <span className="admin-bc-current">Testimonials</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Testimonials</h1>
                <p className="mt-1 text-slate-500 font-medium">Curate endorsements displayed on marketing surfaces.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                    <div className="flex justify-between items-center mb-4 gap-3 flex-wrap">
                        <h2 className="text-xl font-bold">{editingTestimonial ? 'Edit testimonial' : 'Add testimonial'}</h2>
                        {editingTestimonial && (
                            <button type="button" onClick={resetForm} className="admin-cta-neutral shrink-0 !py-2 !text-xs">
                                Discard
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div><label className="text-sm font-bold block mb-1">Client Name</label><input type="text" value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} className={fieldClass} /></div>
                        <div><label className="text-sm font-bold block mb-1">Role/Company</label><input type="text" value={formData.client_role} onChange={e => setFormData({ ...formData, client_role: e.target.value })} className={fieldClass} /></div>
                        <div><label className="text-sm font-bold block mb-1">Content</label><textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className={fieldClass} rows={3} /></div>
                        <div>
                            <label className="text-sm font-bold mb-2 block">Client Image (Optional)</label>
                            <label className="admin-cta-upload cursor-pointer">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (!f) return;
                                    setFormData({ ...formData, image: f });
                                    setPreviewUrl(URL.createObjectURL(f));
                                }} />
                                <Upload size={14} aria-hidden /> Upload portrait
                            </label>
                            {previewUrl ? (
                                <p className="text-[11px] text-slate-500 mt-2">Preview replaces list thumbnail after Save.</p>
                            ) : null}
                        </div>
                        <button type="button" onClick={handleSave} className="admin-cta-primary w-full">
                            <Save size={18} aria-hidden /> Save testimonial
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {testimonials.map(t => (
                        <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    {t.client_image_url ? <img src={resolveImageUrl(t.client_image_url)} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><User size={20} /></div>}
                                    <div>
                                        <h3 className="font-bold">{t.client_name}</h3>
                                        <p className="text-xs text-slate-500">{t.client_role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(t)} className="text-slate-400 hover:text-brand-blue"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(t.testimonial_id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <p className="text-slate-600 text-sm italic">"{t.content}"</p>
                            <div className="mt-2 text-yellow-500 text-xs">{'★'.repeat(t.rating)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default TestimonialManager;
