import React, { useMemo, useState } from "react";
import { ACW_CATALOGUE } from "../data/acw-catalogue";
import FiltersSidebar from "../components/FiltersSidebar";
import ProductCard from "../components/ProductCard";
import ProductListItem from "../components/ProductListItem";
import SortViewBar from "../components/SortViewBar";

// Full colour mapping for display
const COLOR_MAP = {
  BR: { name: "Bronze", hex: "#b08d57" },
  B: { name: "Black", hex: "#000000" },
  N: { name: "Natural", hex: "#D8C6B8" },
  C: { name: "Charcoal", hex: "#333333" },
  W: { name: "White", hex: "#FFFFFF" },
  DEF: { name: "Default", hex: "#eee" },
};

export default function Products() {
  const products = useMemo(() => {
    if (!ACW_CATALOGUE) return [];
    return Object.entries(ACW_CATALOGUE).map(([code, p]) => {
      const firstImage =
        p.image || Object.values(p.imagesByColour || {})[0]?.[0] || "/placeholder.png";

      const price = Number(p.basePrice) || null;

      const coloursAvailable = Object.keys(p.imagesByColour || {}).map((c) => ({
        code: c,
        name: COLOR_MAP[c]?.name || c,
        hex: COLOR_MAP[c]?.hex || "#eee",
        image: p.imagesByColour[c]?.[0] || null,
      }));

      const size = p.dimensions
        ? `${p.dimensions.width} x ${p.dimensions.height} mm`
        : null;

      return {
        code,
        title: p.title || code,
        category: p.category || "Product",
        image: firstImage,
        price,
        coloursAvailable,
        size,
        raw: p,
      };
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [colourFilter, setColourFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState("price-asc");
  const [viewMode, setViewMode] = useState("grid");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );
  const colours = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((p) => p.coloursAvailable.map((c) => c.code)))
      ),
    [products]
  );
  const sizes = useMemo(
    () => Array.from(new Set(products.map((p) => p.size).filter(Boolean))),
    [products]
  );

  const displayed = useMemo(() => {
    let items = products
      .filter((p) => !categoryFilter || p.category === categoryFilter)
      .filter(
        (p) =>
          !colourFilter ||
          p.coloursAvailable.some((c) => c.code === colourFilter)
      )
      .filter((p) => !sizeFilter || p.size === sizeFilter)
      .filter(
        (p) =>
          p.price !== null &&
          p.price >= priceRange[0] &&
          p.price <= priceRange[1]
      )
      .filter(
        (p) =>
          !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (sortBy === "price-asc") items.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "price-desc") items.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === "title-asc") items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else if (sortBy === "title-desc") items.sort((a, b) => (b.title || "").localeCompare(a.title || ""));

    return items;
  }, [products, categoryFilter, colourFilter, sizeFilter, priceRange, searchQuery, sortBy]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4">Shop</h1>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-[520px] px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
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
          <SortViewBar
            count={displayed.length}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {displayed.length === 0 ? (
            <div className="text-sm text-zinc-600 mt-4">
              No products match your filters.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
              {displayed.map((prod) => (
                <ProductCard key={prod.code} prod={prod} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-4">
              {displayed.map((prod) => (
                <ProductListItem key={prod.code} prod={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}