// src/pages/ProductDetails.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
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

const FALLBACK_DIMENSIONS = { width: 1200, height: 1500 };
const UPLOADED_TEST_IMAGE = "/mnt/data/ASD911.jpg";

/* Reusable Lightbox identical to Products page */
function Lightbox({ items, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const overlayRef = useRef(null);
  const lastActiveEl = useRef(null);

  useEffect(() => {
    lastActiveEl.current = document.activeElement;
    overlayRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lastActiveEl.current?.focus?.();
    };
  }, [items.length, onClose]);

  if (!items || items.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-70 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-80 max-w-[96vw] max-h-[92vh] w-full flex items-center justify-center">
        <button
          className="absolute top-3 right-3 z-90 text-white bg-black/40 px-3 py-2 rounded-md"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <button
          className="absolute left-2 sm:left-4 z-90 text-white bg-black/30 p-2 rounded-full hidden sm:block"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Previous"
        >
          ←
        </button>

        <div className="bg-white rounded-md overflow-hidden max-w-full max-h-full flex items-center justify-center">
          <img
            src={items[index].src}
            alt={items[index].alt || ""}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
          />
        </div>

        <button
          className="absolute right-2 sm:right-4 z-90 text-white bg-black/30 p-2 rounded-full hidden sm:block"
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Next"
        >
          →
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-90 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(ev) => { ev.stopPropagation(); setIndex(i); }}
              aria-label={`Go to image ${i + 1}`}
              className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { addItem } = useOrder();

  const product = useMemo(() => {
    if (!ACW_CATALOGUE) return null;
    return ACW_CATALOGUE[code] || Object.values(ACW_CATALOGUE).find((p) => p.codePrefix === code || p.title === code) || null;
  }, [code]);

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [code]);

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
  const extraColourKeys = Object.keys(imagesByColour).filter((k) => !LATEST_COLOURS.find((c) => c.code === k));
  const mergedColourList = [...LATEST_COLOURS, ...extraColourKeys.map((k) => ({ code: k, name: k }))];

  const colourOptions = mergedColourList.map((c) => {
    const imgs = imagesByColour[c.code]?.length > 0 ? imagesByColour[c.code] : product.image ? [product.image] : ["/placeholder.png"];
    return { ...c, images: imgs };
  });

  const unitPrice = Number(product.basePrice) || 0;
  const [selectedColour, setSelectedColour] = useState(colourOptions[0]?.code || "W");
  const [selectedImage, setSelectedImage] = useState(colourOptions[0]?.images?.[0] || product.image || "/placeholder.png");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const first = colourOptions[0];
    setSelectedColour(first?.code || "W");
    setSelectedImage(first?.images?.[0] || product.image || "/placeholder.png");
  }, [product?.codePrefix]);

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
    addItem({
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
    });
    window.dispatchEvent(new Event("cart:open"));
  };

  const [activeTab, setActiveTab] = useState("description");

  const relatedProducts = Object.entries(ACW_CATALOGUE)
    .map(([k, p]) => ({ code: k, ...p }))
    .filter((p) => p.code !== (product.codePrefix || code) && (p.category === product.category || p.codePrefix === product.codePrefix))
    .slice(0, 6);

  const pageUrl = window.location.href;
  const shareText = encodeURIComponent(`${product.title} — ${product.shortDescription || product.description || ""}`);
  const shareUrl = encodeURIComponent(pageUrl);

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(pageUrl); alert("Link copied to clipboard"); } 
    catch { alert("Could not copy link — please copy manually"); }
  };

  const [isPanorama, setIsPanorama] = useState(false);
  const PANORAMA_THRESHOLD = 1.35;
  const heroMobileHeight = 420;
  const heroDesktopHeight = 560;

  useEffect(() => {
    setIsPanorama(false);
    if (!selectedImage) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const ratio = (img.naturalWidth || 0) / (img.naturalHeight || 1);
      setIsPanorama(ratio >= PANORAMA_THRESHOLD);
    };
    img.onerror = () => { if (!cancelled) setIsPanorama(false); };
    img.src = selectedImage;
    return () => { cancelled = true; img.onload = null; img.onerror = null; };
  }, [selectedImage]);

  const heroContainerStyle = { height: heroMobileHeight, minHeight: heroMobileHeight, maxHeight: heroMobileHeight, display: "flex", alignItems: "center", justifyContent: "center" };
  const heroImageStyle = isPanorama ? { objectFit: "contain", width: "auto", height: "100%", display: "block" } : { objectFit: "cover", width: "100%", height: "100%", display: "block" };

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryItems = (colourOptions.find((o) => o.code === selectedColour)?.images || [selectedImage]).map((s, i) => ({ src: s, alt: `${product.title} ${i + 1}` }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 overflow-x-hidden">
      <style>{`
        @media (min-width: 640px) {
          .product-hero { height: ${heroDesktopHeight}px !important; min-height: ${heroDesktopHeight}px !important; max-height: ${heroDesktopHeight}px !important; }
        }
        .thumb-btn img { object-fit: contain; width: 100%; height: 100%; display: block; }
        @media (min-width:640px) { .thumb-btn img { object-fit: cover; } }
      `}</style>

      {/* ---------- HERO + Thumbnails + Colour Selector ---------- */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="min-w-0">
          <div className="rounded-2xl overflow-hidden border mb-4 bg-zinc-50 product-hero" style={heroContainerStyle} data-panorama={isPanorama ? "true" : "false"}>
            <img
              src={selectedImage || product.image || UPLOADED_TEST_IMAGE || "/placeholder.png"}
              alt={`${product.title} ${selectedColour}`}
              loading="lazy"
              style={heroImageStyle}
              className="w-full h-full cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            />
          </div>

          <div className="flex gap-3 items-center flex-wrap overflow-x-auto -mx-1">
            <div className="flex gap-2 flex-wrap px-1">
              {(colourOptions.find((o) => o.code === selectedColour)?.images || [selectedImage]).slice(0, 8).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`thumb-btn w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0 ${selectedImage === img ? "ring-2 ring-zinc-900" : ""}`}
                  title={`Preview image ${i + 1}`}
                  style={{ minWidth: "80px" }}
                >
                  <img src={img} alt={`${product.title}-${i}`} loading="lazy" />
                </button>
              ))}
            </div>

            <div className="ml-4 flex gap-2 items-center flex-wrap overflow-x-auto px-1">
              {colourOptions.map((o) => (
                <button
                  key={o.code}
                  onClick={() => onColourChange(o.code)}
                  title={o.name}
                  className={`flex flex-col items-center gap-1 text-xs ${selectedColour === o.code ? "opacity-100" : "opacity-80"}`}
                >
                  <div className={`w-10 h-10 rounded-full overflow-hidden border ${selectedColour === o.code ? "ring-2 ring-zinc-900" : ""}`}>
                    <img src={o.images[0]} alt={o.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="text-[10px] text-zinc-600">{o.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          <h1 className="text-3xl font-bold truncate">{product.title || product.codePrefix}</h1>
          <div className="text-zinc-600 break-words">{product.shortDescription || product.description}</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Size</label>
              <div className="px-4 py-2 rounded-lg border bg-zinc-50 break-words">{sizeLabel}</div>
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

          <div>
            <label className="block text-sm font-semibold mb-1">Choose Colour</label>
            <select value={selectedColour} onChange={(e) => onColourChange(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              {colourOptions.map((o) => (<option key={o.code} value={o.code}>{o.name} ({o.code})</option>))}
            </select>
            <div className="text-xs text-zinc-500 mt-1">All colours same price (select to preview)</div>
          </div>

          <Input label="Quantity" type="number" value={quantity} onChange={(v) => setQuantity(Number(v))} required />
          <div className="text-2xl font-semibold">{unitPrice ? `R ${Number(unitPrice).toLocaleString()}` : "Price on request"}</div>

          <div className="flex flex-col gap-3 mt-3">
            <button onClick={handleAddToOrder} className="px-6 py-3 rounded-xl bg-zinc-900 text-white w-full">🛒 Add to Order</button>

            <div className="flex gap-2 items-center flex-wrap">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg border inline-flex items-center gap-2">🔗 Share</a>
              <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg border inline-flex items-center gap-2">🐦 Tweet</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(product.title + " " + pageUrl)}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg border inline-flex items-center gap-2">💬 WhatsApp</a>
              <button onClick={copyLink} className="px-3 py-2 rounded-lg border inline-flex items-center gap-2">📋 Copy link</button>
            </div>

            <div><button onClick={() => navigate(-1)} className="px-4 py-3 rounded-xl border">Back</button></div>
          </div>
        </div>
      </div>

      {/* ---------- TABS: Detailed Info, Additional Info, Features ---------- */}
      <div className="mt-10">
        <div className="border-b border-zinc-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {["description", "additional", "features"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                }`}
              >
                {tab === "description" ? "Detailed Information" : tab === "additional" ? "Additional Information" : "Features"}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6 text-zinc-700 space-y-4">
          {activeTab === "description" && (
            <div dangerouslySetInnerHTML={{ __html: product.description || "No detailed information available." }} />
          )}
          {activeTab === "additional" && (
            <div dangerouslySetInnerHTML={{ __html: product.additionalInformation || "No additional information available." }} />
          )}
          {activeTab === "features" && (
            <div dangerouslySetInnerHTML={{ __html: product.features || "No features available." }} />
          )}
        </div>
      </div>

{/* ---------- PRODUCT REVIEWS ---------- */}
{product.reviews && product.reviews.length > 0 && (
  <div className="mt-10">
    <h2 className="text-2xl font-bold mb-4">Reviews</h2>
    <div className="space-y-4">
      {product.reviews.map((r, idx) => (
        <div key={idx} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold">{r.author}</div>
            <div className="flex space-x-1 text-yellow-500">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i}>{i < r.rating ? "★" : "☆"}</span>
              ))}
            </div>
          </div>
          <div className="text-sm text-zinc-700">{r.comment}</div>
          {r.date && <div className="text-xs text-zinc-400 mt-1">{new Date(r.date).toLocaleDateString()}</div>}
        </div>
      ))}
    </div>
  </div>
)}

      {/* ---------- RELATED PRODUCTS ---------- */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.code} className="border rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                <img
                  src={p.image || "/placeholder.png"}
                  alt={p.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="p-3">
                  <h3 className="text-sm font-semibold truncate">{p.title}</h3>
                  <div className="text-xs text-zinc-500">{p.category}</div>
                  <div className="text-sm font-medium mt-1">{p.basePrice ? `R ${p.basePrice.toLocaleString()}` : "Price on request"}</div>
                  <button
                    onClick={() => navigate(`/products/${p.codePrefix || p.code}`)}
                    className="mt-2 w-full px-2 py-1 text-xs rounded bg-zinc-900 text-white"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lightboxOpen && <Lightbox items={galleryItems} startIndex={0} onClose={() => setLightboxOpen(false)} />}
    </div>
  );
}