'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Save, Award, Upload, Plus, Trash2, Edit2, Check,
    Building2, Sparkles,
    ShieldCheck, X, Loader2, Image as ImageIcon, Heart,
    ChevronRight,
} from 'lucide-react';
import api from '@/api/axios';
import { resolveImageUrl } from '@/utils/imageUtils';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });
const MediaPicker = dynamic(() => import('@/components/admin/MediaPicker'), { ssr: false });

const FieldWrapper = ({ id, label, children, onClear, editingField, setEditingField, hideActions = false }: any) => {
    const isEditing = editingField === id;
    
    return (
        <div className={`group relative p-4 -m-4 rounded-3xl transition-all duration-500 ${isEditing ? 'bg-brand-blue/5 ring-2 ring-brand-blue shadow-xl shadow-brand-blue/5 z-10' : 'hover:bg-slate-50/50'}`}>
            <div className="flex justify-between items-center mb-3 h-6">
                <label className={`block text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isEditing ? 'text-brand-blue' : 'text-slate-400'} px-1`}>
                    {label}
                </label>
                {!hideActions && (
                    <div className="flex items-center gap-1 opacity-100 transition-all">
                        <button 
                            onClick={() => setEditingField(isEditing ? null : id)} 
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all ${
                                isEditing 
                                ? 'bg-brand-blue text-white' 
                                : 'bg-white text-slate-400 hover:text-brand-blue border border-slate-100 hover:border-brand-blue/30'
                            }`}
                        >
                            {isEditing ? (
                                <><Check size={12} strokeWidth={3} /> Lock Field</>
                            ) : (
                                <><Edit2 size={12} /> Edit Field</>
                            )}
                        </button>
                        <button 
                            onClick={onClear} 
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                            title="Clear"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
            <div className="transition-all duration-300">
                {children}
            </div>
        </div>
    );
};

export default function CompanyProfilePage() {
    const [activeTab, setActiveTab] = useState('identity');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    
    // Refs for focusing inputs
    const taglineRef = useRef<HTMLInputElement>(null);
    const summaryRef = useRef<HTMLTextAreaElement>(null);
    const missionRef = useRef<HTMLTextAreaElement>(null);
    const visionRef = useRef<HTMLTextAreaElement>(null);

    const [profileData, setProfileData] = useState<any>({
        legal_name: '',
        brand_name: '',
        tagline: '',
        mission: '',
        vision: '',
        core_values: [{ title: '', description: '' }],
        description_brief: '',
        overview: '',
        reasons_why_us: [{ title: '', description: '' }],
        logo_light: null,
        logo_dark: null,
        primary_color: '#00a5df',
        secondary_color: '#f98c14'
    });
    const [previews, setPreviews] = useState<any>({ logo_light: null, logo_dark: null });
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [mediaPickerConfig, setMediaPickerConfig] = useState({ type: 'logo_light' });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        // Focus effect when editing changes
        if (editingField === 'tagline') taglineRef.current?.focus();
        if (editingField === 'summary') summaryRef.current?.focus();
        if (editingField === 'mission') missionRef.current?.focus();
        if (editingField === 'vision') visionRef.current?.focus();
    }, [editingField]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/profile');
            if (res.data) {
                setProfileData({
                    ...profileData,
                    ...res.data,
                    core_values: Array.isArray(res.data.core_values) ? res.data.core_values : [{ title: '', description: '' }],
                    reasons_why_us: Array.isArray(res.data.reasons_why_us) ? res.data.reasons_why_us : [{ title: '', description: '' }]
                });

                setPreviews({
                    logo_light: res.data.logo_light ? resolveImageUrl(res.data.logo_light) : null,
                    logo_dark: res.data.logo_dark ? resolveImageUrl(res.data.logo_dark) : null
                });
            }
        } catch (err) {
            console.error("Failed to load profile", err);
            showNotification("Failed to load company profile.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message: string, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = new FormData();
            Object.keys(profileData).forEach(key => {
                if (key === 'logo_light' || key === 'logo_dark') {
                    if (profileData[key] instanceof File) {
                        data.append(key, profileData[key]);
                    } else if (profileData[key]) {
                        data.append(key, typeof profileData[key] === 'string' ? profileData[key] : '');
                    }
                } else if (Array.isArray(profileData[key]) || (profileData[key] && typeof profileData[key] === 'object')) {
                    data.append(key, JSON.stringify(profileData[key]));
                } else {
                    data.append(key, profileData[key] || '');
                }
            });

            await api.put('/profile', data);
            showNotification("Company Profile updated successfully!");
            setEditingField(null); // Lock all fields after save
            fetchProfile();
        } catch (err) {
            console.error(err);
            showNotification("Failed to save profile changes.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const updateNestedList = (field: string, index: number, subfield: string, value: any) => {
        setProfileData((prev: any) => {
            const newList = [...prev[field]];
            newList[index] = { ...newList[index], [subfield]: value };
            return { ...prev, [field]: newList };
        });
    };

    const addItem = (field: string) => {
        setProfileData((prev: any) => ({
            ...prev,
            [field]: [...prev[field], { title: '', description: '' }]
        }));
    };

    const removeItem = (field: string, index: number) => {
        setProfileData((prev: any) => ({
            ...prev,
            [field]: prev[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const handleMediaSelect = (asset: any) => {
        const field = mediaPickerConfig.type;
        setProfileData((prev: any) => ({ ...prev, [field]: asset.path }));
        setPreviews((prev: any) => ({ ...prev, [field]: resolveImageUrl(asset.path) }));
    };

    const tabs = [
        { id: 'identity', label: 'Core Identity', icon: Building2 },
        { id: 'whyus', label: 'Why Us', icon: Heart },
        { id: 'branding', label: 'Branding & Logos', icon: Award },
    ];

    const inputClasses = "w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-medium text-slate-800 shadow-sm placeholder:text-slate-400 disabled:bg-transparent disabled:border-transparent disabled:shadow-none disabled:px-1 disabled:text-slate-700 disabled:opacity-100";
    
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="animate-spin text-brand-blue mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Corporate Identity...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full pb-24 max-w-6xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Company profile</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Profile & identity</h1>
                    <p className="text-slate-500 mt-3 font-medium text-lg">Set your company identity, proposition, and branding.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="admin-cta-primary flex-1 font-black uppercase tracking-widest md:flex-none md:min-w-[200px]"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} aria-hidden /> : <Save size={20} aria-hidden />}
                        <span>Save profile</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-6 md:p-10 min-h-[700px]">
                <div className="admin-tab-row mb-10">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`admin-tab-trigger ${isActive ? 'admin-tab-trigger-active' : ''}`}
                            >
                                {isActive && (
                                    <motion.div layoutId="profileTabBg" className="admin-tab-indicator" transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }} />
                                )}
                                <tab.icon size={18} className={`relative z-10 ${isActive ? 'text-white/90' : 'text-slate-400'}`} />
                                <span className="relative z-10 tracking-wide">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'identity' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FieldWrapper label="Legal Name" hideActions={true} id="legal_name" editingField={editingField} setEditingField={setEditingField}>
                                        <input type="text" value={profileData.legal_name} onChange={e => setProfileData({ ...profileData, legal_name: e.target.value })} className={inputClasses} placeholder="Company Legal Name" />
                                    </FieldWrapper>
                                    <FieldWrapper label="Brand Name" hideActions={true} id="brand_name" editingField={editingField} setEditingField={setEditingField}>
                                        <input type="text" value={profileData.brand_name} onChange={e => setProfileData({ ...profileData, brand_name: e.target.value })} className={inputClasses} placeholder="Brand Name" />
                                    </FieldWrapper>
                                </div>

                                <div className="pt-8 border-t border-slate-50">
                                    <FieldWrapper 
                                        id="tagline"
                                        label="Corporate Tagline" 
                                        onClear={() => setProfileData({ ...profileData, tagline: '' })}
                                        editingField={editingField}
                                        setEditingField={setEditingField}
                                    >
                                        <input 
                                            ref={taglineRef}
                                            type="text" 
                                            value={profileData.tagline} 
                                            onChange={e => setProfileData({ ...profileData, tagline: e.target.value })} 
                                            className={inputClasses} 
                                            placeholder="The heart of your identity..." 
                                        />
                                    </FieldWrapper>
                                </div>

                                <div className="pt-8 border-t border-slate-50">
                                    <FieldWrapper 
                                        id="summary"
                                        label="Summary (Brief Profile)" 
                                        onClear={() => setProfileData({ ...profileData, description_brief: '' })}
                                        editingField={editingField}
                                        setEditingField={setEditingField}
                                    >
                                        <textarea 
                                            ref={summaryRef}
                                            value={profileData.description_brief} 
                                            onChange={e => setProfileData({ ...profileData, description_brief: e.target.value })} 
                                            className={`${inputClasses} h-32 resize-none`} 
                                            placeholder="A concise overview of the company for quick reading..." 
                                        />
                                    </FieldWrapper>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                                    <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${editingField === 'mission' ? 'bg-blue-50/50 border-brand-blue' : 'bg-blue-50/30 border-blue-50'}`}>
                                        <FieldWrapper 
                                            id="mission"
                                            label="Corporate Mission Protocol" 
                                            onClear={() => setProfileData({ ...profileData, mission: '' })}
                                            editingField={editingField}
                                            setEditingField={setEditingField}
                                        >
                                            <textarea 
                                                ref={missionRef}
                                                value={profileData.mission} 
                                                onChange={e => setProfileData({ ...profileData, mission: e.target.value })} 
                                                className={`${inputClasses} bg-transparent h-48 resize-none`} 
                                                placeholder="Our commitment..." 
                                            />
                                        </FieldWrapper>
                                    </div>
                                    <div className={`p-8 rounded-[2rem] border transition-all duration-500 ${editingField === 'vision' ? 'bg-emerald-50/50 border-brand-blue' : 'bg-emerald-50/30 border-emerald-50'}`}>
                                        <FieldWrapper 
                                            id="vision"
                                            label="Future Vision Projection" 
                                            onClear={() => setProfileData({ ...profileData, vision: '' })}
                                            editingField={editingField}
                                            setEditingField={setEditingField}
                                        >
                                            <textarea 
                                                ref={visionRef}
                                                value={profileData.vision} 
                                                onChange={e => setProfileData({ ...profileData, vision: e.target.value })} 
                                                className={`${inputClasses} bg-transparent h-48 resize-none`} 
                                                placeholder="Our future aspiration..." 
                                            />
                                        </FieldWrapper>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-50">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                            <ShieldCheck size={24} className="text-brand-blue" /> 
                                            Strategic Core Values
                                        </h3>
                                        <button onClick={() => addItem('core_values')} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 text-brand-blue rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">
                                            <Plus size={16} /> Add Axiom
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {profileData.core_values.map((val: any, i: number) => (
                                            <div key={i} className={`p-8 border rounded-[2rem] relative group transition-all duration-500 ${editingField === `core_${i}` ? 'bg-brand-blue/5 border-brand-blue shadow-xl' : 'bg-slate-50/50 border-slate-50 hover:bg-white hover:shadow-lg'}`}>
                                                <div className="absolute top-6 right-6 flex gap-2 opacity-100 transition-all">
                                                    <button 
                                                        onClick={() => setEditingField(editingField === `core_${i}` ? null : `core_${i}`)}
                                                        className={`p-2 rounded-lg transition-colors ${editingField === `core_${i}` ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:text-brand-blue'}`}
                                                    >
                                                        {editingField === `core_${i}` ? <Check size={18} /> : <Edit2 size={18} />}
                                                    </button>
                                                    <button onClick={() => removeItem('core_values', i)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                <input type="text" placeholder="Value Identity (Integrity)" value={val.title} onChange={e => updateNestedList('core_values', i, 'title', e.target.value)} className="w-full bg-transparent border-none font-black text-lg text-slate-900 outline-none mb-3 placeholder:text-slate-300" />
                                                <textarea placeholder="Supporting ethos..." value={val.description} onChange={e => updateNestedList('core_values', i, 'description', e.target.value)} className="w-full bg-transparent border-none text-sm text-slate-500 font-medium outline-none resize-none leading-relaxed" rows={3} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-50">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black text-slate-900">Extended Company Profile</h3>
                                        <button 
                                            onClick={() => setEditingField(editingField === 'overview' ? null : 'overview')}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                                editingField === 'overview' 
                                                ? 'bg-brand-blue text-white shadow-xl scale-105' 
                                                : 'bg-white text-slate-400 border border-slate-100 hover:text-brand-blue hover:border-brand-blue/30'
                                            }`}
                                        >
                                            {editingField === 'overview' ? <><Check size={16} /> Lock Field</> : <><Edit2 size={16} /> Edit Field</>}
                                        </button>
                                    </div>
                                    <div className={`transition-all duration-700 p-6 rounded-[2.5rem] ${editingField === 'overview' ? 'bg-brand-blue/5 ring-4 ring-brand-blue/10 shadow-inner' : 'bg-transparent'}`}>
                                        <RichTextEditor 
                                            value={profileData.overview} 
                                            onChange={val => setProfileData({ ...profileData, overview: val })} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'whyus' && (
                            <div className="space-y-10">
                                <div className="bg-emerald-50/20 p-12 rounded-[3rem] border border-emerald-50 text-center mb-10">
                                    <Sparkles size={48} className="text-emerald-500 mx-auto mb-6" />
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Market Differentiation & USP</h3>
                                    <p className="text-slate-500 max-w-2xl mx-auto mt-4 font-medium">Engineer the strategic arguments that position your company as the premier choice.</p>
                                </div>
                                <div className="flex justify-end pr-4">
                                    <button onClick={() => addItem('reasons_why_us')} className="flex items-center gap-3 px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all hover:-translate-y-1">
                                        <Plus size={18} /> Add Strategic Pillar
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {profileData.reasons_why_us.map((item: any, i: number) => (
                                        <div key={i} className={`flex flex-col sm:flex-row gap-8 items-start p-10 border rounded-[3rem] relative group transition-all duration-500 ${editingField === `why_${i}` ? 'bg-emerald-50/5 border-emerald-200 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'}`}>
                                            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center font-black text-2xl shrink-0">
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <input type="text" placeholder="Strategic Factor" value={item.title} onChange={e => updateNestedList('reasons_why_us', i, 'title', e.target.value)} className="w-full bg-transparent border-none font-black text-xl text-slate-900 outline-none focus:text-emerald-500 placeholder:text-slate-200" />
                                                <textarea placeholder="Data-driven justification..." value={item.description} onChange={e => updateNestedList('reasons_why_us', i, 'description', e.target.value)} className="w-full bg-transparent border-none text-sm text-slate-500 font-medium outline-none resize-none leading-relaxed" rows={4} />
                                            </div>
                                            <div className="absolute top-8 right-8 flex gap-2 opacity-100 transition-all">
                                                <button 
                                                    onClick={() => setEditingField(editingField === `why_${i}` ? null : `why_${i}`)}
                                                    className={`p-2 rounded-lg transition-colors ${editingField === `why_${i}` ? 'bg-emerald-500 text-white' : 'text-slate-300 hover:text-brand-blue'}`}
                                                >
                                                    {editingField === `why_${i}` ? <Check size={22} /> : <Edit2 size={22} />}
                                                </button>
                                                <button onClick={() => removeItem('reasons_why_us', i)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                                                    <Trash2 size={22} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'branding' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-brand-blue mb-2 px-1">Primary Master Brandmark (Light Mode)</label>
                                        <div className="flex flex-col gap-6 w-full">
                                            <label className="group relative cursor-pointer border-2 border-dashed border-slate-100 hover:border-brand-blue rounded-[3rem] p-12 w-full flex flex-col items-center justify-center text-center bg-slate-50/30 transition-all min-h-[350px]">
                                                <input type="file" className="hidden" accept="image/*" onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setProfileData({ ...profileData, logo_light: file });
                                                        setPreviews({ ...previews, logo_light: URL.createObjectURL(file) });
                                                    }
                                                }} />
                                                {previews.logo_light ? (
                                                    <div className="relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={previews.logo_light} className="max-h-52 object-contain transition-transform group-hover:scale-105 duration-700" alt="Logo preview" />
                                                        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm max-md:opacity-100 opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[2rem]">
                                                            <Upload size={32} className="text-brand-blue mb-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Replace Asset</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
                                                            <Upload size={40} className="text-slate-200 group-hover:text-brand-blue transition-colors" />
                                                        </div>
                                                        <p className="font-black text-slate-800 uppercase tracking-widest text-xs">Initialize Light Identity</p>
                                                    </div>
                                                )}
                                            </label>
                                            <button
                                                onClick={() => {
                                                    setMediaPickerConfig({ type: 'logo_light' });
                                                    setIsMediaPickerOpen(true);
                                                }}
                                                className="w-full py-5 rounded-[2rem] border-2 border-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-brand-blue transition-all flex items-center justify-center gap-2"
                                            >
                                                <ImageIcon size={18} /> Protocol: Digital Library
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-brand-blue mb-2 px-1">Contrast Brandmark (Negative / Dark Mode)</label>
                                        <div className="flex flex-col gap-6 w-full">
                                            <label className="group relative cursor-pointer border-2 border-dashed border-slate-700 hover:border-brand-blue rounded-[3rem] p-12 w-full flex flex-col items-center justify-center text-center bg-slate-900 transition-all min-h-[350px] shadow-2xl">
                                                <input type="file" className="hidden" accept="image/*" onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setProfileData({ ...profileData, logo_dark: file });
                                                        setPreviews({ ...previews, logo_dark: URL.createObjectURL(file) });
                                                    }
                                                }} />
                                                {previews.logo_dark ? (
                                                    <div className="relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={previews.logo_dark} className="max-h-52 object-contain transition-transform group-hover:scale-105 duration-700" alt="Dark logo preview" />
                                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm max-md:opacity-100 opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[2rem]">
                                                            <Upload size={32} className="text-white mb-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Replace Negative</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                                                            <Upload size={40} className="text-white/10 group-hover:text-white transition-colors" />
                                                        </div>
                                                        <p className="font-black text-white/20 uppercase tracking-widest text-xs">Initialize Dark Identity</p>
                                                    </div>
                                                )}
                                            </label>
                                            <button
                                                onClick={() => {
                                                    setMediaPickerConfig({ type: 'logo_dark' });
                                                    setIsMediaPickerOpen(true);
                                                }}
                                                className="w-full py-5 rounded-[2rem] border-2 border-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 hover:text-brand-blue transition-all flex items-center justify-center gap-2"
                                            >
                                                <ImageIcon size={18} /> Protocol: Digital Library
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-brand-blue mb-2 px-1">Primary Brand Color</label>
                                        <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                                            <input 
                                                type="color" 
                                                value={profileData.primary_color || '#00a5df'} 
                                                onChange={e => setProfileData({ ...profileData, primary_color: e.target.value })} 
                                                className="w-16 h-16 rounded-2xl cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-2xl" 
                                            />
                                            <input 
                                                type="text" 
                                                value={profileData.primary_color || '#00a5df'} 
                                                onChange={e => setProfileData({ ...profileData, primary_color: e.target.value })} 
                                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 uppercase" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-brand-blue mb-2 px-1">Secondary Brand Color</label>
                                        <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                                            <input 
                                                type="color" 
                                                value={profileData.secondary_color || '#f98c14'} 
                                                onChange={e => setProfileData({ ...profileData, secondary_color: e.target.value })} 
                                                className="w-16 h-16 rounded-2xl cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-2xl" 
                                            />
                                            <input 
                                                type="text" 
                                                value={profileData.secondary_color || '#f98c14'} 
                                                onChange={e => setProfileData({ ...profileData, secondary_color: e.target.value })} 
                                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-800 outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 uppercase" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className={`fixed bottom-12 right-12 z-50 px-8 py-5 rounded-[2rem] flex items-center gap-5 ${notification.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${notification.type === 'success' ? 'bg-brand-blue' : 'bg-red-500'}`}>
                            {notification.type === 'success' ? <Save size={24} /> : <X size={24} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black uppercase tracking-widest text-[10px] opacity-60">System Notification</span>
                            <span className="font-bold tracking-tight">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </motion.div>
    );
}
