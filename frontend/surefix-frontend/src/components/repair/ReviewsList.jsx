import React from 'react';

const ReviewsList = ({ reviews }) => {
    return (
        <div className="bg-sf-panel rounded-lg p-6 border border-gray-800 mt-6">
            <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
            {reviews.length > 0 ? (
                <ul className="space-y-4">
                    {reviews.map((review, index) => (
                        <li key={index} className="border-b border-gray-800 pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white">{review.customer_name || 'Anonymous'}</span>
                                <span className="text-yellow-400 font-bold">★ {review.rating}/5</span>
                            </div>
                            <p className="text-sm text-gray-400">{review.comment || 'No comment provided.'}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(review.date).toLocaleDateString()}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 italic">No reviews yet.</p>
            )}
        </div>
    );
};

export default ReviewsList;