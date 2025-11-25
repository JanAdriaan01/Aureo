// src/components/SortViewBar.jsx
import React from "react";

export default function SortViewBar({
  count = 0,
  sortBy = "price-asc",
  setSortBy = () => {},
  viewMode = "grid", // "grid" or "list"
  setViewMode = () => {},
  onResetFilters = null,
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="text-sm text-zinc-600">Showing <span className="font-medium text-zinc-800">{count}</span> result{count !== 1 ? "s" : ""}</div>
        <div className="hidden sm:block text-xs text-zinc-500">|</div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">Sort</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1 border border-zinc-300 rounded text-sm"
          >
            <option value="price-asc">Price (low → high)</option>
            <option value="price-desc">Price (high → low)</option>
            <option value="title-asc">Name (A → Z)</option>
            <option value="title-desc">Name (Z → A)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="px-2 py-1 border rounded text-sm"
          title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
        >
          {viewMode === "grid" ? "List" : "Grid"}
        </button>

        <button
          onClick={() => { if (typeof onResetFilters === "function") onResetFilters(); }}
          className="px-2 py-1 text-xs text-zinc-600 hover:text-zinc-800"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}