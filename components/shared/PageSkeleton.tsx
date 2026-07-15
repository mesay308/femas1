'use client';

/**
 * Full-page loading skeleton shown while client-side data is being fetched.
 * Uses CSS custom properties (--brand-primary) so the spinner always
 * matches the company brand color — no hardcoded colors, no framer-motion.
 */
export default function PageSkeleton({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center bg-[#f8fafc]">
            <div className="text-center animate-fadeIn">
                {/* Brand-colored spinner ring */}
                <div
                    className="mx-auto mb-6 h-12 w-12 rounded-full animate-spin"
                    style={{
                        border: '3px solid #e2e8f0',
                        borderTopColor: 'var(--brand-primary, #00a5df)',
                    }}
                />
                <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--brand-primary, #00a5df)' }}>
                    {message}
                </p>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.35s ease-out both;
                }
            `}</style>
        </div>
    );
}

/**
 * Compact section-level skeleton for cards/grids
 */
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="animate-pulse space-y-6 p-6">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4">
                    <div className="h-24 w-24 rounded-2xl bg-slate-200/80" />
                    <div className="flex-1 space-y-3 py-2">
                        <div className="h-4 w-3/4 rounded-lg bg-slate-200/80" />
                        <div className="h-3 w-1/2 rounded-lg bg-slate-200/60" />
                    </div>
                </div>
            ))}
        </div>
    );
}
