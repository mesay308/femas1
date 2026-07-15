'use client';

import { FileText, ArrowRight, Sparkles, ExternalLink, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Blog {
    blog_id?: number;
    title: string;
    summary: string;
    cover_image_url: string;
    category: string;
    is_published?: boolean;
}

interface SEOContentProps {
    blogs: Blog[];
}

const articlesFallback = [
    { title: 'Safe Stove Installation', icon: FileText },
    { title: 'Round Oven Baking Guides', icon: FileText },
    { title: 'Turkish Engineering Explained', icon: FileText },
    { title: 'Kitchen Cabinet Care', icon: FileText },
    { title: 'Safety at Femas', icon: Sparkles },
];

const RESOURCES_HREF = '/resources';

const SEOContent = ({ blogs }: SEOContentProps) => {
    const published = (blogs || []).filter((b) => b.is_published !== false);
    const featuredBlog =
        published.find((b) => b.title?.trim()) ||
        ({
            title: 'Featured article coming soon',
            summary: 'Once you publish your first article on the Femas blog, it will be highlighted here.',
            cover_image_url: '',
            category: 'Insights',
        } as Blog);

    const featuredId = 'blog_id' in featuredBlog && featuredBlog.blog_id != null ? featuredBlog.blog_id : null;
    const sideBlogs = published.filter((b) => (featuredId != null ? b.blog_id !== featuredId : true)).slice(0, 5);
    const topicList = sideBlogs.length > 0 ? sideBlogs : articlesFallback;

    return (
        <section className="relative overflow-hidden border-t border-slate-100 bg-gradient-to-b from-white via-[#f8fafc] to-sky-50/25 py-20 md:py-28">
            <div
                className="pointer-events-none absolute left-1/4 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-brand-blue/[0.08] blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-brand-orange/[0.07] blur-3xl"
                aria-hidden
            />

            <div className="container relative z-10 mx-auto max-w-[1440px] px-4">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5 }}
                    className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white/90 p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/[0.03] backdrop-blur-sm md:p-10 lg:p-12"
                >
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-blue/[0.06] blur-3xl" aria-hidden />

                    <div className="relative flex flex-col gap-12 lg:flex-row lg:gap-14">
                        {/* Featured */}
                        <div className="flex flex-col lg:w-[42%]">
                            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-brand-orange bg-brand-orange px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm">
                                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                                {featuredBlog.category?.trim() || 'Insights'}
                            </span>

                            <h2 className="typo-section-h2 text-slate-900">{featuredBlog.title}</h2>

                            {featuredBlog.cover_image_url ? (
                                <Link
                                    href={RESOURCES_HREF}
                                    className="group relative mt-6 mb-6 block aspect-[16/10] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-md"
                                >
                                    <Image
                                        src={featuredBlog.cover_image_url}
                                        alt=""
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        sizes="(min-width: 1024px) 400px, 100vw"
                                    />
                                    <div
                                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent"
                                        aria-hidden
                                    />
                                </Link>
                            ) : null}

                            <p className="typo-card-desc flex-1 text-slate-600">{featuredBlog.summary}</p>

                            <Link
                                href={RESOURCES_HREF}
                                className="group mt-8 inline-flex w-fit items-center gap-2 rounded-2xl bg-brand-blue px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5 hover:bg-brand-orange hover:shadow-brand-orange/25"
                            >
                                Read full guide
                                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                            </Link>
                        </div>

                        {/* Topics */}
                        <div className="flex min-w-0 flex-1 flex-col border-t border-slate-100 pt-10 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0">
                            <div className="mb-8 flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-blue/20 bg-brand-blue/10 text-brand-blue shadow-sm">
                                    <BookOpen size={22} strokeWidth={2} aria-hidden />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-wide text-slate-900 md:text-xl">
                                    Knowledge <span className="text-brand-blue">&amp;</span> resources
                                </h3>
                            </div>

                            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
                                {topicList.map((art, idx) => {
                                    const Icon = 'icon' in art ? art.icon : FileText;
                                    const key = 'blog_id' in art && art.blog_id != null ? String(art.blog_id) : `fb-${idx}`;
                                    return (
                                        <motion.div key={key} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.2) }}>
                                            <Link
                                                href={RESOURCES_HREF}
                                                className="group/card flex h-full items-start gap-3 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-4 shadow-sm ring-1 ring-slate-900/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/25 hover:shadow-md md:gap-4 md:p-5"
                                            >
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-brand-blue transition-all duration-300 group-hover/card:border-brand-blue/25 group-hover/card:bg-brand-blue/10">
                                                    <Icon size={18} strokeWidth={2} aria-hidden />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="typo-card-title text-slate-900 transition-colors group-hover/card:text-brand-blue">
                                                        {art.title}
                                                    </h4>
                                                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-blue opacity-0 transition-all group-hover/card:translate-y-0 group-hover/card:opacity-100 translate-y-1">
                                                        Open resources
                                                        <ExternalLink size={12} strokeWidth={2.5} aria-hidden />
                                                    </span>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 border-t border-slate-100 pt-8">
                                <Link
                                    href={RESOURCES_HREF}
                                    className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-blue transition-colors hover:text-brand-orange"
                                >
                                    More on the Femas blog
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SEOContent;
