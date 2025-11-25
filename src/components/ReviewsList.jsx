// src/components/ReviewsList.jsx
import React from "react";

export default function ReviewsList({ reviews }) {
  if (!reviews?.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      <div className="space-y-4">
        {reviews.map((r, idx) => (
          <div key={idx} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">{r.author}</div>
              <div className="flex space-x-1 text-yellow-500">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i}>{i < r.rating ? "★" : "☆"}</span>
                ))}
              </div>
            </div>
            <div className="text-sm text-zinc-700">{r.comment}</div>
            {r.date && <div className="text-xs text-zinc-400 mt-1">{new Date(r.date).toLocaleDateString()}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}