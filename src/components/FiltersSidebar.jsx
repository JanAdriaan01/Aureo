import React from "react";
import { findColourMeta } from "../utils/colourMeta";
import DualRangeSlider from "./DualRangeSlider";

export default function FiltersSidebar({
  categories,
  colours,
  sizes,
  categoryFilter,
  setCategoryFilter,
  colourFilter,
  setColourFilter,
  sizeFilter,
  setSizeFilter,
  priceRange,
  setPriceRange,
  // Add any other existing filter props
}) {
  const resetFilters = () => {
    setCategoryFilter("");
    setColourFilter("");
    setSizeFilter("");
    setPriceRange([0, 50000]);
    // reset any other filters you have
  };

  return (
    <aside className="hidden md:block space-y-6 bg-white border border-zinc-200 rounded-2xl p-4 h-max sticky top-24">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-zinc-800 mb-2">Filters</h2>
        <button onClick={resetFilters} className="text-xs text-zinc-500 hover:underline">
          Reset
        </button>
      </div>

      {/* Category */}
      <div>
        <div className="font-medium text-sm text-zinc-800 mb-1">Category</div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Colour */}
      <div>
        <div className="font-medium text-sm text-zinc-800 mb-1">Colour</div>
        <select
          value={colourFilter}
          onChange={(e) => setColourFilter(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
        >
          <option value="">All Colours</option>
          {colours.map((c) => {
            const meta = findColourMeta(c);
            return <option key={c} value={c}>{meta?.name || c}</option>;
          })}
        </select>
      </div>

      {/* Size */}
      <div>
        <div className="font-medium text-sm text-zinc-800 mb-1">Size</div>
        <select
          value={sizeFilter}
          onChange={(e) => setSizeFilter(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
        >
          <option value="">All Sizes</option>
          {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Price Range with Dual Slider */}
      <div>
        <div className="font-medium text-sm text-zinc-800 mb-1">Price Range</div>
        <DualRangeSlider value={priceRange} onChange={setPriceRange} min={0} max={50000} step={500} />
      </div>

      {/* Add back any other original filter sections here */}
    </aside>
  );
}