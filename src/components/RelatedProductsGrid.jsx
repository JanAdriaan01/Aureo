// src/components/RelatedProductsGrid.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function RelatedProductsGrid({ products }) {
  const navigate = useNavigate();

  if (!products?.length) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Related Items</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p.code} className="border rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
            <img
              src={p.image || "/placeholder.png"}
              alt={p.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="p-3">
              <h3 className="text-sm font-semibold truncate">{p.title}</h3>
              <div className="text-xs text-zinc-500">{p.category}</div>
              <div className="text-sm font-medium mt-1">{p.basePrice ? `R ${p.basePrice.toLocaleString()}` : "Price on request"}</div>
              <button
                onClick={() => navigate(`/products/${p.codePrefix || p.code}`)}
                className="mt-2 w-full px-2 py-1 text-xs rounded bg-zinc-900 text-white"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}