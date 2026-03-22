import React, { useState, useEffect } from 'react';

export const DEVICE_TYPES = [
    { id: 'smartphone', label: 'Smartphone', icon: 'fa-solid fa-mobile-screen-button' },
    { id: 'tablet', label: 'Tablet', icon: 'fa-solid fa-tablet-screen-button' },
    { id: 'laptop', label: 'Laptop', icon: 'fa-solid fa-laptop' },
    { id: 'desktop', label: 'Desktop', icon: 'fa-solid fa-desktop' },
    { id: 'other', label: 'Other', icon: 'fa-solid fa-plug' },
];

const DeviceForm = ({ device, onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState({
        brand: '', model: '', device_type: 'smartphone', serial_number: '', purchase_year: '', issue_description: ''
    });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (device) {
            setFormData({
                brand: device.brand || '',
                model: device.model || '',
                device_type: device.device_type || 'smartphone',
                serial_number: device.serial_number || '',
                purchase_year: device.purchase_year ? String(device.purchase_year) : '',
                issue_description: device.issue_description || ''
            });
        } else {
            setFormData({ brand: '', model: '', device_type: 'smartphone', serial_number: '', purchase_year: '', issue_description: '' });
        }
    }, [device]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'serial_number') {
            setValidationError('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.serial_number && !/^[a-zA-Z0-9-]+$/.test(formData.serial_number)) {
            setValidationError('Serial number contains invalid characters (alphanumeric & hyphens only).');
            return;
        }

        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[18px] p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-white mb-6 font-sora">{device ? 'Edit Device' : 'Add New Device'}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#CBD5E1]">Brand</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g., Apple" required autoFocus className="w-full px-4 py-2.5 bg-[#0B0F1A] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#F1F5F9] text-sm placeholder:text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#CBD5E1]">Model</label>
                            <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g., iPhone 14 Pro" required className="w-full px-4 py-2.5 bg-[#0B0F1A] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#F1F5F9] text-sm placeholder:text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-[#CBD5E1]">Device Type</label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {DEVICE_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => handleChange({ target: { name: 'device_type', value: type.id } })}
                                    className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all ${formData.device_type === type.id
                                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                        : 'bg-[#0B0F1A] border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:bg-[#1F2937] hover:border-[rgba(255,255,255,0.2)]'
                                        }`}
                                >
                                    <i className={`${type.icon} text-lg`}></i>
                                    <span className="text-[10px] font-semibold uppercase tracking-wide">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#CBD5E1]">
                                Serial Number <span className="text-[#64748B] font-normal ml-1">(Optional)</span>
                            </label>
                            <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} placeholder="Leave blank if unknown" className={`w-full px-4 py-2.5 bg-[#0B0F1A] border rounded-xl text-[#F1F5F9] text-sm placeholder:text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50 ${validationError ? 'border-red-500/50' : 'border-[rgba(255,255,255,0.1)]'}`} />
                            {validationError && <p className="text-red-400 text-xs">{validationError}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-[#CBD5E1]">Purchase Year</label>
                            <input type="number" name="purchase_year" value={formData.purchase_year} onChange={handleChange} placeholder="Optional year" min="1900" max={new Date().getFullYear()} className="w-full px-4 py-2.5 bg-[#0B0F1A] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#F1F5F9] text-sm placeholder:text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                            <label className="block text-sm font-semibold text-[#CBD5E1]">Issue Description</label>
                            <span className={`text-xs ${formData.issue_description.length > 450 ? 'text-amber-400' : 'text-[#64748B]'}`}>
                                {formData.issue_description.length}/500
                            </span>
                        </div>
                        <textarea name="issue_description" value={formData.issue_description} onChange={handleChange} required rows="3" maxLength={500} placeholder="e.g., Cracked screen, battery issue..." className="w-full px-4 py-2.5 bg-[#0B0F1A] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#F1F5F9] text-sm placeholder:text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 focus:border-[#3B82F6]/50 resize-none"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-5 py-2 text-sm font-semibold text-[#CBD5E1] rounded-xl hover:bg-white/5 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2 text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-xl disabled:opacity-50 transition-colors">
                            {isSaving ? 'Saving...' : 'Save Device'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeviceForm;