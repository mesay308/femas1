'use client';

import { ArrowRight } from 'lucide-react';

type Props = {
    href: string;
    label: string;
    theme?: 'light' | 'dark';
};

export default function HeroSectionCta({ href, label, theme = 'dark' }: Props) {
    const isHash = href.startsWith('#');

    const darkClass =
        'group relative inline-flex w-full min-w-[200px] items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-brand-orange to-brand-orange/90 px-7 py-3.5 font-bold text-white shadow-[0_12px_40px_-8px_rgba(249,140,20,0.5)] ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_14px_44px_-8px_rgba(249,140,20,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 sm:w-auto';

    const lightClass =
        'group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-7 py-3.5 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110 sm:w-auto';

    const btnClass = theme === 'dark' ? darkClass : lightClass;

    return (
        <a
            href={href}
            onClick={(e) => {
                if (!isHash) return;
                e.preventDefault();
                document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={btnClass}
        >
            <span className={theme === 'dark' ? 'text-sm font-black uppercase tracking-[0.14em]' : ''}>{label}</span>
            <ArrowRight
                size={18}
                className={theme === 'dark' ? 'opacity-95 transition-transform group-hover:translate-x-0.5' : ''}
                aria-hidden
            />
        </a>
    );
}
