// src/pages/ProductDetails.jsx
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ACW_CATALOGUE } from "../data/acw-catalogue.js";
import { useOrder } from "../context/OrderContext.jsx";
import Input from "../components/ui/Input";


const STANDARD_COLOURS = [
  { code: "BW", name: "White" },
  { code: "B", name: "Black" },
  { code: "BR", name: "Bronze" },
  { code: "C", name: "Charcoal" },
  { code: "N", name: "Natural" },
];

const FALLBACK_DIMENSIONS = { width: 1200, height: 1500 };

export default function ProductDetails() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addItem } = useOrder();

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

  const dims = product.dimensions || FALLBACK_DIMENSIONS;
  const sizeLabel = `${dims.width} x ${dims.height} mm`;

  const imagesByColour = product.imagesByColour || {};
  const colourOptions = STANDARD_COLOURS.map((c) => {
    const imgs = imagesByColour[c.code] && imagesByColour[c.code].length > 0
      ? imagesByColour[c.code]
      : product.image
        ? [product.image]
        : ["/placeholder.png"];
    return { ...c, images: imgs };
  });

  const unitPrice = typeof product.basePrice === "number" ? product.basePrice : Number(product.basePrice) || 0;
  const [selectedColour, setSelectedColour] = useState(colourOptions[0]?.code || STANDARD_COLOURS[0].code);
  const [selectedImage, setSelectedImage] = useState(colourOptions[0]?.images?.[0] || product.image || "/placeholder.png");
  const [quantity, setQuantity] = useState(1);

  const FIXED_GLAZING = "10mm Clear Float";
  const FIXED_TINT = "Standard Tint";

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

  // Related products (same codePrefix)
  const relatedProducts = Object.values(ACW_CATALOGUE)
    .filter((p) => p.codePrefix === product.codePrefix && p.code !== product.code)
    .slice(0, 4);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Main product section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Image gallery */}
        <div>
          <div className="rounded-2xl overflow-hidden border mb-4">
            <img src={selectedImage} alt={`${product.title} ${selectedColour}`} className="w-full h-96 object-cover" />
          </div>
          <div className="flex gap-3">
            {colourOptions.map((o) => (
              <button
                key={o.code}
                onClick={() => onColourChange(o.code)}
                className={`w-20 h-20 rounded-lg overflow-hidden border ${selectedColour === o.code ? "border-zinc-900" : "border-zinc-200"}`}
              >
                <img src={o.images[0]} alt={o.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.title || product.codePrefix}</h1>
          <div className="text-zinc-600">{product.shortDescription || product.description}</div>

          {/* Specs */}
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

          {/* Colour selector */}
          <div>
            <label className="block text-sm font-semibold mb-1">Colour</label>
            <select
              value={selectedColour}
              onChange={(e) => onColourChange(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {colourOptions.map((o) => (
                <option key={o.code} value={o.code}>{o.name}</option>
              ))}
            </select>
            <div className="text-xs text-zinc-500 mt-1">All colours are same price</div>
          </div>

          <Input label="Quantity" type="number" value={quantity} onChange={(v) => setQuantity(Number(v))} required />

          <div className="text-2xl font-semibold">{unitPrice ? `R ${Number(unitPrice).toLocaleString()}` : "Price on request"}</div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-3">
            <button onClick={handleAddToOrder} className="px-6 py-3 rounded-xl bg-zinc-900 text-white">
              🛒 Add to Order
            </button>

            {/* Back button */}
            <button onClick={() => navigate(-1)} className="px-4 py-3 rounded-xl border">
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
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

        <div>
          {activeTab === "description" && <div className="text-zinc-700">{product.description || "No description available."}</div>}
          {activeTab === "additional" && <div className="text-zinc-700">{product.additionalInfo || "No additional information available."}</div>}
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
                  <div className="font-semibold">{r.author}</div>
                  <div className="text-sm text-zinc-500">{r.date}</div>
                </div>
                <div className="flex items-center mt-1">
                  {Array.from({ length: r.rating }, (_, i) => <span key={i} className="text-yellow-400">★</span>)}
                  {Array.from({ length: 5 - r.rating }, (_, i) => <span key={i} className="text-zinc-300">★</span>)}
                </div>
                <p className="mt-1 text-zinc-700">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500">No reviews yet.</p>
        )}
      </div>

      {/* Related Products */}
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