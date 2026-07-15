'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { fetchYoutubeTitle, parseYoutubeVideoId, youtubeThumbnailUrl, youtubeWatchUrl } from '@/utils/youtube';

type YoutubeUrlFieldProps = {
    value: string;
    onChange: (next: string) => void;
    label?: string;
    hint?: string;
    inputClassName?: string;
};

export default function YoutubeUrlField({ value, onChange, label, hint, inputClassName }: YoutubeUrlFieldProps) {
    const [title, setTitle] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const videoId = parseYoutubeVideoId(value);

    useEffect(() => {
        if (!videoId) {
            setTitle(null);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setTitle(null);
        fetchYoutubeTitle(value)
            .then((t) => {
                if (!cancelled) setTitle(t);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [value, videoId]);

    const defaultInput =
        'w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 text-sm font-medium text-slate-800 placeholder:text-slate-400';

    return (
        <div className="space-y-3">
            {label ? <label className="block text-sm font-bold text-slate-700 mb-1 px-1">{label}</label> : null}
            <input
                type="url"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={inputClassName ?? defaultInput}
                placeholder="https://www.youtube.com/watch?v=…"
                autoComplete="off"
            />
            {hint ? <p className="text-xs text-slate-500 px-1">{hint}</p> : null}

            {videoId ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 overflow-hidden shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-0 sm:gap-4">
                        <a
                            href={youtubeWatchUrl(videoId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative shrink-0 sm:w-44 aspect-video bg-black block group"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={youtubeThumbnailUrl(videoId)}
                                alt=""
                                className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/15 transition-colors">
                                <span className="rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-800 shadow">
                                    YouTube
                                </span>
                            </span>
                        </a>
                        <div className="p-4 flex-1 min-w-0 flex flex-col justify-center gap-2">
                            <div className="flex items-start gap-2">
                                {loading ? (
                                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                                        <Loader2 size={14} className="animate-spin shrink-0" aria-hidden />
                                        Loading title…
                                    </span>
                                ) : (
                                    <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-3">
                                        {title || 'Video (title unavailable — link is still valid)'}
                                    </p>
                                )}
                            </div>
                            <a
                                href={youtubeWatchUrl(videoId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline w-fit"
                            >
                                Open on YouTube
                                <ExternalLink size={12} className="shrink-0" aria-hidden />
                            </a>
                        </div>
                    </div>
                </div>
            ) : value.trim() ? (
                <p className="text-xs text-amber-700 font-medium px-1">Could not read a YouTube video from this URL. Use a standard watch, embed, Shorts, or youtu.be link.</p>
            ) : null}
        </div>
    );
}
