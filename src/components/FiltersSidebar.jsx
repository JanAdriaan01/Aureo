import React, { useState, useEffect } from "react";
import { findColourMeta } from "../utils/colourMeta";

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
}) {
  const [localRange, setLocalRange] = useState(priceRange);

  // Sync local slider state with parent
  useEffect(() => {
    setLocalRange(priceRange);
  }, [priceRange]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), localRange[1]);
    setLocalRange([value, localRange[1]]);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), localRange[0]);
    setLocalRange([localRange[0], value]);
  };

  const handleMouseUp = () => setPriceRange([...localRange]);

  const resetFilters = () => {
    setCategoryFilter("");
    setColourFilter("");
    setSizeFilter("");
    const defaultRange = [0, 50000];
    setLocalRange(defaultRange);
    setPriceRange(defaultRange);
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
            return <option key={c} value={c}>{meta.name}</option>;
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

      {/* Price */}
      <div>
        <div className="font-medium text-sm text-zinc-800 mb-1">Price Range</div>
        <div className="flex gap-2 mb-1">
          <input
            type="number"
            value={localRange[0]}
            onChange={handleMinChange}
            onBlur={handleMouseUp}
            className="w-1/2 px-2 py-1 border rounded text-sm"
          />
          <span className="text-zinc-500">–</span>
          <input
            type="number"
            value={localRange[1]}
            onChange={handleMaxChange}
            onBlur={handleMouseUp}
            className="w-1/2 px-2 py-1 border rounded text-sm"
          />
        </div>

        <div className="relative h-3 mt-2">
          <div className="absolute w-full h-1 bg-zinc-200 rounded" />
          <div
            className="absolute h-1 bg-zinc-900 rounded"
            style={{
              left: `${(localRange[0] / 50000) * 100}%`,
              width: `${((localRange[1] - localRange[0]) / 50000) * 100}%`,
            }}
          />
          <input
            type="range"
            min="0"
            max="50000"
            step="500"
            value={localRange[0]}
            onChange={handleMinChange}
            onMouseUp={handleMouseUp}
            className="absolute w-full h-3 bg-transparent appearance-none pointer-events-auto"
          />
          <input
            type="range"
            min="0"
            max="50000"
            step="500"
            value={localRange[1]}
            onChange={handleMaxChange}
            onMouseUp={handleMouseUp}
            className="absolute w-full h-3 bg-transparent appearance-none pointer-events-auto"
          />
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          R {localRange[0].toLocaleString()} – R {localRange[1].toLocaleString()}
        </div>
      </div>
    </aside>
  );
}