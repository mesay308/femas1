'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/api/axios';

interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Client-side data fetching hook.
 * Replaces server-side `api.get()` calls that fail on Vercel due to
 * the circular SSR → Serverless Function dependency.
 */
export function useFetch<T>(url: string, defaultValue: T | null = null): UseFetchResult<T> {
    const [data, setData] = useState<T | null>(defaultValue);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [trigger, setTrigger] = useState(0);

    const refetch = useCallback(() => setTrigger((t) => t + 1), []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        api.get(url)
            .then((res) => {
                if (!cancelled) {
                    setData(res.data);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.message || 'Failed to fetch data');
                    console.error(`[useFetch] ${url}:`, err?.message);
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [url, trigger]);

    return { data, loading, error, refetch };
}

/**
 * Fetch multiple endpoints in parallel on the client side.
 * Returns a tuple: [results, loading, error]
 */
export function useMultiFetch<T extends Record<string, string>>(
    endpoints: T
): {
    data: { [K in keyof T]: unknown };
    loading: boolean;
    error: string | null;
} {
    type ResultMap = { [K in keyof T]: unknown };
    const keys = Object.keys(endpoints) as (keyof T)[];
    const urls = keys.map((k) => endpoints[k]);
    const stableKey = urls.join('|');

    const [data, setData] = useState<ResultMap>(() => {
        const init = {} as ResultMap;
        keys.forEach((k) => { init[k] = null; });
        return init;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.allSettled(urls.map((url) => api.get(url)))
            .then((results) => {
                if (cancelled) return;
                const out = {} as ResultMap;
                keys.forEach((key, i) => {
                    const r = results[i];
                    out[key] = r.status === 'fulfilled' ? r.value.data : null;
                });
                setData(out);
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message || 'Failed to fetch');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stableKey]);

    return { data, loading, error };
}
