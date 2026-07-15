'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { isAuthenticated, isLoading } = useAuth();
    const adminShellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isAuthenticated || isLoading) return;
        let cancelled = false;
        api.get('/profile')
            .then((res) => {
                const el = adminShellRef.current;
                if (cancelled || !el || !res.data) return;
                const p = res.data.primary_color?.toString().trim();
                const s = res.data.secondary_color?.toString().trim();
                if (p) el.style.setProperty('--brand-primary', p);
                if (s) el.style.setProperty('--brand-secondary', s);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // While checking authentication, show a minimal loading state or nothing
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <div className="animate-pulse text-slate-400 font-medium">Loading Dashboard...</div>
            </div>
        );
    }

    // AuthProvider will handle redirection if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div
            ref={adminShellRef}
            className="admin-app min-h-screen bg-slate-100 font-sans text-slate-800 flex overflow-hidden"
        >
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative bg-slate-100 transition-all duration-300">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 pb-0 flex items-center bg-slate-100">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-xl bg-white text-brand-blue shadow-sm border border-slate-200 hover:border-brand-blue/35 hover:bg-brand-blue/5 transition-colors"
                        aria-label="Toggle Sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="ml-4 font-bold text-lg text-slate-800 tracking-tight">
                        Admin <span className="text-brand-blue">Dashboard</span>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto relative z-0 p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto pb-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
