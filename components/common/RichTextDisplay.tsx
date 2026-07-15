'use client';

import DOMPurify from 'dompurify';
import { useEffect, useMemo, useState } from 'react';

interface RichTextDisplayProps {
    content: string;
    className?: string;
}

const SANITIZE_OPTS = {
    ALLOWED_TAGS: ['h2', 'h3', 'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
};

const RichTextDisplay = ({ content, className = '' }: RichTextDisplayProps) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const sanitized = useMemo(() => {
        if (!content || !mounted) return '';
        return DOMPurify.sanitize(content, SANITIZE_OPTS);
    }, [content, mounted]);

    if (!content) return null;

    return (
        <div className={`rich-text-content min-w-0 max-w-full break-words ${className}`}>
            {!mounted ? (
                <div className="min-h-[4rem] animate-pulse rounded-xl bg-slate-100/80" aria-hidden />
            ) : (
                <div className="min-w-0 max-w-full overflow-x-auto" dangerouslySetInnerHTML={{ __html: sanitized }} />
            )}

            <style jsx>{`
                .rich-text-content h2 {
                    font-size: clamp(1.25rem, 3vw, 2rem);
                    font-weight: 700;
                    margin-bottom: 0.75rem;
                    margin-top: 1.25rem;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .rich-text-content h3 {
                    font-size: clamp(1rem, 2vw, 1.5rem);
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    margin-top: 1rem;
                    color: #1e293b;
                    letter-spacing: -0.02em;
                    line-height: 1.3;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .rich-text-content p {
                    margin-bottom: 0.75rem;
                    line-height: 1.65;
                    color: #1e293b;
                    font-weight: 400;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .rich-text-content ul,
                .rich-text-content ol {
                    padding-left: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                .rich-text-content ul {
                    list-style-type: disc;
                }
                .rich-text-content ol {
                    list-style-type: decimal;
                }
                .rich-text-content li {
                    margin-bottom: 0.5rem;
                    line-height: 1.55;
                    color: #1e293b;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }
                .rich-text-content a {
                    color: #0284c7;
                    font-weight: 600;
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
                .rich-text-content a:hover {
                    color: #0369a1;
                }
                .rich-text-content strong {
                    font-weight: 700;
                    color: #0f172a;
                }
                .rich-text-content em {
                    font-style: italic;
                }
                .rich-text-content u {
                    text-decoration: underline;
                    text-underline-offset: 2px;
                }
            `}</style>
        </div>
    );
};

export default RichTextDisplay;
