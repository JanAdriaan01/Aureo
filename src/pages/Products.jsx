// src/pages/Products.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ACW_CATALOGUE } from "../data/acw-catalogue.js";

/**
 * Products page — responsive + mobile-safe thumbnails + accessible lightbox
 *
 * Key features:
 * - programmatic Image() detection to mark panoramas
 * - mobile-first object-contain, sm+ object-cover for thumbnails
 * - accessible Lightbox: open by tapping thumbnail, keyboard navigation (Esc, ←, →), focus management
 * - tuned values: PANORAMA_THRESHOLD and thumbnail heights chosen to work with example /mnt/data/ASD911.jpg
 */

/* Colour map */
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

/* ------------------------
   Accessible Lightbox component (self-contained)
   Props:
    - items: array of { src, alt } images
    - startIndex: initial index
    - onClose: callback
   ------------------------ */
function Lightbox({ items, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const overlayRef = useRef(null);
  const lastActiveEl = useRef(null);

  useEffect(() => {
    lastActiveEl.current = document.activeElement;
    // focus overlay for keyboard handling
    overlayRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // restore focus
      try {
        lastActiveEl.current?.focus?.();
      } catch {}
    };
  }, [items.length, onClose]);

  if (!items || items.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-70 flex items-center justify-center p-4"
      onClick={(e) => {
        // close if clicking overlay but not when clicking inside content
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-80 max-w-[96vw] max-h-[92vh] w-full flex items-center justify-center">
        <button
          className="absolute top-3 right-3 z-90 text-white bg-black/40 px-3 py-2 rounded-md"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <button
          className="absolute left-2 sm:left-4 z-90 text-white bg-black/30 p-2 rounded-full hidden sm:block"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Previous"
        >
          ←
        </button>

        <div className="bg-white rounded-md overflow-hidden max-w-full max-h-full flex items-center justify-center">
          <img
            src={items[index].src}
            alt={items[index].alt || ""}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
          />
        </div>

        <button
          className="absolute right-2 sm:right-4 z-90 text-white bg-black/30 p-2 rounded-full hidden sm:block"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Next"
        >
          →
        </button>

        {/* dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-90 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(ev) => {
                ev.stopPropagation();
                setIndex(i);
              }}
              aria-label={`Go to image ${i + 1}`}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Product card — thumbnail behavior and lightbox trigger */
function ProductCard({ prod }) {
  const [isPanorama, setIsPanorama] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // threshold tuning: images wider than this (w/h) treated as panorama
  const PANORAMA_THRESHOLD = 1.35;

  // Preload image to detect aspect ratio (reliable with cache)
  useEffect(() => {
    setIsPanorama(false);
    if (!prod?.image) return;
    let cancelled = false;
    const img = new Image();
    img.onload = function () {
      if (cancelled) return;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) {
        setIsPanorama(false);
        return;
      }
      const ratio = w / h;
      setIsPanorama(ratio >= PANORAMA_THRESHOLD);
    };
    img.onerror = function () {
      if (cancelled) return;
      setIsPanorama(false);
    };
    img.src = prod.image;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [prod.image, prod.code]);

  const openLightbox = (e) => {
    // prevent Link navigation (image sits inside Link)
    e.preventDefault();
    e.stopPropagation();
    setLightboxOpen(true);
  };

  // items for lightbox (could be multiple in future if you add additional images)
  const items = [{ src: prod.image, alt: prod.title }];

  return (
    <div className="border rounded-xl overflow-hidden shadow bg-white">
      <Link to={`/products/${encodeURIComponent(prod.code)}`} aria-label={`Open ${prod.title} details`}>
        <div
          data-panorama={isPanorama ? "true" : "false"}
          className="product-thumb w-full bg-zinc-100 flex items-center justify-center overflow-hidden transition-all duration-200 relative"
        >
          {prod.image ? (
            // clicking the image opens the lightbox (prevents navigation)
            <img
              src={prod.image}
              alt={prod.title}
              onClick={openLightbox}
              className="block max-w-full max-h-full cursor-zoom-in"
              style={
                isPanorama
                  ? { objectFit: "contain", width: "auto", height: "100%" }
                  : { objectFit: "cover", width: "100%", height: "100%" }
              }
            />
          ) : (
            <div className="text-zinc-400">No image</div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-lg truncate">{prod.title}</div>
            <div className="text-sm text-zinc-500">{prod.category}</div>
          </div>
        </div>

        {/* Colour swatches */}
        <div className="mt-3 flex items-center gap-2">
          {prod.coloursAvailable && prod.coloursAvailable.length > 0 ? (
            prod.coloursAvailable.slice(0, 6).map((c) => (
              <div
                key={c.code}
                title={c.name}
                className="w-6 h-6 rounded-full border overflow-hidden"
                style={{ flex: "0 0 24px" }}
              >
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

      {lightboxOpen && <Lightbox items={items} startIndex={0} onClose={() => setLightboxOpen(false)} />}
    </div>
  );
}

/* Main Products page */
export default function Products() {
  // --- original product mapping (kept as-is) ---
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

  // --- UI state ---
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("price-asc");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || "Product"));
    return Array.from(set);
  }, [products]);

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
      {/* Inline CSS to control responsive heights for .product-thumb */}
      <style>{`
        /* mobile default: thumbnail height smaller so mobile layout is compact */
        .product-thumb { height: 140px; min-height: 140px; max-height: 140px; }
        @media (min-width: 640px) {
          /* sm and up: larger thumbnails */
          .product-thumb { height: 224px; min-height: 224px; max-height: 224px; }
        }
      `}</style>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4">Shop</h1>
        <div className="flex justify-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full max-w-lg px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="hidden md:block w-64" />
        <div className="text-sm text-zinc-500">
          Showing {displayed.length} item{displayed.length !== 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="md:hidden text-sm px-3 py-2 rounded-md border border-zinc-300 bg-white"
          >
            Filters
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden sm:inline">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-zinc-300 rounded-md px-2 py-1 bg-white"
              aria-label="Sort products"
            >
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
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
            >
              <option value="">All types</option>
              {categories.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-zinc-500">
            Prices shown are for <b>clear glass &amp; white frame</b>. Adjust on the product page.
          </div>
        </aside>

        <div
          className={`fixed inset-0 z-60 md:hidden transition-transform duration-300 ${
            filtersOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-hidden={!filtersOpen}
        >
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity ${filtersOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setFiltersOpen(false)}
          />
          <aside
            className={`absolute right-0 top-0 w-80 h-full bg-white p-4 border-l border-zinc-200 transform transition-transform duration-300 ${
              filtersOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ maxWidth: "90vw" }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-zinc-800">Filters</h2>
              <button className="text-zinc-600" onClick={() => setFiltersOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mb-4">
              <div className="font-medium text-sm text-zinc-800 mb-1">Window Type</div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
              >
                <option value="">All types</option>
                {categories.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-zinc-500">
              Prices shown are for <b>clear glass &amp; white frame</b>. Adjust on the product page.
            </div>
          </aside>
        </div>

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