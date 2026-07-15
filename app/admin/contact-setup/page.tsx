'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Save, Phone, Mail, MapPin, Globe, Plus, Trash2,
    Send, MessageCircle, Building2, Map as MapIcon, 
    Loader2, X, ShieldCheck, ImageIcon, ChevronRight
} from 'lucide-react';
import api from '@/api/axios';
import MediaPicker from '@/components/admin/MediaPicker';
import { resolveImageUrl } from '@/utils/imageUtils';

export default function ContactSetupPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('corporate');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

    const [contactData, setContactData] = useState<any>({
        corporate_contacts: {
            emails: [''],
            phones: { primary: '', secondary: '' },
            telegram: '',
            whatsapp: ''
        },
        sales_contacts: {
            emails: [''],
            phones: { primary: '', secondary: '' },
            telegram: '',
            whatsapp: ''
        },
        dedicated_admin: {
            emails: [''],
            phones: { primary: '', secondary: '' },
            telegram: '',
            whatsapp: ''
        },
        social_media: {
            telegram: '',
            facebook: '',
            linkedin: '',
            youtube: ''
        },
        physical_addresses: [
            { id: 'default-1', type: 'Head Office', name: 'Main Headquarters', address: '', map_url: '', cover_image: '' }
        ]
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/profile');
            if (res.data) {
                setContactData((prev: any) => ({
                    ...prev,
                    corporate_contacts: (res.data.corporate_contacts && !Array.isArray(res.data.corporate_contacts)) ? res.data.corporate_contacts : prev.corporate_contacts,
                    sales_contacts: (res.data.sales_contacts && !Array.isArray(res.data.sales_contacts)) ? res.data.sales_contacts : prev.sales_contacts,
                    dedicated_admin: (res.data.dedicated_admin && !Array.isArray(res.data.dedicated_admin)) ? res.data.dedicated_admin : prev.dedicated_admin,
                    social_media: (res.data.social_media && !Array.isArray(res.data.social_media)) ? res.data.social_media : prev.social_media,
                    physical_addresses: (res.data.physical_addresses && Array.isArray(res.data.physical_addresses)) 
                        ? res.data.physical_addresses 
                        : (res.data.physical_addresses && typeof res.data.physical_addresses === 'object' && !Array.isArray(res.data.physical_addresses))
                            ? [
                                {
                                    id: 'hq-1', type: 'Head Office', name: 'Headquarters',
                                    address: res.data.physical_addresses.head_office?.address || '',
                                    map_url: res.data.physical_addresses.head_office?.map_url || '',
                                    cover_image: ''
                                },
                                ...(res.data.physical_addresses.branches || []).map((b: any, i: number) => ({
                                    id: `branch-${i}`, type: 'Branch', name: `Branch ${i + 1}`,
                                    address: b.address || '', map_url: b.map_url || '', cover_image: ''
                                }))
                            ]
                            : prev.physical_addresses
                }));
            }
        } catch (err) {
            console.error("Failed to load contacts", err);
            showNotification("Failed to load contact data.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const showNotification = (message: string, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const currentRes = await api.get('/profile');
            const fullProfile = { ...currentRes.data, ...contactData };

            const formData = new FormData();
            Object.keys(fullProfile).forEach(key => {
                if (key === 'logo_light' || key === 'logo_dark') {
                    if (typeof fullProfile[key] === 'string') {
                        formData.append(key, fullProfile[key]);
                    }
                } else if (typeof fullProfile[key] === 'object' && fullProfile[key] !== null) {
                    formData.append(key, JSON.stringify(fullProfile[key]));
                } else {
                    formData.append(key, fullProfile[key] || '');
                }
            });

            await api.put('/profile', formData);
            showNotification("Contact information updated successfully!");
        } catch (err) {
            console.error(err);
            showNotification("Failed to save contact information.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const addEmail = (section: string) => {
        setContactData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                emails: [...prev[section].emails, '']
            }
        }));
    };

    const updateEmail = (section: string, index: number, value: string) => {
        setContactData((prev: any) => {
            const newEmails = [...prev[section].emails];
            newEmails[index] = value;
            return {
                ...prev,
                [section]: { ...prev[section], emails: newEmails }
            };
        });
    };

    const removeEmail = (section: string, index: number) => {
        setContactData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                emails: prev[section].emails.filter((_: any, i: number) => i !== index)
            }
        }));
    };

    const handleMediaSelect = (asset: any) => {
        if (currentImageIndex !== null) {
            updateLocation(currentImageIndex, 'cover_image', asset.path);
        }
        setIsMediaPickerOpen(false);
        setCurrentImageIndex(null);
    };

    const addLocation = () => {
        setContactData((prev: any) => ({
            ...prev,
            physical_addresses: [
                ...(Array.isArray(prev.physical_addresses) ? prev.physical_addresses : []),
                { id: Date.now().toString(), type: 'Branch', name: '', address: '', map_url: '', cover_image: '' }
            ]
        }));
    };

    const updateLocation = (index: number, field: string, value: string) => {
        setContactData((prev: any) => {
            const newLocations = [...(Array.isArray(prev.physical_addresses) ? prev.physical_addresses : [])];
            if (newLocations[index]) {
                newLocations[index] = { ...newLocations[index], [field]: value };
            }
            return {
                ...prev,
                physical_addresses: newLocations
            };
        });
    };

    const removeLocation = (index: number) => {
        setContactData((prev: any) => ({
            ...prev,
            physical_addresses: (Array.isArray(prev.physical_addresses) ? prev.physical_addresses : []).filter((_: any, i: number) => i !== index)
        }));
    };

    const tabs = [
        { id: 'corporate', label: 'Corporate', icon: Building2 },
        { id: 'sales', label: 'Sales inquiry', icon: Phone },
        { id: 'dedicated', label: 'Dedicated Admin', icon: ShieldCheck },
        { id: 'social', label: 'Social Presence', icon: Globe },
        { id: 'physical', label: 'Physical Location', icon: MapIcon },
    ];

    const inputClasses = "w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-medium text-slate-800 shadow-sm placeholder:text-slate-400";
    const labelClasses = "block text-sm font-bold text-slate-700 mb-2 px-1";

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="animate-spin text-brand-blue mb-4" size={48} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Accessing Contact Database...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full pb-24 max-w-6xl mx-auto font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                        <Link href="/admin" className="admin-bc-link">
                            Dashboard
                        </Link>
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                        <span className="admin-bc-current">Contact setup</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Contact setup</h1>
                    <p className="text-slate-500 mt-1 font-medium">Centralize company contact detail and regional physical footprints.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="admin-cta-primary flex-1 md:flex-none shrink-0 font-bold"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} aria-hidden /> : <Save size={20} aria-hidden />}
                        <span>Save contact setup</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 md:p-10 min-h-[600px]">
                <div className="admin-tab-row mb-8">
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
                                    <motion.div layoutId="activeContactTabBg" className="admin-tab-indicator" transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }} />
                                )}
                                <tab.icon size={20} className={`relative z-10 ${isActive ? 'text-white/90' : 'text-slate-400'}`} />
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
                        {(activeTab === 'corporate' || activeTab === 'sales' || activeTab === 'dedicated') && (
                            <div className="space-y-10">
                                <div>
                                    <label className={labelClasses}>
                                        Official Email Addresses
                                    </label>
                                    <div className="space-y-4 max-w-2xl">
                                        {(contactData[activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`]?.emails || []).map((email: string, i: number) => (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="relative flex-1">
                                                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                                                    <input
                                                        type="email"
                                                        value={email}
                                                        onChange={e => updateEmail(activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`, i, e.target.value)}
                                                        className={inputClasses + " pl-14 font-bold"}
                                                        placeholder="email@example.com"
                                                    />
                                                </div>
                                                {(contactData[activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`]?.emails || []).length > 1 && (
                                                    <button onClick={() => removeEmail(activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`, i)} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => addEmail(activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`)}
                                            className="admin-cta-secondary border-2 border-dashed"
                                        >
                                            <Plus size={16} aria-hidden /> Add email
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-10">
                                    <div>
                                        <label className={labelClasses}>Primary Phone Number</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="tel"
                                                value={contactData[activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`]?.phones?.primary || ''}
                                                onChange={e => {
                                                    const section = activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`;
                                                    setContactData((prev: any) => ({ ...prev, [section]: { ...prev[section], phones: { ...(prev[section]?.phones || {}), primary: e.target.value } } }))
                                                }}
                                                className={inputClasses + " pl-14"}
                                                placeholder="+1 555 123 4567"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Secondary Phone Number</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                                            <input
                                                type="tel"
                                                value={contactData[activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`]?.phones?.secondary || ''}
                                                onChange={e => {
                                                    const section = activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`;
                                                    setContactData((prev: any) => ({ ...prev, [section]: { ...prev[section], phones: { ...(prev[section]?.phones || {}), secondary: e.target.value } } }))
                                                }}
                                                className={inputClasses + " pl-14"}
                                                placeholder="+1 555 123 4567"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-50 pt-10">
                                    <div>
                                        <label className={labelClasses}>Telegram Handle</label>
                                        <div className="relative">
                                            <Send size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-blue" />
                                            <input
                                                type="text"
                                                value={contactData[activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`]?.telegram || ''}
                                                onChange={e => {
                                                    const section = activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`;
                                                    setContactData((prev: any) => ({ ...prev, [section]: { ...prev[section], telegram: e.target.value } }))
                                                }}
                                                className={inputClasses + " pl-14 font-bold"}
                                                placeholder="@your_company"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>WhatsApp Number</label>
                                        <div className="relative">
                                            <MessageCircle size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
                                            <input
                                                type="text"
                                                value={contactData[activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`]?.whatsapp || ''}
                                                onChange={e => {
                                                    const section = activeTab === 'dedicated' ? 'dedicated_admin' : `${activeTab}_contacts`;
                                                    setContactData((prev: any) => ({ ...prev, [section]: { ...prev[section], whatsapp: e.target.value } }))
                                                }}
                                                className={inputClasses + " pl-14 font-bold"}
                                                placeholder="+1 555 123 4567"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'social' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div>
                                        <label className={labelClasses}>Telegram Channel URL</label>
                                        <input type="text" value={contactData.social_media?.telegram || ''} onChange={e => setContactData((prev: any) => ({ ...prev, social_media: { ...prev.social_media, telegram: e.target.value } }))} className={inputClasses} placeholder="https://t.me/..." />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Facebook Page URL</label>
                                        <input type="text" value={contactData.social_media?.facebook || ''} onChange={e => setContactData((prev: any) => ({ ...prev, social_media: { ...prev.social_media, facebook: e.target.value } }))} className={inputClasses} placeholder="https://facebook.com/..." />
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div>
                                        <label className={labelClasses}>LinkedIn Company URL</label>
                                        <input type="text" value={contactData.social_media?.linkedin || ''} onChange={e => setContactData((prev: any) => ({ ...prev, social_media: { ...prev.social_media, linkedin: e.target.value } }))} className={inputClasses} placeholder="https://linkedin.com/company/..." />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>YouTube Channel URL</label>
                                        <input type="text" value={contactData.social_media?.youtube || ''} onChange={e => setContactData((prev: any) => ({ ...prev, social_media: { ...prev.social_media, youtube: e.target.value } }))} className={inputClasses} placeholder="https://youtube.com/..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'physical' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center px-4">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                        <MapPin size={24} className="text-brand-blue" /> Manage Physical Locations
                                    </h3>
                                    <button type="button" onClick={addLocation} className="admin-cta-secondary shrink-0 font-bold text-xs shadow-sm">
                                        <Plus size={16} /> Add Location
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {(Array.isArray(contactData.physical_addresses) ? contactData.physical_addresses : []).map((loc: any, i: number) => (
                                        <div key={loc.id || i} className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm relative group hover:shadow-xl transition-all duration-500">
                                            <button onClick={() => removeLocation(i)} className="absolute top-6 right-6 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={20} /></button>
                                            
                                            <div className="flex flex-col sm:flex-row gap-6 mb-6">
                                                <div 
                                                    onClick={() => {
                                                        setCurrentImageIndex(i);
                                                        setIsMediaPickerOpen(true);
                                                    }}
                                                    className="w-full sm:w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-blue hover:bg-blue-50/50 transition-all overflow-hidden flex-shrink-0 relative group/img"
                                                >
                                                    {loc.cover_image ? (
                                                        <>
                                                            <img src={resolveImageUrl(loc.cover_image)} alt={loc.name} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                                <ImageIcon className="text-white" size={24} />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="text-slate-300 group-hover/img:text-brand-blue mb-2" size={24} />
                                                            <span className="text-[10px] font-bold text-slate-400 group-hover/img:text-brand-blue px-2 text-center">Add Cover</span>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1 space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 mb-1 px-1">Location Type</label>
                                                            <select value={loc.type || 'Branch'} onChange={(e) => updateLocation(i, 'type', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none font-bold text-slate-700 text-sm appearance-none">
                                                                <option value="Head Office">Head Office</option>
                                                                <option value="Sales Showroom">Sales Showroom</option>
                                                                <option value="Branch">Branch</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-700 mb-1 px-1">Location Name</label>
                                                            <input type="text" value={loc.name || ''} onChange={e => updateLocation(i, 'name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none font-bold text-slate-800 text-sm" placeholder="e.g. Bole Showroom" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-700 mb-1 px-1">Physical Address</label>
                                                        <input type="text" value={loc.address || ''} onChange={e => updateLocation(i, 'address', e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none font-medium text-slate-800 text-sm" placeholder="Full physical address..." />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1 px-1">Google Maps Pin URL (Interactive Embed / Link)</label>
                                                <div className="relative">
                                                    <MapIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                    <input type="text" value={loc.map_url || ''} onChange={e => updateLocation(i, 'map_url', e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none font-medium text-slate-800 text-sm" placeholder="https://maps.google.com/..." />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                            <span className="font-bold uppercase tracking-widest text-[10px] opacity-60">Contact Update</span>
                            <span className="font-bold tracking-tight">{notification.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <MediaPicker
                isOpen={isMediaPickerOpen}
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
                selectedId={null}
            />
        </motion.div>
    );
}
