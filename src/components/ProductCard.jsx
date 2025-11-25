// src/components/ProductCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrder } from "../context/OrderContext.jsx";

const UPLOADED_TEST_IMAGE = "/placeholder.png";

function getFirstImageFromProductShape(p) {
  // handle multiple shapes:
  // - catalogue product: p.imagesByColour (object)
  // - normalized prod: p.image
  // - prod with coloursAvailable: p.coloursAvailable[0].image
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

export default function ProductCard({ prod, product }) {
  // accept either prop name for backwards compatibility
  const p = prod || product;
  const navigate = useNavigate();
  const { addItem } = useOrder();

  if (!p) return null; // defensive

  const image = getFirstImageFromProductShape(p);
  // try to find a default colour code
  const defaultColour =
    p.coloursAvailable?.[0]?.code ||
    (p.imagesByColour && Object.keys(p.imagesByColour)[0]) ||
    p.defaultColour ||
    "W";

  const code = p.code || p.codePrefix || p.system || p.id || p.productCode || p.sku || "";

  const price = typeof p.price === "number" ? p.price : Number(p.basePrice || p.price) || null;

  const handleAddToOrder = (qty = 1) => {
    const qtyNum = Number(qty) || 1;
    addItem({
      code,
      title: p.title || p.name || code,
      quantity: qtyNum,
      price: price || 0,
      subtotal: (price || 0) * qtyNum,
      image,
      size:
        p.dimensions && p.dimensions.width && p.dimensions.height
          ? `${p.dimensions.width} x ${p.dimensions.height} mm`
          : p.size || null,
      glazing: p.metadata?.glazing || p.glazing || "10mm Clear Float",
      tint: p.metadata?.tinting || p.tint || "Standard Tint",
      finish: defaultColour,
      colour: defaultColour,
      timestamp: new Date().toISOString(),
    });
    window.dispatchEvent(new Event("cart:open"));
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow bg-white group hover:shadow-lg transition-shadow">
      <Link to={`/products/${encodeURIComponent(code || p.code)}`}>
        <div className="w-full h-48 sm:h-56 bg-zinc-100 flex items-center justify-center overflow-hidden p-3">
          <img
            src={image}
            alt={p.title || p.name || code}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col">
        <div className="font-semibold text-lg line-clamp-2 break-words">{p.title || p.name || code}</div>
        <div className="text-sm text-zinc-500">{p.category || p.type || ""}</div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {p.coloursAvailable?.slice(0, 6).map((c) => (
            <div
              key={c.code || c}
              title={c.name || c.code || c}
              className="w-6 h-6 rounded-full border overflow-hidden"
              style={{ flex: "0 0 24px", backgroundColor: c.hex || undefined }}
            >
              {c.image ? <img src={c.image} alt={c.name || c.code} className="w-full h-full object-cover" /> : null}
            </div>
          ))}
        </div>

        <div className="mt-3">
          {price !== null ? (
            <div className="text-xl font-bold">R {Number(price).toLocaleString()}</div>
          ) : (
            <div className="text-sm text-zinc-500">Price on request</div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => handleAddToOrder(1)} className="px-3 py-1 bg-zinc-900 text-white rounded text-sm">
            Add to Order
          </button>
          <button
            onClick={() => navigate(`/products/${encodeURIComponent(code || p.code)}`)}
            className="px-3 py-1 border rounded text-sm"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}