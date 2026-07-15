import axios from 'axios';

/**
 * API base URL for Axios.
 * - Browser: if NEXT_PUBLIC_API_URL is set, call the backend directly (Express must use `cors()` — already enabled).
 *   This avoids rare Next.js rewrite issues. If unset, use `/api` so next.config.mjs rewrites proxy to the backend.
 * - Server (SSR): always use an absolute URL so server components / layout can reach Express.
 */
function getApiBaseUrl(): string {
    const raw = process.env.NEXT_PUBLIC_API_URL?.trim()?.replace(/\/$/, '') || '';

    if (typeof window === 'undefined') {
        // Server-side (SSR / Build)
        if (raw) return `${raw}/api`;
        
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            const host = process.env.NEXT_PUBLIC_API_URL || 
                         process.env.VERCEL_PROJECT_PRODUCTION_URL || 
                         process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
                         process.env.VERCEL_URL || 
                         process.env.NEXT_PUBLIC_VERCEL_URL;
            if (host) {
                // Check if host already has http/https to avoid https://https://
                const hasProtocol = host.startsWith('http://') || host.startsWith('https://');
                return hasProtocol ? `${host}/api` : `https://${host}/api`;
            }
            return '/api'; // Relative fallback
        }
        
        return 'http://localhost:5000/api';
    }

    if (raw) return `${raw}/api`;
    return '/api';
}

const api = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 60000,
});

// === Request Interceptor: Attach JWT Token ===
api.interceptors.request.use(
    (config) => {
        if (
            typeof FormData !== 'undefined' &&
            config.data instanceof FormData
        ) {
            // Preserve multipart boundary; never send application/json or www-form-urlencoded
            delete (config.headers as Record<string, unknown>)['Content-Type'];
        }

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            const method = String(config.method || 'get').toLowerCase();
            const rel = String(config.url || '').split('?')[0];
            const isAuthLogin =
                method === 'post' && (rel === '/auth/login' || rel.endsWith('/auth/login'));
            if (token && !isAuthLogin) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// === Response Interceptor: Handle 401 Unauthorized ===
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                const isLoginPage = window.location.pathname === '/login';
                const isAdminRoute = window.location.pathname.startsWith('/admin');
                if (isAdminRoute && !isLoginPage) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
