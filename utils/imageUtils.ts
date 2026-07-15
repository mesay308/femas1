export const resolveImageUrl = (url: string | null) => {
    if (!url) return '/images/placeholder.svg';
    if (url.startsWith('http')) return url;
    
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return cleanUrl;
};
