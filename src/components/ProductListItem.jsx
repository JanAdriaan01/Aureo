// src/components/ProductListItem.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductListItem({ prod }) {
  const navigate = useNavigate();
  return (
    <div className="border rounded-xl overflow-hidden flex flex-col sm:flex-row bg-white shadow hover:shadow-lg transition-shadow p-4 gap-4">
      <div className="w-full sm:w-48 flex-shrink-0 h-48 bg-zinc-100 flex items-center justify-center overflow-hidden">
        <img src={prod.image} alt={prod.title} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div className="font-semibold text-lg">{prod.title}</div>
          <div className="text-sm text-zinc-500">{prod.category}</div>
          <div className="text-xl font-bold mt-2">R {prod.price?.toLocaleString()}</div>
        </div>
        <button
          onClick={() => navigate(`/products/${prod.code}`)}
          className="mt-2 w-full sm:w-auto px-3 py-1 border rounded text-sm"
        >
          View
        </button>
      </div>
    </div>
  );
}