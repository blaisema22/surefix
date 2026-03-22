import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, X, Send } from 'lucide-react';
import Button from './Button';

const RatingModal = ({ open, title = 'Rate your experience', onConfirm, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (rating > 0) {
      onConfirm({ rating, review });
      setRating(0);
      setReview('');
      setHoverRating(0);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in">
      <div className="glass-card max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <Button variant="secondary" size="sm" icon={X} onClick={onCancel} className="!p-2" />
        </div>
        
        <div className="p-6">
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="p-2 transition-all hover:scale-110 group"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  size={28} 
                  className={`text-yellow-400 fill-yellow-400 transition-all group-hover:scale-110 ${
                    (hoverRating || rating) >= star 
                      ? 'scale-110 shadow-glow-yellow' 
                      : 'text-slate-500 fill-transparent'
                  }`} 
                />
              </button>
            ))}
          </div>
          
          <textarea
            className="sf-textarea w-full min-h-[100px] resize-vertical"
            placeholder="Share your experience (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            disabled={rating === 0}
            icon={Send}
          >
            Submit Rating
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RatingModal;

