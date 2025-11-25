// src/components/RelatedProductsGrid.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UPLOADED_TEST_IMAGE = "/placeholder.png";

// small hook copied from ProductCard to keep behavior identical
function useImageOrientation(src) {
  const [orientation, setOrientation] = useState("square");

  useEffect(() => {
    if (!src) {
      setOrientation("square");
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      if (img.naturalWidth > img.naturalHeight) setOrientation("landscape");
      else if (img.naturalHeight > img.naturalWidth) setOrientation("portrait");
      else setOrientation("square");
    };
    img.onerror = () => {
      if (cancelled) return;
      setOrientation("square");
    };
    img.src = src;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return orientation;
}

function getFirstImage(p) {
  if (!p) return UPLOADED_TEST_IMAGE;
  if (p.image) return p.image;
  if (p.imagesByColour && typeof p.imagesByColour === "object") {
    const arr = Object.values(p.imagesByColour)[0];
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  }
  if (p.coloursAvailable && Array.isArray(p.coloursAvailable) && p.coloursAvailable[0]?.image) {
    return p.coloursAvailable[0].image;
  }
  return UPLOADED_TEST_IMAGE;
}

export default function RelatedProductsGrid({ products = [] }) {
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Related Items</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {products.map((p) => {
          const imgSrc = getFirstImage(p);
          const orientation = useImageOrientation(imgSrc);
          const paddingClass = orientation === "landscape" ? "p-3" : orientation === "portrait" ? "p-2" : "p-1";

          return (
            <div
              key={p.code || p.codePrefix || p.id || p.sku || imgSrc}
              className="border rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow bg-white"
            >
              <div
                className={`w-full h-48 sm:h-56 bg-zinc-100 flex items-center justify-center overflow-hidden ${paddingClass}`}
                style={{ boxSizing: "border-box" }}
                onClick={() => navigate(`/products/${encodeURIComponent(p.codePrefix || p.code || p.id || "")}`)}
              >
                <img
                  src={imgSrc || UPLOADED_TEST_IMAGE}
                  alt={p.title || p.name || ""}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  style={{ display: "block", width: "auto", height: "100%" }}
                />
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold line-clamp-2 break-words">{p.title || p.name}</h3>
                <div className="text-xs text-zinc-500">{p.category}</div>
                <div className="text-sm font-medium mt-1">
                  {p.basePrice || p.price ? `R ${(p.basePrice || p.price).toLocaleString()}` : "Price on request"}
                </div>

                <button
                  onClick={() => navigate(`/products/${encodeURIComponent(p.codePrefix || p.code || p.id || "")}`)}
                  className="mt-2 w-full px-2 py-1 text-xs rounded bg-zinc-900 text-white"
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}