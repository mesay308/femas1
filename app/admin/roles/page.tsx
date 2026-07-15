'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, Edit2, Trash2, ShieldCheck, X as XIcon, Save, Loader2, Info, ChevronRight } from 'lucide-react';
import api from '@/api/axios';

const SECTIONS = [
    { id: 'manage-product', label: 'Product Ecosystem' },
    { id: 'marketing', label: 'Marketing & Content' },
    { id: 'company-data', label: 'Enterprise Data' },
    { id: 'user-role', label: 'Governance & Access' }
];

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        permissions: SECTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: { view: false, edit: false } }), {}) as any
    });
    const [error, setError] = useState('');

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/roles');
            setRoles(res.data);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError('Failed to fetch roles.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenForm = (role = null as any) => {
        if (role) {
            setEditingRole(role);
            const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
            setFormData({
                name: role.name,
                permissions: SECTIONS.reduce((acc, sec) => ({
                    ...acc,
                    [sec.id]: {
                        view: perms?.[sec.id]?.view || false,
                        edit: perms?.[sec.id]?.edit || false
                    }
                }), {})
            });
        } else {
            setEditingRole(null);
            setFormData({
                name: '',
                permissions: SECTIONS.reduce((acc, sec) => ({ ...acc, [sec.id]: { view: false, edit: false } }), {})
            });
        }
        setIsFormOpen(true);
        setError('');
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingRole(null);
        setError('');
    };

    const handleTogglePermission = (sectionId: string, action: 'view' | 'edit') => {
        setFormData((prev: any) => {
            const currentSection = prev.permissions[sectionId];
            const newSection = { ...currentSection, [action]: !currentSection[action] };
            
            if (action === 'view' && !newSection.view) {
                newSection.edit = false;
            }
            if (action === 'edit' && newSection.edit) {
                newSection.view = true;
            }

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [sectionId]: newSection
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (editingRole) {
                await api.put(`/roles/${editingRole.role_id}`, formData);
            } else {
                await api.post('/roles', formData);
            }
            fetchRoles();
            handleCloseForm();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save role.');
        }
    };

    const handleDelete = async (roleId: string) => {
        if (!window.confirm('Are you sure you want to delete this role? This cannot be undone.')) return;
        try {
            await api.delete(`/roles/${roleId}`);
            fetchRoles();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete role.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Roles</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Access Governance</h1>
                    <p className="text-slate-500 font-medium mt-1">Define security roles and granular platform permissions.</p>
                </div>
                {!isFormOpen && (
                    <button
                        type="button"
                        onClick={() => handleOpenForm()}
                        className="admin-cta-primary font-black uppercase tracking-widest shrink-0"
                    >
                        <Plus size={20} aria-hidden />
                        Add role
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl mb-8 flex items-center gap-3 font-bold">
                    <Info size={20} />
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {isFormOpen ? (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="p-8 md:p-12">
                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-50">
                                <h2 className="text-2xl font-black text-slate-900">{editingRole ? 'Modify Security Role' : 'New Role Architecture'}</h2>
                                <button onClick={handleCloseForm} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                                    <XIcon size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="max-w-xl">
                                    <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">Role Designation</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue outline-none transition-all font-bold text-slate-800"
                                        placeholder="e.g. Senior Infrastructure Analyst"
                                        required
                                    />
                                </div>

                                <div>
                                    <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-brand-blue" />
                                        Permission Matrix
                                    </h3>
                                    <div className="grid gap-4">
                                        {SECTIONS.map(section => (
                                            <div key={section.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl bg-slate-50/50 border border-slate-50 hover:bg-slate-50 transition-colors">
                                                <div>
                                                    <div className="font-black text-slate-800 tracking-tight">{section.label}</div>
                                                    <p className="text-xs text-slate-400 font-medium">Control access to {section.label.toLowerCase()} modules.</p>
                                                </div>
                                                <div className="flex gap-8 mt-4 sm:mt-0">
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div 
                                                            onClick={() => handleTogglePermission(section.id, 'view')}
                                                            className={`w-12 h-6 rounded-full transition-all relative ${formData.permissions[section.id].view ? 'bg-brand-blue' : 'bg-slate-200'}`}
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${formData.permissions[section.id].view ? 'translate-x-6 shadow-md' : ''}`}></div>
                                                        </div>
                                                        <span className={`text-xs font-black uppercase tracking-widest ${formData.permissions[section.id].view ? 'text-brand-blue' : 'text-slate-400'}`}>Read</span>
                                                    </label>

                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <div 
                                                            onClick={() => handleTogglePermission(section.id, 'edit')}
                                                            className={`w-12 h-6 rounded-full transition-all relative ${formData.permissions[section.id].edit ? 'bg-brand-orange' : 'bg-slate-200'}`}
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${formData.permissions[section.id].edit ? 'translate-x-6 shadow-md' : ''}`}></div>
                                                        </div>
                                                        <span className={`text-xs font-black uppercase tracking-widest ${formData.permissions[section.id].edit ? 'text-brand-orange' : 'text-slate-400'}`}>Write</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-10 border-t border-slate-50 flex-wrap">
                                    <button type="button" onClick={handleCloseForm} className="admin-cta-neutral">
                                        Discard
                                    </button>
                                    <button type="submit" className="admin-cta-primary font-black uppercase tracking-widest">
                                        <Save size={20} aria-hidden />
                                        {editingRole ? 'Update role' : 'Save role'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-50">
                                    <tr>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Designation</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Authorization Scope</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Classification</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <Loader2 className="animate-spin text-brand-blue mx-auto mb-4" size={32} />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Security Matrix...</p>
                                            </td>
                                        </tr>
                                    ) : roles.map((role) => {
                                        const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
                                        const accessCount = role.is_system_admin ? 'Full Access' : Object.values(perms || {}).filter((p: any) => p.view || p.edit).length + ' Modules';
                                        
                                        return (
                                            <tr key={role.role_id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-slate-900">{role.name}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${role.is_system_admin ? 'bg-orange-50 text-brand-orange' : 'bg-blue-50 text-brand-blue'}`}>
                                                        {accessCount}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {role.is_system_admin ? (
                                                        <span className="text-brand-orange font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                                            <ShieldCheck size={14}/> Root Protocol
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Client Instance</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!role.is_system_admin && (
                                                            <>
                                                                <button onClick={() => handleOpenForm(role)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-all">
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button onClick={() => handleDelete(role.role_id)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {!isLoading && roles.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold">No active role protocols found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
