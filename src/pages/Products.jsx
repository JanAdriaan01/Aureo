// src/pages/Products.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ACW_CATALOGUE } from "../data/acw-catalogue.js";

/**
 * Products grid — shows each ACW product with its primary image and fixed price.
 * Keeps existing product mapping intact; adds filter sidebar, mobile drawer and sort control.
 *
 * IMPORTANT: This file preserves all existing product mapping / image paths / links.
 */
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

      return {
        code,
        title: p.title || p.codePrefix || code,
        category: p.category || "Product",
        image: firstImage,
        price,
      };
    });
  }, []);

  // --- UI state ---
  const [filtersOpen, setFiltersOpen] = useState(false); // mobile drawer
  const [typeFilter, setTypeFilter] = useState(""); // category filter
  const [sortBy, setSortBy] = useState("price-asc"); // sort state
  const [searchQuery, setSearchQuery] = useState(""); // search state

  // derive unique categories for the sidebar dropdown
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category || "Product"));
    return Array.from(set);
  }, [products]);

  // apply filters + sorting + search to the original products (do not change original products array)
  const displayed = useMemo(() => {
    let items = [...products];

    if (typeFilter) items = items.filter((p) => p.category === typeFilter);

    // Apply search filter
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
      {/* Centered Shop header + search */}
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

      {/* Header: Sort + mobile filter toggle */}
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
        {/* Desktop Sidebar */}
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

        {/* Mobile Filter Drawer */}
        <div
          className={`fixed inset-0 z-60 md:hidden transition-transform duration-300 ${
            filtersOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-hidden={!filtersOpen}
        >
          <div
            className={`absolute inset-0 bg-black/30 transition-opacity ${
              filtersOpen ? "opacity-100" : "opacity-0"
            }`}
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
              <button className="text-zinc-600" onClick={() => setFiltersOpen(false)}>✕</button>
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

        {/* Grid + header */}
        <div className="min-w-0">
          {displayed.length === 0 ? (
            <div className="text-sm text-zinc-600">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayed.map((prod) => (
                <div key={prod.code} className="border rounded-xl overflow-hidden shadow bg-white">
                  <Link to={`/products/${encodeURIComponent(prod.code)}`}>
                    <div className="w-full h-56 bg-zinc-100 flex items-center justify-center overflow-hidden">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-zinc-400">No image</div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="font-semibold text-lg">{prod.title}</div>
                    <div className="text-sm text-zinc-500">{prod.category}</div>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}