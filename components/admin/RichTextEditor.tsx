'use client';

import React, { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2 } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import to prevent SSR issues with Quill
const ReactQuill = dynamic(() => import('react-quill-new'), { 
    ssr: false,
    loading: () => <div className="h-40 bg-slate-50 animate-pulse rounded-xl" />
});

const TOOLBAR_OPTIONS = [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean'],
];

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    disabled?: boolean;
    /** CSS value for Quill editor minimum height (e.g. calc(100vh - 280px)). Defaults to 160px. */
    editorMinHeight?: string;
}

const RichTextEditor = ({ value, onChange, placeholder = 'Start writing...', className = '', label, disabled, editorMinHeight }: RichTextEditorProps) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const modules = useMemo(() => ({
        toolbar: disabled ? false : TOOLBAR_OPTIONS,
    }), [disabled]);

    const formats = useMemo(() => [
        'header', 'bold', 'italic', 'underline',
        'list', 'link',
    ], []);

    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
        if (!isFullScreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    };

    const EditorContent = (
        <div className={`rich-text-editor ${isFullScreen ? 'flex-1 overflow-hidden' : ''} ${disabled ? 'readonly-mode' : ''}`}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={disabled}
                className={isFullScreen ? 'h-[calc(100%-42px)]' : ''}
            />
        </div>
    );

    const FullScreenCTA = (
        <button 
            onClick={toggleFullScreen}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${
                isFullScreen 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-[#00a5df]/10 text-[#00a5df] border border-[#00a5df]/20 hover:bg-[#00a5df] hover:text-white'
            }`}
        >
            {isFullScreen ? (
                <>
                    <Minimize2 size={16} strokeWidth={3} />
                    Exit Full Screen
                </>
            ) : (
                <>
                    <Maximize2 size={16} strokeWidth={3} />
                    Full Screen
                </>
            )}
        </button>
    );

    const minHeightVar = editorMinHeight
        ? ({ ['--rte-editor-min-h' as string]: editorMinHeight } as React.CSSProperties)
        : undefined;

    return (
        <>
            <div className={`rich-text-editor-container relative ${className}`} style={minHeightVar}>
                <div className="flex justify-between items-center mb-3">
                    {label && <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-[#00a5df] px-1">{label}</label>}
                    {!isFullScreen && !disabled && FullScreenCTA}
                </div>
                
                {!isFullScreen && EditorContent}

                <style>{`
                    .rich-text-editor .ql-toolbar.ql-snow {
                        border: 1px solid #e2e8f0;
                        border-radius: 1rem 1rem 0 0;
                        background: #f8fafc;
                        padding: 10px 16px;
                    }
                    .rich-text-editor .ql-container.ql-snow {
                        border: 1px solid #e2e8f0;
                        border-top: none;
                        border-radius: 0 0 1rem 1rem;
                        background: #fff;
                        font-size: 15px;
                        font-family: inherit;
                        min-height: var(--rte-editor-min-h, 160px);
                    }
                    .rich-text-editor .ql-editor {
                        min-height: var(--rte-editor-min-h, 160px);
                        padding: 16px 20px;
                        line-height: 1.7;
                        color: #1e293b;
                    }
                    .rich-text-editor .ql-editor.ql-blank::before {
                        color: #94a3b8;
                        font-style: normal;
                    }
                    .rich-text-editor .ql-editor h2 {
                        font-size: 1.25rem;
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                    }
                    .rich-text-editor .ql-editor h3 {
                        font-size: 1.1rem;
                        font-weight: 600;
                        margin-bottom: 0.4rem;
                    }
                    .rich-text-editor .ql-toolbar button:hover,
                    .rich-text-editor .ql-toolbar button.ql-active {
                        color: #00a5df !important;
                    }
                    .rich-text-editor .ql-toolbar button:hover .ql-stroke,
                    .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
                        stroke: #00a5df !important;
                    }
                    .rich-text-editor .ql-toolbar button:hover .ql-fill,
                    .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
                        fill: #00a5df !important;
                    }
                    .rich-text-editor:focus-within .ql-toolbar.ql-snow {
                        border-color: #00a5df;
                    }
                    .rich-text-editor:focus-within .ql-container.ql-snow {
                        border-color: #00a5df;
                        box-shadow: 0 0 0 4px rgba(0, 165, 223, 0.1);
                    }
                `}</style>
            </div>

            {/* Portal for Full Screen Mode */}
            {isFullScreen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] bg-white p-6 md:p-12 flex flex-col font-sans">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{label || 'Content Editor'}</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Immersive focus mode enabled</p>
                        </div>
                        {FullScreenCTA}
                    </div>
                    <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col">
                        <style>{`
                            .fullscreen-editor .ql-container.ql-snow {
                                border: none !important;
                                flex: 1;
                            }
                            .fullscreen-editor .ql-toolbar.ql-snow {
                                border: none !important;
                                border-bottom: 1px solid #f1f5f9 !important;
                                background: #f8fafc;
                            }
                            .fullscreen-editor .ql-editor {
                                max-width: 1000px;
                                margin: 0 auto;
                                padding: 40px;
                                font-size: 18px;
                            }
                        `}</style>
                        <div className="fullscreen-editor flex flex-col flex-1">
                            {EditorContent}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default RichTextEditor;
