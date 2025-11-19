// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="py-12">
      <section className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center px-4">
        {/* Left: headline & CTAs */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Aluminium Windows, Doors & Louvres.
          </h1>

          <p className="text-lg text-zinc-600 max-w-xl">
            Premium systems in standard sizes — anodised or powder coated.
            Live pricing for standard sizes. Configure online; we fabricate.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-zinc-900 text-white font-medium shadow-sm hover:bg-zinc-800 transition"
            >
              Shop Now
            </button>

            <button
              onClick={() => navigate("/order")}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-zinc-300 text-zinc-800 bg-white hover:bg-zinc-50 transition"
            >
              Review Order
            </button>
          </div>

          <div className="mt-6 text-sm text-zinc-500">
            <strong>Lead times:</strong> 10–15 working days depending on finish & glazing.
          </div>
        </div>

        {/* Right: hero image */}
        <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-zinc-100">
          {/* Use a hero file in public/images. Replace path as needed. */}
          <img
            src="/images/hero-landing.jpg"
            alt="Premium Aluminium Windows"
            className="w-full h-full object-cover"
            onError={(e) => {
              // fallback: if hero missing, load a sample product image
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/ACW887/B/ACW887B.png";
            }}
          />
        </div>
      </section>

      {/* Small trust bar like your original */}
      <section className="max-w-7xl mx-auto mt-12 px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-zinc-200 p-4 bg-white">
            <div className="font-semibold">SANS-aligned</div>
            <div className="text-xs text-zinc-500">Glazing & wind load checks inline with local standards.</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-4 bg-white">
            <div className="font-semibold">Site-measured</div>
            <div className="text-xs text-zinc-500">We verify openings before fabrication.</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-4 bg-white">
            <div className="font-semibold">Warranty-backed</div>
            <div className="text-xs text-zinc-500">Finish & workmanship warranties available.</div>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-4 bg-white">
            <div className="font-semibold">Nationwide</div>
            <div className="text-xs text-zinc-500">Install teams across major metros.</div>
          </div>
        </div>
      </section>
    </div>
  );
}