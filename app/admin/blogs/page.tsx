'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, Edit2, Trash2, FileText, Upload, CheckCircle2, XCircle, X, ChevronRight } from 'lucide-react';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';
import siteConfig from '@/config/siteConfig';
import RichTextEditor from '@/components/admin/RichTextEditor';

export default function BlogManagerPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState<any>({
        title: '',
        summary: '',
        content: '',
        category: 'Insights',
        author: siteConfig.companyName,
        is_published: true,
        cover_image: null
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await api.get('/blogs');
            setBlogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (blog: any = null) => {
        if (blog) {
            setEditingBlog(blog);
            setFormData({
                title: blog.title,
                summary: blog.summary || '',
                content: blog.content || '',
                category: blog.category || 'Insights',
                author: blog.author || siteConfig.companyName,
                is_published: blog.is_published === 1 || blog.is_published === true,
                cover_image: null
            });
            setPreviewUrl(blog.cover_image_url ? resolveImageUrl(blog.cover_image_url) : null);
        } else {
            setEditingBlog(null);
            setFormData({ title: '', summary: '', content: '', category: 'Insights', author: siteConfig.companyName, is_published: true, cover_image: null });
            setPreviewUrl(null);
        }
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, cover_image: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('summary', formData.summary);
            data.append('content', formData.content);
            data.append('category', formData.category);
            data.append('author', formData.author);
            data.append('is_published', String(formData.is_published));

            if (formData.cover_image instanceof File) {
                data.append('cover_image', formData.cover_image);
            }

            if (editingBlog) {
                const res = await api.put(`/blogs/${editingBlog.blog_id}`, data);
                setBlogs(blogs.map(b => b.blog_id === editingBlog.blog_id ? res.data : b));
            } else {
                const res = await api.post('/blogs', data);
                setBlogs([...blogs, res.data]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save blog", err);
            alert("Failed to save blog");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                await api.delete(`/blogs/${id}`);
                setBlogs(blogs.filter(b => b.blog_id !== id));
            } catch (err) {
                console.error("Failed to delete blog", err);
                alert("Failed to delete blog");
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Insights & blogs</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800">Insights & blogs</h1>
                    <p className="text-slate-500 mt-1">Manage technical articles and company news.</p>
                </div>
                <button type="button" onClick={() => handleOpenModal()} className="admin-cta-primary shrink-0">
                    <Plus size={20} aria-hidden />
                    New article
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <div key={blog.blog_id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
                        <div className="h-48 overflow-hidden relative">
                            {blog.cover_image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={resolveImageUrl(blog.cover_image_url)} alt={blog.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <FileText size={48} />
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                {blog.is_published ? (
                                    <span className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        <CheckCircle2 size={10} /> Published
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        <XCircle size={10} /> Draft
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-6">
                            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest block mb-2">{blog.category}</span>
                            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">{blog.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{blog.summary}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                <span className="text-xs text-slate-400">{blog.author}</span>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => handleOpenModal(blog)} className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(blog.blog_id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-[2rem] w-full max-w-3xl p-8 z-10 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-extrabold text-slate-900">{editingBlog ? 'Edit Article' : 'New Article'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24}/></button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none transition-all admin-input-ring font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                                        <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Author</label>
                                        <input type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Summary</label>
                                    <textarea value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} className="w-full px-5 py-3 rounded-2xl border border-slate-200 h-20 resize-none outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                                    <RichTextEditor value={formData.content} onChange={val => setFormData({ ...formData, content: val })} />
                                </div>
                                <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-slate-50 p-6 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        {previewUrl && <img src={previewUrl} alt="" className="w-20 h-20 object-cover rounded-xl shadow-md" />}
                                        <label className="admin-cta-upload cursor-pointer">
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            <span className="flex items-center gap-2"><Upload size={18} aria-hidden /> {previewUrl ? 'Change cover' : 'Upload cover'}</span>
                                        </label>
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({ ...formData, is_published: e.target.checked })} className="w-6 h-6 rounded accent-brand-blue" />
                                        <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Publish Post</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 mt-10 flex-wrap">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="admin-cta-neutral">Discard</button>
                                <button type="button" onClick={handleSave} className="admin-cta-primary font-extrabold">Save article</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
