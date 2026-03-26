import React, { useState, useEffect, useCallback } from 'react';
import { centreAPI } from '../../api/centres.api';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import {
    Store,
    MapPin,
    Phone,
    Mail,
    Clock,
    Calendar,
    Globe,
    FileText,
    Upload,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Camera,
    ShieldCheck
} from 'lucide-react';

const KIGALI_CENTER = { lat: -1.9441, lng: 30.0619 };
const LIBRARIES = ['places'];
const MAP_STYLES = [
    { elementType: "geometry", stylers: [{ color: "#0F172A" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0F172A" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#3B82F6" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#3B82F6" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1E293B" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1E293B" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94A3B8" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1E293B" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0F172A" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3B82F6" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#0F172A" }] }
];

const ShopProfile = () => {
    const { user, updateUser } = useAuth();
    const [centre, setCentre] = useState({ name: '', address: '', district: '', phone: '', email: '', description: '', latitude: '', longitude: '', opening_time: '09:00', closing_time: '18:00', working_days: 'Mon - Sat' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [autocomplete, setAutocomplete] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries: LIBRARIES
    });

    const load = useCallback(async () => {
        try {
            setLoading(true); setError(null);
            const res = await centreAPI.getMyCentre();
            if (res.data.success) {
                if (res.data.centre) {
                    setCentre(res.data.centre);
                    if (res.data.centre.logo_url) {
                        setLogoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${res.data.centre.logo_url}`);
                    }
                    setIsNew(false);
                } else {
                    setIsNew(true);
                }
            } else setError('Could not load your network identity properties.');
        } catch (err) {
            setError(err.response?.data?.message ?? 'An error occurred during synchronization.');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const validate = () => {
        const errors = {};
        if (!centre.name?.trim()) errors.name = 'Brand name is required';
        if (!centre.district?.trim()) errors.district = 'Regional district is required';
        if (!centre.address?.trim()) errors.address = 'Physical terminal address is required';
        if (!centre.phone?.trim()) errors.phone = 'Contact protocol required';
        if (!centre.email?.trim()) errors.email = 'Digital address required';
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCentre(p => ({ ...p, [name]: value }));
        if (validationErrors[name]) setValidationErrors(p => ({ ...p, [name]: null }));
    };

    const onLoadAutocomplete = (autoC) => setAutocomplete(autoC);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
                setCentre(prev => ({
                    ...prev,
                    address: place.formatted_address || '',
                    latitude: place.geometry.location.lat(),
                    longitude: place.geometry.location.lng()
                }));
            }
        }
    };

    const onMapClick = useCallback((e) => {
        setCentre(prev => ({
            ...prev,
            latitude: e.latLng.lat(),
            longitude: e.latLng.lng()
        }));
    }, []);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLogoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            setIsSaving(true); setError(null); setSaved(false);

            const formData = new FormData();
            Object.keys(centre).forEach(key => {
                if (centre[key] !== null && centre[key] !== undefined) {
                    formData.append(key, centre[key]);
                }
            });
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            if (isNew) {
                await api.post('/centres/my/centre', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                setIsNew(false);
                if (user) updateUser({ hasCentre: true });
                load();
            } else {
                await api.put('/centres/my/centre', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Failed to synchronize brand data.');
        } finally { setIsSaving(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-slate-500">
            <div className="w-16 h-16 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Retrieving Brand Assets...</span>
        </div>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <main style={{ width: '100%', maxWidth: 940, padding: '36px 40px', paddingBottom: 100 }} className="animate-in">

            {/* Header */}
            <header className="mb-20 space-y-4 animate-slide-up">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Store size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Brand Identity Interface</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-normal text-white italic tracking-tighter leading-none" style={{ fontFamily: 'var(--font-serif)' }}>
                            Network <span className="text-slate-400">Positioning.</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Configure your presence within the SureFix hardware service network.</p>
                    </div>
                </div>
            </header>

            {error && (
                <div className="mb-8 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-4 animate-shake">
                    <AlertCircle size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                </div>
            )}

            {saved && (
                <div className="mb-8 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-4 animate-scale-in">
                    <CheckCircle2 size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Synchronization Successful</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Branding Section */}
                <section className="glass-card premium-card p-12 border-none bg-gradient-to-br from-white/[0.03] to-transparent space-y-12">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-slate-900 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-blue-500/50 group-hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Brand Token" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-slate-700 group-hover:text-blue-500 transition-colors">
                                        <Camera size={32} strokeWidth={1.5} />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">Upload Token</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleLogoChange} />
                                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                                    <Upload size={24} className="text-white" />
                                </div>
                            </div>
                            {logoPreview && (
                                <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-red-500 hover:border-red-500/30 transition-all shadow-xl">
                                    Purge Token
                                </button>
                            )}
                        </div>

                        <div className="flex-1 space-y-8 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Brand Designation</label>
                                    <div className="relative group">
                                        <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                                        <input
                                            className={`w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all ${validationErrors.name ? 'border-red-500/30' : ''}`}
                                            name="name"
                                            value={centre.name ?? ''}
                                            onChange={handleChange}
                                            placeholder="Repair Centre Alpha"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Regional Jurisdiction</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                                        <input
                                            className={`w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all ${validationErrors.district ? 'border-red-500/30' : ''}`}
                                            name="district"
                                            value={centre.district ?? ''}
                                            onChange={handleChange}
                                            placeholder="Central District"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Terminal Address</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors z-10" size={16} />
                            {isLoaded ? (
                                <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged} options={{ componentRestrictions: { country: "rw" } }}>
                                    <input
                                        className={`w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-blue-500/50 outline-none transition-all ${validationErrors.address ? 'border-red-500/30' : ''}`}
                                        name="address"
                                        value={centre.address ?? ''}
                                        onChange={handleChange}
                                        placeholder="Scan for location coordinates..."
                                    />
                                </Autocomplete>
                            ) : (
                                <input className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white" name="address" value={centre.address ?? ''} onChange={handleChange} />
                            )}
                        </div>
                    </div>
                </section>

                {/* Logistics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="glass-card premium-card p-10 border-none space-y-8">
                        <h3 className="text-xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Communication Protocols</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Analog Interface</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs text-slate-300" type="tel" name="phone" value={centre.phone ?? ''} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Digital Endpoint</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                                    <input className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs text-slate-300" type="email" name="email" value={centre.email ?? ''} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card premium-card p-10 border-none space-y-8">
                        <h3 className="text-xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Operational Window</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Initialization</label>
                                <input className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-xs text-slate-300" type="time" name="opening_time" value={centre.opening_time ?? ''} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Termination</label>
                                <input className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-xs text-slate-300" type="time" name="closing_time" value={centre.closing_time ?? ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Active Cycles</label>
                            <input className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 px-4 text-xs text-slate-300" name="working_days" value={centre.working_days ?? ''} onChange={handleChange} placeholder="e.g. Mon - Sat" />
                        </div>
                    </section>
                </div>

                {/* Geospatial Section */}
                <section className="glass-card premium-card p-4 border-none bg-slate-900 overflow-hidden space-y-4">
                    <div className="p-8 flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Geospatial Positioning</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Map visualization of your terminal node.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-slate-600 uppercase">Latitude</span>
                                <span className="text-xs font-mono text-blue-500 font-bold">{parseFloat(centre.latitude || 0).toFixed(6)}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-slate-600 uppercase">Longitude</span>
                                <span className="text-xs font-mono text-blue-500 font-bold">{parseFloat(centre.longitude || 0).toFixed(6)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] rounded-[2rem] overflow-hidden grayscale brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-1000">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={(centre.latitude && centre.longitude) ? { lat: parseFloat(centre.latitude), lng: parseFloat(centre.longitude) } : KIGALI_CENTER}
                                zoom={15}
                                onClick={onMapClick}
                                options={{ styles: MAP_STYLES, disableDefaultUI: true, zoomControl: true }}
                            >
                                {(centre.latitude && centre.longitude) && (
                                    <Marker
                                        position={{ lat: parseFloat(centre.latitude), lng: parseFloat(centre.longitude) }}
                                        icon={{
                                            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
                                            fillColor: "#3B82F6",
                                            fillOpacity: 1,
                                            strokeWeight: 2,
                                            strokeColor: "#ffffff",
                                            scale: 2,
                                            anchor: { x: 12, y: 22 }
                                        }}
                                    />
                                )}
                            </GoogleMap>
                        ) : <div className="h-full bg-slate-900 flex items-center justify-center text-slate-500">Initializing Grid...</div>}
                    </div>
                </section>

                <section className="glass-card premium-card p-12 border-none space-y-8">
                    <h3 className="text-xl font-normal text-white italic tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Brand Narrative</h3>
                    <div className="relative group">
                        <FileText className="absolute left-6 top-6 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={20} />
                        <textarea
                            className="w-full h-48 bg-white/[0.02] border-2 border-white/5 rounded-3xl p-6 pl-16 text-sm text-slate-300 focus:border-blue-500/50 outline-none transition-all resize-none italic leading-relaxed"
                            name="description"
                            value={centre.description ?? ''}
                            onChange={handleChange}
                            placeholder="Articulate your technical specializations and service philosophy..."
                        />
                    </div>
                </section>

                {/* Submit */}
                <div className="flex items-center justify-between p-12 glass-card premium-card border-none bg-blue-600/10">
                    <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white tracking-tight">Encrypted Upload</div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Your brand assets are protected by SureFix Security Protocol 2.5.</div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="h-16 px-12 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4"
                    >
                        {isSaving ? (
                            <><div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" /> SYNCHRONIZING...</>
                        ) : (isNew ? 'INITIALIZE NETWORK IDENTITY' : 'SYNC BRAND ASSETS')}
                    </button>
                </div>
            </form>
            </main>
        </div>
    );
};

export default ShopProfile;

