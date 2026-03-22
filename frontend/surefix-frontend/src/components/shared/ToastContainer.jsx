import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-xl flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-right-full fade-in
                        ${toast.type === 'success' ? 'bg-[#064e3b]/95 border-[#059669]/50 text-[#34d399]' : ''}
                        ${toast.type === 'error' ? 'bg-[#450a0a]/95 border-[#b91c1c]/50 text-[#f87171]' : ''}
                        ${toast.type === 'info' ? 'bg-[#1e3a8a]/95 border-[#3b82f6]/50 text-[#60a5fa]' : ''}
                    `}
                    role="alert"
                >
                    <div className="mt-0.5 text-lg">
                        {toast.type === 'success' && <CheckCircle className="w-6 h-6" />}
                        {toast.type === 'error' && <AlertCircle className="w-6 h-6" />}
                        {toast.type === 'info' && <Info className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-sm m-0 capitalize mb-0.5">{toast.type}</h4>
                        <p className="m-0 text-sm opacity-90 leading-snug text-white/90">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;