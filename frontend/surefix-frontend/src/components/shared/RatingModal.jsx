import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

export default function RatingModal({ open, onClose, title = "Rate Service", onSubmit, loading = false }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');

    if (!open) return null;

    const handleSubmit = () => {
        if (rating > 0) {
            onSubmit({ rating, comment });
            // Reset after submit logic is handled by parent or on close
        }
    };

    return (
        <div className="sf-modal-overlay" onClick={onClose}>
            <div className="sf-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
                <div className="sf-modal-header">
                    <span className="sf-modal-title">{title}</span>
                    <button className="sf-modal-close" onClick={onClose}><X size={18} /></button>
                </div>

                <div className="sf-modal-body">
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="bg-transparent border-none cursor-pointer transition-transform hover:scale-110 focus:outline-none p-1"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={32}
                                    fill={star <= (hover || rating) ? "#fbbf24" : "transparent"}
                                    color={star <= (hover || rating) ? "#fbbf24" : "#4b5563"}
                                    strokeWidth={1.5}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="sf-textarea"
                        rows="4"
                        placeholder="Share your experience (optional)..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                </div>

                <div className="sf-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={rating === 0 || loading}>
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}
