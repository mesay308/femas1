'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, Edit2, Trash2, X as XIcon, Save, Loader2, Mail, Shield, Key, ChevronRight } from 'lucide-react';
import api from '@/api/axios';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role_id: '',
        is_active: true
    });
    const [error, setError] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                api.get('/users'),
                api.get('/roles')
            ]);
            setUsers(usersRes.data);
            setRoles(rolesRes.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to fetch data from secure repository.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenForm = (user = null as any) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                full_name: user.full_name,
                email: user.email,
                password: '',
                role_id: user.role_id || '',
                is_active: user.is_active === 1 || user.is_active === true
            });
        } else {
            setEditingUser(null);
            setFormData({
                full_name: '',
                email: '',
                password: '',
                role_id: roles.length > 0 ? roles[0].role_id : '',
                is_active: true
            });
        }
        setIsFormOpen(true);
        setError('');
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingUser(null);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!editingUser && !formData.password) {
            return setError('Credentials missing: Password is required for new accounts.');
        }

        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.user_id}`, formData);
            } else {
                await api.post('/users', formData);
            }
            fetchData();
            handleCloseForm();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to authenticate and save user data.');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm('Terminate this user access? This will revoke all active sessions.')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to terminate user.');
        }
    };

    const inputClasses = "w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-medium text-slate-800 shadow-sm placeholder:text-slate-400";
    const labelClasses = "block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1";

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Users</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Personnel Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage system administrators and assign operational roles.</p>
                </div>
                {!isFormOpen && (
                    <button
                        type="button"
                        onClick={() => handleOpenForm()}
                        className="admin-cta-primary font-black uppercase tracking-widest shrink-0"
                    >
                        <Plus size={20} aria-hidden />
                        Add user
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-2xl mb-8 font-bold">
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {isFormOpen ? (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden max-w-3xl mx-auto"
                    >
                        <div className="p-10">
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-50">
                                <h2 className="text-2xl font-black text-slate-900">{editingUser ? 'Update Personnel Profile' : 'New Specialist Onboarding'}</h2>
                                <button onClick={handleCloseForm} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                                    <XIcon size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelClasses}>Full Legal Name</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                            className={inputClasses}
                                            placeholder="e.g. Dawit Tadesse"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Corporate Email</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                className={`${inputClasses} pl-14`}
                                                placeholder="user@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelClasses}>
                                            Security Credentials (Password) 
                                            {editingUser && <span className="text-slate-400 font-normal lowercase ml-1">(Optional)</span>}
                                        </label>
                                        <div className="relative">
                                            <Key size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                className={`${inputClasses} pl-14`}
                                                placeholder={editingUser ? "••••••••" : "Minimum 8 chars"}
                                                {...(!editingUser ? { required: true } : {})}
                                                minLength={8}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Operational Authority (Role)</label>
                                        <div className="relative">
                                            <Shield size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <select
                                                value={formData.role_id}
                                                onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                                                className={`${inputClasses} pl-14 bg-white appearance-none cursor-pointer`}
                                                required
                                            >
                                                <option value="" disabled>Select Role Protocol...</option>
                                                {roles.map(role => (
                                                    <option key={role.role_id} value={role.role_id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <label className="flex items-center gap-4 cursor-pointer group w-fit">
                                        <div 
                                            onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                                            className={`w-14 h-7 rounded-full transition-all relative ${formData.is_active ? 'bg-brand-blue' : 'bg-slate-200'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all ${formData.is_active ? 'translate-x-7 shadow-md' : ''}`}></div>
                                        </div>
                                        <span className={`text-sm font-black uppercase tracking-widest ${formData.is_active ? 'text-brand-blue' : 'text-slate-400'}`}>Account Status: {formData.is_active ? 'Active' : 'Restricted'}</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-4 pt-10 border-t border-slate-50 flex-wrap">
                                    <button type="button" onClick={handleCloseForm} className="admin-cta-neutral">Discard</button>
                                    <button type="submit" className="admin-cta-primary font-black uppercase tracking-widest">
                                        <Save size={20} aria-hidden />
                                        {editingUser ? 'Update user' : 'Save user'}
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
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Specialist</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Communication</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Designation</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Verification</th>
                                        <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <Loader2 className="animate-spin text-brand-blue mx-auto mb-4" size={32} />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Personnel Records...</p>
                                            </td>
                                        </tr>
                                    ) : users.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="px-8 py-6 font-black text-slate-900">{user.full_name}</td>
                                            <td className="px-8 py-6 text-sm text-slate-500 font-medium">{user.email}</td>
                                            <td className="px-8 py-6">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-brand-blue">
                                                    {user.role_name || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                {user.is_active ? (
                                                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Authorized
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Restricted
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleOpenForm(user)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-all">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(user.user_id)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {!isLoading && users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">No registered specialists found in the directory.</td>
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
