import React from "react";
import { Link, useNavigate } from "react-router-dom";

const COLOR_MAP = {
  BR: { name: "Bronze", hex: "#b08d57" },
  B: { name: "Black", hex: "#000000" },
  N: { name: "Natural", hex: "#D8C6B8" },
  C: { name: "Charcoal", hex: "#333333" },
  W: { name: "White", hex: "#FFFFFF" },
  DEF: { name: "Default", hex: "#eee" },
};

const UPLOADED_TEST_IMAGE = "/placeholder.png";

function getFirstImageFromProductShape(p) {
  if (!p) return UPLOADED_TEST_IMAGE;
  if (p.image) return p.image;
  if (p.imagesByColour && typeof p.imagesByColour === "object") {
    const firstArr = Object.values(p.imagesByColour)[0];
    if (Array.isArray(firstArr) && firstArr.length > 0) return firstArr[0];
  }
  if (p.coloursAvailable && Array.isArray(p.coloursAvailable) && p.coloursAvailable[0]?.image) {
    return p.coloursAvailable[0].image;
  }
  return UPLOADED_TEST_IMAGE;
}

export default function ProductCard({ prod }) {
  const p = prod;
  const navigate = useNavigate();

  if (!p) return null;

  const image = getFirstImageFromProductShape(p);
  const code = p.code || p.codePrefix || p.system || p.id || "";
  const price = typeof p.price === "number" ? p.price : Number(p.basePrice || p.price) || null;
  const size = p.size || (p.dimensions ? `${p.dimensions.width} x ${p.dimensions.height} mm` : null);

  return (
    <div className="relative border rounded-xl overflow-hidden shadow bg-white group flex flex-col cursor-pointer">
      {/* Image */}
      <Link to={`/products/${encodeURIComponent(code)}`}>
        <div className="w-full h-48 sm:h-56 bg-zinc-100 flex items-center justify-center overflow-hidden p-3 relative">
          <img
            src={image}
            alt={p.title || code}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
          {/* Hover View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/products/${encodeURIComponent(code)}`);
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs border rounded bg-white opacity-0 group-hover:opacity-100 hover:bg-zinc-100 transition-opacity duration-200 z-10"
          >
            View
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title */}
        <div className="font-semibold text-sm sm:text-base break-words">{p.title || code}</div>

        {/* Colour swatches */}
        {p.coloursAvailable?.length > 0 && (
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            {p.coloursAvailable.slice(0, 6).map((c) => (
              <div
                key={c.code || c}
                title={c.name || c.code}
                className="w-5 h-5 rounded-full border overflow-hidden"
                style={{ backgroundColor: COLOR_MAP[c.code]?.hex || c.hex || "#eee" }}
              />
            ))}
          </div>
        )}

        {/* Spacer to push price to bottom */}
        <div className="flex-1" />

        {/* Price */}
        {price !== null ? (
          <div className="text-sm sm:text-base font-bold mt-2">R {Number(price).toLocaleString()}</div>
        ) : (
          <div className="text-xs text-zinc-500 mt-2">Price on request</div>
        )}
      </div>
    </div>
  );
}