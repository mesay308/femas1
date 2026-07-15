'use client';

import { useState } from 'react';
import { Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/api/axios';
import siteConfig from '@/config/siteConfig';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const res = await api.post('/auth/login', {
                email: email.trim(),
                password,
            });
            const { token, user } = res.data;
            const normalizedUser = {
                ...user,
                role: user.role_name ?? user.role ?? '',
            };
            login(token, normalizedUser);
        } catch (err: unknown) {
            const ax = err as { response?: { status?: number; data?: { error?: string } }; message?: string };
            const status = ax.response?.status;
            const dataMsg = ax.response?.data?.error;
            let message = dataMsg || 'Login failed. Please verify credentials.';
            if (status === 429) {
                message = dataMsg || 'Too many attempts. Wait a few minutes and try again.';
            } else if (status === 403) {
                message = dataMsg || 'This account is disabled.';
            } else if (status === 500) {
                message = dataMsg || 'Server error during login. Check API logs and database connection.';
            } else if (!ax.response && ax.message === 'Network Error') {
                message =
                    'Cannot reach the API. If you opened the site from another device (phone / another PC), set NEXT_PUBLIC_API_URL in .env.local to this machine\'s LAN URL (e.g. http://192.168.1.11:5000) and restart Next.js — localhost only works on the PC running the server.';
            }
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans p-6">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00a5df]"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                    <div className="p-10 text-center bg-slate-50 border-b border-slate-100">
                        <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={32} className="text-[#00a5df]" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Gate</h1>
                        <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-widest">{siteConfig.companyName}</p>
                    </div>

                    <div className="p-10">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-xs font-bold mb-8 border border-red-100 flex items-center gap-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">Access Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#00a5df]/30 focus:ring-4 focus:ring-[#00a5df]/5 outline-none transition-all font-bold text-slate-800"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">Security Key</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#00a5df]/30 focus:ring-4 focus:ring-[#00a5df]/5 outline-none transition-all font-bold text-slate-800"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#00a5df] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#008cc0] hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl shadow-[#00a5df]/20 flex items-center justify-center gap-3 disabled:opacity-70 mt-8"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Initiate Session
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
                
                <p className="text-center text-slate-400 text-xs font-bold mt-8 uppercase tracking-[0.2em]">
                    Internal Systems Only &bull; Access Logged
                </p>
            </motion.div>
        </div>
    );
}
