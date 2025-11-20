// src/pages/ProductDetails.jsx
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ACW_CATALOGUE } from "../data/acw-catalogue.js";
import { useOrder } from "../context/OrderContext.jsx";
import Input from "../components/ui/Input";

const LATEST_COLOURS = [
  { code: "W", name: "White" },
  { code: "B", name: "Black" },
  { code: "BR", name: "Bronze" },
  { code: "C", name: "Charcoal" },
  { code: "N", name: "Natural" },
];

// fallback dimension
const FALLBACK_DIMENSIONS = { width: 1200, height: 1500 };

export default function ProductDetails() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addItem } = useOrder();

  // Resolve product robustly (by key or by matching title/codePrefix)
  const product = useMemo(() => {
    if (!ACW_CATALOGUE) return null;
    return (
      ACW_CATALOGUE[code] ||
      Object.values(ACW_CATALOGUE).find((p) => p.codePrefix === code || p.title === code) ||
      null
    );
  }, [code]);

  if (!product) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="text-zinc-600">No product for code: {code}</p>
        <button onClick={() => navigate("/products")} className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded">
          Back to Products
        </button>
      </div>
    );
  }

  // Dimensions & size label
  const dims = product.dimensions || FALLBACK_DIMENSIONS;
  const sizeLabel = `${dims.width} x ${dims.height} mm`;

  // Build colour options:
  //  - union of LATEST_COLOURS plus any extra colour keys found in product.imagesByColour
  const imagesByColour = product.imagesByColour || {};
  const extraColourKeys = Object.keys(imagesByColour).filter((k) => !LATEST_COLOURS.find((c) => c.code === k));
  const mergedColourList = [
    ...LATEST_COLOURS,
    ...extraColourKeys.map((k) => ({ code: k, name: k })),
  ];

  // Map each colour to an array of images (fallback to product.image or placeholder)
  const colourOptions = mergedColourList.map((c) => {
    const imgs =
      imagesByColour[c.code] && imagesByColour[c.code].length > 0
        ? imagesByColour[c.code]
        : product.image
        ? [product.image]
        : ["/placeholder.png"];
    return { ...c, images: imgs };
  });

  // Price and state
  const unitPrice = typeof product.basePrice === "number" ? product.basePrice : Number(product.basePrice) || 0;
  const [selectedColour, setSelectedColour] = useState(colourOptions[0]?.code || mergedColourList[0].code);
  const [selectedImage, setSelectedImage] = useState(colourOptions[0]?.images?.[0] || product.image || "/placeholder.png");
  const [quantity, setQuantity] = useState(1);

  // Prefer product metadata glazing if present, otherwise fallback
  const FIXED_GLAZING = product.metadata?.glazing || "10mm Clear Float";
  const FIXED_TINT = product.metadata?.tinting || product.tinting || "Standard Tint";

  const onColourChange = (c) => {
    setSelectedColour(c);
    const opt = colourOptions.find((o) => o.code === c);
    setSelectedImage(opt?.images?.[0] || product.image || "/placeholder.png");
  };

  const handleAddToOrder = () => {
    const qtyNum = Number(quantity) || 1;
    const price = Number(unitPrice) || 0;
    const subtotal = price * qtyNum;

    const item = {
      system: product.codePrefix || code,
      systemName: `${product.title || product.codePrefix || code} (${sizeLabel})`,
      size: sizeLabel,
      glazing: FIXED_GLAZING,
      finish: selectedColour,
      quantity: qtyNum,
      price,
      subtotal,
      image: selectedImage,
      timestamp: new Date().toISOString(),
    };

    addItem(item);
    window.dispatchEvent(new Event("cart:open"));
  };

  // Tabs state
  const [activeTab, setActiveTab] = useState("description");

  // Related products (same category or same codePrefix fallback)
  const relatedProducts = Object.entries(ACW_CATALOGUE)
    .map(([k, p]) => ({ code: k, ...p }))
    .filter((p) => p.code !== (product.codePrefix || code) && (p.category === product.category || p.codePrefix === product.codePrefix))
    .slice(0, 6);

  // Share helpers
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`${product.title} — ${product.shortDescription || product.description || ""}`);
  const shareUrl = encodeURIComponent(pageUrl);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      // tiny UI feedback could be added; keep simple
      alert("Link copied to clipboard");
    } catch {
      alert("Could not copy link — please copy manually");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Product grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: image + thumbnails */}
        <div>
          <div className="rounded-2xl overflow-hidden border mb-4">
            <img src={selectedImage} alt={`${product.title} ${selectedColour}`} className="w-full h-96 object-cover" />
          </div>

          {/* thumbnails: show images for selected colour, plus small colour swatches */}
          <div className="flex gap-3 items-center">
            {/* small gallery of selected colour images */}
            <div className="flex gap-2">
              {(colourOptions.find((o) => o.code === selectedColour)?.images || [selectedImage]).slice(0, 6).map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(img)} className="w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={img} alt={`${product.title}-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* colour swatches (clickable) */}
            <div className="ml-4 flex gap-2 items-center">
              {colourOptions.map((o) => (
                <button
                  key={o.code}
                  onClick={() => onColourChange(o.code)}
                  title={o.name}
                  className={`flex flex-col items-center gap-1 text-xs ${selectedColour === o.code ? "opacity-100" : "opacity-80"}`}
                >
                  <div className={`w-10 h-10 rounded-full overflow-hidden border ${selectedColour === o.code ? "ring-2 ring-zinc-900" : ""}`}>
                    {/* use first image as swatch */}
                    <img src={o.images[0]} alt={o.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[10px] text-zinc-600">{o.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: details and actions */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.title || product.codePrefix}</h1>
          <div className="text-zinc-600">{product.shortDescription || product.description}</div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Size</label>
              <div className="px-4 py-2 rounded-lg border bg-zinc-50">{sizeLabel}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Glazing</label>
              <div className="px-4 py-2 rounded-lg border bg-zinc-50">{FIXED_GLAZING}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Tinting</label>
              <div className="px-4 py-2 rounded-lg border bg-zinc-50">{FIXED_TINT}</div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Finish</label>
              <div className="px-4 py-2 rounded-lg border bg-zinc-50">{selectedColour}</div>
            </div>
          </div>

          {/* Colour selector (dropdown for accessibility) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Choose Colour</label>
            <select
              value={selectedColour}
              onChange={(e) => onColourChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {colourOptions.map((o) => (
                <option key={o.code} value={o.code}>{o.name} ({o.code})</option>
              ))}
            </select>
            <div className="text-xs text-zinc-500 mt-1">All colours same price (select to preview)</div>
          </div>

          <Input label="Quantity" type="number" value={quantity} onChange={(v) => setQuantity(Number(v))} required />

          {/* Price */}
          <div className="text-2xl font-semibold">{unitPrice ? `R ${Number(unitPrice).toLocaleString()}` : "Price on request"}</div>

          {/* Actions: Add to Order, Share row, Back */}
          <div className="flex flex-col gap-3 mt-3">
            <button onClick={handleAddToOrder} className="px-6 py-3 rounded-xl bg-zinc-900 text-white w-full">
              🛒 Add to Order
            </button>

            {/* Share buttons row */}
            <div className="flex gap-2 items-center">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg border inline-flex items-center gap-2"
              >
                <span>🔗</span> Share
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg border inline-flex items-center gap-2"
              >
                <span>🐦</span> Tweet
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(product.title + " " + pageUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg border inline-flex items-center gap-2"
              >
                <span>💬</span> WhatsApp
              </a>
              <button onClick={copyLink} className="px-3 py-2 rounded-lg border inline-flex items-center gap-2">
                <span>📋</span> Copy link
              </button>
            </div>

            {/* Back button under share */}
            <div>
              <button onClick={() => navigate(-1)} className="px-4 py-3 rounded-xl border">
                Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs (Description / Additional Info) */}
      <div className="space-y-4">
        <div className="border-b flex gap-4">
          <button
            className={`px-4 py-2 ${activeTab === "description" ? "border-b-2 border-zinc-900 font-semibold" : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "additional" ? "border-b-2 border-zinc-900 font-semibold" : ""}`}
            onClick={() => setActiveTab("additional")}
          >
            Additional Info
          </button>
        </div>

        <div className="pt-4">
          {activeTab === "description" && (
            <div className="text-zinc-700 whitespace-pre-line">{product.description || "No description available."}</div>
          )}
          {activeTab === "additional" && (
            <div className="text-zinc-700 whitespace-pre-line">{product.additionalInfo || product.metadata?.additionalInfo || "No additional information available."}</div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((r, i) => (
              <div key={i} className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.author || "Anonymous"}</div>
                  <div className="text-sm text-zinc-500">{r.date || ""}</div>
                </div>
                <div className="flex items-center mt-1">
                  {Array.from({ length: Math.max(0, Math.min(5, r.rating || 0)) }, (_, idx) => (
                    <span key={idx} className="text-yellow-400">★</span>
                  ))}
                  {Array.from({ length: 5 - Math.max(0, Math.min(5, r.rating || 0)) }, (_, idx) => (
                    <span key={idx} className="text-zinc-300">★</span>
                  ))}
                </div>
                <p className="mt-1 text-zinc-700">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No reviews yet.</p>
        )}
      </div>

      {/* Related products under reviews */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Related Products</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.code} className="border rounded-lg overflow-hidden">
                <img src={p.image || "/placeholder.png"} alt={p.title} className="w-full h-48 object-cover" />
                <div className="p-3">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-zinc-600">{p.basePrice ? `R ${Number(p.basePrice).toLocaleString()}` : "Price on request"}</div>
                  <button onClick={() => navigate(`/product/${p.code}`)} className="mt-2 px-3 py-2 bg-zinc-900 text-white rounded-lg">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}