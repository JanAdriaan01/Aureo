// src/pages/Products.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ACW_CATALOGUE } from "../data/acw-catalogue.js";

/**
 * Updated Products.jsx
 * - mobile-enhanced: h-48 on mobile, sm:h-56 on larger screens
 * - conditional padding based on image orientation (landscape / portrait / square)
 * - ProductCard component uses hook correctly (no hooks inside loops)
 *
 * Local test image: use UPLOADED_TEST_IMAGE if you need to visually verify.
 */

const UPLOADED_TEST_IMAGE = "/mnt/data/ASD911.jpg"; // <-- local test image you uploaded (optional)

const COLOUR_MAP = [
  { code: "W", name: "White", hex: "#FFFFFF" },
  { code: "B", name: "Black", hex: "#0B0B0B" },
  { code: "BR", name: "Bronze", hex: "#6B4F3A" },
  { code: "C", name: "Charcoal", hex: "#2F2F2F" },
  { code: "N", name: "Natural", hex: "#C0A97A" },
];

function findColourMeta(code) {
  return COLOUR_MAP.find((c) => c.code === code) || { code, name: code, hex: "#E5E7EB" };
}

/* Hook: detect image orientation (landscape | portrait | square) */
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

/* ProductCard: isolated so hooks are valid and behavior consistent */
function ProductCard({ prod }) {
  // orientation detection for conditional padding
  const orientation = useImageOrientation(prod.image || UPLOADED_TEST_IMAGE);
  // choose padding: landscape gets more vertical breathing room
  const paddingClass = orientation === "landscape" ? "p-3" : orientation === "portrait" ? "p-2" : "p-1";

  return (
    <div className="border rounded-xl overflow-hidden shadow bg-white">
      <Link to={`/products/${encodeURIComponent(prod.code)}`}>
        {/* mobile: h-48, sm+: h-56; padding conditional; overflow-hidden ensures no escape */}
        <div
          className={`w-full h-48 sm:h-56 bg-zinc-100 flex items-center justify-center overflow-hidden ${paddingClass}`}
          style={{ boxSizing: "border-box" }}
        >
          <img
            src={prod.image || UPLOADED_TEST_IMAGE || "/placeholder.png"}
            alt={prod.title}
            className="max-w-full max-h-full object-contain"
            // inline style fallback to ensure containment if CSS is overridden elsewhere
            style={{ display: "block", width: "auto", height: "100%" }}
          />
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{prod.title}</div>
            <div className="text-sm text-zinc-500">{prod.category}</div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {prod.coloursAvailable && prod.coloursAvailable.length > 0 ? (
            prod.coloursAvailable.slice(0, 6).map((c) => (
              <div key={c.code} title={c.name} className="w-6 h-6 rounded-full border overflow-hidden" style={{ flex: "0 0 24px" }}>
                {c.image ? (
                  <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  <div style={{ backgroundColor: c.hex, width: "100%", height: "100%" }} />
                )}
              </div>
            ))
          ) : (
            <div className="w-6 h-6 rounded-full border bg-zinc-100" title="No colour images available" />
          )}
        </div>

        <div className="mt-3">
          {prod.price !== null ? (
            <div className="text-xl font-bold">R {Number(prod.price).toLocaleString()}</div>
          ) : (
            <div className="text-sm text-zinc-500">Price on request</div>
          )}
        </div>

        <Link
          to={`/products/${encodeURIComponent(prod.code)}`}
          className="mt-4 inline-block px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm hover:bg-zinc-800"
        >
          View
        </Link>
      </div>
    </div>
  );
}

export default function Products() {
  // build products list preserving existing mapping
  const products = useMemo(() => {
    if (!ACW_CATALOGUE || typeof ACW_CATALOGUE !== "object") return [];

    return Object.entries(ACW_CATALOGUE).map(([code, p]) => {
      const firstImage =
        p.image ||
        (p.imagesByColour && Object.values(p.imagesByColour)[0]?.[0]) ||
        "/placeholder.png";

      const price = typeof p.basePrice === "number" ? p.basePrice : Number(p.basePrice) || null;

      const imagesByColour = p.imagesByColour || {};
      const availableColourCodes = Object.keys(imagesByColour).filter((k) => {
        const arr = imagesByColour[k];
        return Array.isArray(arr) && arr.length > 0;
      });

      if (availableColourCodes.length === 0 && p.image && typeof p.image === "string") {
        const match = p.image.match(/\/images\/[^/]+\/([^/]+)\//);
        if (match && match[1]) availableColourCodes.push(match[1]);
      }

      const coloursAvailable = availableColourCodes
        .map((c) => {
          const meta = findColourMeta(c);
          return {
            code: meta.code,
            name: meta.name,
            hex: meta.hex,
            image: (imagesByColour[c] && imagesByColour[c][0]) || null,
          };
        })
        .filter((v, i, arr) => arr.findIndex((x) => x.code === v.code) === i);

      return {
        code,
        title: p.title || p.codePrefix || code,
        category: p.category || "Product",
        image: firstImage,
        price,
        coloursAvailable,
      };
    });
  }, []);

  // UI state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [searchQuery, setSearchQuery] = useState("");

  // categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category || "Product")));
  }, [products]);

  // displayed items
  const displayed = useMemo(() => {
    let items = [...products];

    if (typeFilter) items = items.filter((p) => p.category === typeFilter);

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(q));
    }

    if (sortBy === "price-asc") items.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sortBy === "price-desc") items.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else if (sortBy === "title-asc") items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else if (sortBy === "title-desc") items.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

    return items;
  }, [products, typeFilter, sortBy, searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* responsive sizes for product thumbs are handled via Tailwind classes in ProductCard */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4">Shop</h1>
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-lg px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="hidden md:block w-64" />
        <div className="text-sm text-zinc-500">Showing {displayed.length} item{displayed.length !== 1 ? "s" : ""}</div>

        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(true)} className="md:hidden text-sm px-3 py-2 rounded-md border border-zinc-300 bg-white">Filters</button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden sm:inline">Sort by</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-sm border border-zinc-300 rounded-md px-2 py-1 bg-white">
              <option value="price-asc">Price (low → high)</option>
              <option value="price-desc">Price (high → low)</option>
              <option value="title-asc">Name (A → Z)</option>
              <option value="title-desc">Name (Z → A)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[260px_minmax(0,1fr)] gap-4 md:gap-8 items-start">
        <aside className="hidden md:block space-y-6 bg-white border border-zinc-200 rounded-2xl p-4 h-max sticky top-24">
          <h2 className="font-semibold text-zinc-800 mb-4">Filters</h2>

          <div className="mb-4">
            <div className="font-medium text-sm text-zinc-800 mb-1">Window Type</div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm">
              <option value="">All types</option>
              {categories.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="text-xs text-zinc-500">
            Prices shown are for <b>clear glass &amp; white frame</b>. Adjust on the product page.
          </div>
        </aside>

        <div className="min-w-0">
          {displayed.length === 0 ? (
            <div className="text-sm text-zinc-600">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayed.map((prod) => (
                <ProductCard key={prod.code} prod={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}