import React, { useState } from 'react';
import { Star, X, Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { reviewsAPI } from '@/api/reviews.api';

export default function ReviewModal({ isOpen, onClose, appointment, onSuccess }) {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await reviewsAPI.submitReview(appointment.appointment_id, {
                centre_id: appointment.centre_id,
                rating,
                comment
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#080c14]/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-white/5 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-transparent">
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>Rate Your Repair</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Feedback for {appointment.centre_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <p className="text-sm text-slate-400 mb-4">How was your experience with this service?</p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    onClick={() => setRating(star)}
                                    className="p-1 transition-transform active:scale-95"
                                >
                                    <Star
                                        size={36}
                                        className={`transition-all duration-300 ${star <= (hover || rating) 
                                            ? 'fill-blue-500 text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' 
                                            : 'text-slate-700'}`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="mt-4">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
                                {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Write a comment (Optional)</label>
                        <div className="relative">
                            <MessageSquare size={16} className="absolute top-4 left-4 text-slate-600" />
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us more about the service..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 h-32 text-sm text-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-600 resize-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : null}
                        {loading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
}
