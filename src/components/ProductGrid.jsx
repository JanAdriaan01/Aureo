// src/components/ProductGrid.jsx

import React from "react";
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

function ProductListItem({ p }) {
  const navigate = useNavigate();
  const price = p.price ?? p.basePrice ?? null;
  const image = p.image || (p.raw && (p.raw.image || Object.values(p.raw.imagesByColour || {})[0]?.[0])) || "/placeholder.png";

  return (
    <div className="border rounded-lg p-4 flex gap-4 items-start">
      <img src={image} alt={p.title} className="w-28 h-20 object-cover rounded" />
      <div className="flex-1">
        <div className="font-semibold">{p.title}</div>
        <div className="text-sm text-zinc-500">{p.category}</div>
        <div className="text-sm mt-2">{p.shortDescription || ""}</div>
      </div>
      <div className="w-36 flex flex-col items-end">
        <div className="text-lg font-bold">{price ? `R ${Number(price).toLocaleString()}` : "Price on request"}</div>
        <div className="mt-auto flex gap-2">
          <button onClick={() => navigate(`/products/${p.code}`)} className="px-3 py-1 border rounded text-sm">View</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ products = [], viewMode = "grid" }) {
  if (!products || products.length === 0) return null;

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((p) => <ProductListItem key={p.code} p={p} />)}
      </div>
    );
  }

  // grid view
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => <ProductCard key={p.code} prod={p} />)}
    </div>
  );
}