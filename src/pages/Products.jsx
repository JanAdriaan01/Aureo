import React, { useMemo, useState } from "react";
import { ACW_CATALOGUE } from "../data/acw-catalogue";
import FiltersSidebar from "../components/FiltersSidebar";
import ProductCard from "../components/ProductCard";
import { findColourMeta } from "../utils/colourMeta";

export default function Products() {
  const products = useMemo(() => {
    if (!ACW_CATALOGUE) return [];
    return Object.entries(ACW_CATALOGUE).map(([code, p]) => {
      const firstImage = p.image || Object.values(p.imagesByColour || {})[0]?.[0] || "/placeholder.png";
      const price = Number(p.basePrice) || null;
      const coloursAvailable = Object.keys(p.imagesByColour || {}).map((c) => {
        const meta = findColourMeta(c);
        return { ...meta, image: p.imagesByColour[c]?.[0] || null };
      });

      const size = p.dimensions ? `${p.dimensions.width}x${p.dimensions.height}` : null;

      return { code, title: p.title || code, category: p.category || "Product", image: firstImage, price, coloursAvailable, size };
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colourFilter, setColourFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
  const colours = useMemo(() => Array.from(new Set(products.flatMap(p => p.coloursAvailable.map(c => c.code)))), [products]);
  const sizes = useMemo(() => Array.from(new Set(products.map(p => p.size).filter(Boolean))), [products]);

  const displayed = useMemo(() => products
    .filter(p => !categoryFilter || p.category === categoryFilter)
    .filter(p => !colourFilter || p.coloursAvailable.some(c => c.code === colourFilter))
    .filter(p => !sizeFilter || p.size === sizeFilter)
    .filter(p => p.price !== null && p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter(p => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  , [products, categoryFilter, colourFilter, sizeFilter, priceRange, searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4">Shop</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-lg px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="grid md:grid-cols-[260px_minmax(0,1fr)] gap-4 md:gap-8">
        <FiltersSidebar
          categories={categories}
          colours={colours}
          sizes={sizes}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          colourFilter={colourFilter}
          setColourFilter={setColourFilter}
          sizeFilter={sizeFilter}
          setSizeFilter={setSizeFilter}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />

        <div className="min-w-0">
          {displayed.length === 0 ? (
            <div className="text-sm text-zinc-600">No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayed.map(prod => <ProductCard key={prod.code} prod={prod} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}