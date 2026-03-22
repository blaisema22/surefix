import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCancel();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
      // Focus modal for accessibility
      setTimeout(() => modalRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 outline-none"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {danger && (
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
            )}
            <div className="flex-1">
              <h3 id="modal-title" className="text-lg font-bold text-white mb-2 leading-tight">{title}</h3>
              <p id="modal-desc" className="text-sm text-slate-400 leading-relaxed">{message}</p>
            </div>
            <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-4 bg-white/5 flex justify-end gap-3 border-t border-white/5">
          <button onClick={onCancel} className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">{cancelText}</button>
          <button onClick={onConfirm} className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all transform active:scale-95 ${danger ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;