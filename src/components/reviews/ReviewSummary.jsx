import React from "react";
import { PRODUCT_REVIEWS } from "../../data/reviews";

export default function ReviewSummary({ sku, showCount = true }) {
  const reviews = PRODUCT_REVIEWS[sku] || [];
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  if (reviews.length === 0) {
    return showCount ? (
      <div className="flex items-center gap-1 text-sm text-zinc-500">
        <span>No reviews yet</span>
      </div>
    ) : null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3 h-3 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-zinc-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
        <span className="text-sm font-medium text-zinc-700 ml-1">{averageRating.toFixed(1)}</span>
      </div>
      {showCount && (
        <span className="text-sm text-zinc-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
      )}
    </div>
  );
}