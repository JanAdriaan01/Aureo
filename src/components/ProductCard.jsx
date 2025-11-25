import React from "react";
import { Link, useNavigate } from "react-router-dom";

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

  const code = p.code || p.codePrefix || p.system || p.id || p.productCode || p.sku || "";
  const price = typeof p.price === "number" ? p.price : Number(p.basePrice || p.price) || null;

  return (
    <div className="border rounded-xl overflow-hidden shadow bg-white group hover:shadow-lg transition-shadow flex flex-col">
      {/* Image */}
      <Link to={`/products/${encodeURIComponent(code)}`}>
        <div className="w-full h-48 sm:h-56 bg-zinc-100 flex items-center justify-center overflow-hidden p-3">
          <img
            src={image}
            alt={p.title || code}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title */}
        <div className="font-semibold text-sm sm:text-base break-words">
          {p.title || code}
        </div>

        {/* Colour swatches */}
        {p.coloursAvailable?.length > 0 && (
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            {p.coloursAvailable.slice(0, 6).map((c) => (
              <div
                key={c.code || c}
                title={c.name || c.code || c}
                className="w-5 h-5 rounded-full border overflow-hidden"
                style={{ backgroundColor: c.hex || undefined }}
              >
                {c.image ? <img src={c.image} alt={c.name || c.code} className="w-full h-full object-cover" /> : null}
              </div>
            ))}
          </div>
        )}

        {/* Stock status */}
        {p.stock !== undefined && (
          <div className={`mt-1 text-xs font-medium ${p.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {p.stock > 0 ? "In Stock" : "Out of Stock"}
          </div>
        )}

        {/* Price + View button always at bottom */}
        <div className="mt-auto">
          {price !== null ? (
            <div className="text-sm sm:text-base font-bold mt-2">R {Number(price).toLocaleString()}</div>
          ) : (
            <div className="text-xs text-zinc-500 mt-2">Price on request</div>
          )}

          <button
            onClick={() => navigate(`/products/${encodeURIComponent(code)}`)}
            className="mt-2 w-full px-2 py-1 text-xs border rounded text-zinc-900 hover:bg-zinc-100"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}