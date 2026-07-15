/** Extract YouTube video id from watch, embed, shorts, or youtu.be URLs. */
export function parseYoutubeVideoId(input: string): string | null {
    if (!input || typeof input !== 'string') return null;
    const s = input.trim();
    if (!s) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
    try {
        const href = s.startsWith('http') ? s : `https://${s}`;
        const u = new URL(href);
        const host = u.hostname.replace(/^www\./, '');
        if (host === 'youtu.be') {
            const id = u.pathname.replace(/^\//, '').split('/')[0]?.split('?')[0];
            return id && id.length >= 11 ? id.slice(0, 11) : null;
        }
        if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
            const v = u.searchParams.get('v');
            if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
            const embed = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
            if (embed?.[1]) return embed[1];
            const shorts = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
            if (shorts?.[1]) return shorts[1];
            const live = u.pathname.match(/\/live\/([a-zA-Z0-9_-]{11})/);
            if (live?.[1]) return live[1];
        }
    } catch {
        return null;
    }
    return null;
}

export function youtubeThumbnailUrl(videoId: string): string {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeWatchUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Public oEmbed — no API key. */
export async function fetchYoutubeTitle(input: string): Promise<string | null> {
    const id = parseYoutubeVideoId(input);
    if (!id) return null;
    const watchUrl = youtubeWatchUrl(id);
    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 12000);
        try {
            const r = await fetch(
                `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
                { signal: ctrl.signal }
            );
            if (!r.ok) return null;
            const j = (await r.json()) as { title?: string };
            return typeof j.title === 'string' && j.title.trim() ? j.title.trim() : null;
        } finally {
            clearTimeout(t);
        }
    } catch {
        return null;
    }
}
