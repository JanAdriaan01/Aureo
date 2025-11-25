// src/components/HeaderSearch.jsx
import React from "react";

export default function HeaderSearch({ value = "", onChange = () => {}, onSubmit = null }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (typeof onSubmit === "function") onSubmit(value);
      }}
      className="flex items-center gap-2 w-full max-w-xl"
    >
      <label htmlFor="site-search" className="sr-only">Search</label>
      <div className="relative w-full">
        <input
          id="site-search"
          type="search"
          placeholder="Search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
          aria-label="Search"
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded bg-zinc-900 text-white text-sm"
          aria-label="Search"
        >
          Search
        </button>
      </div>
    </form>
  );
}