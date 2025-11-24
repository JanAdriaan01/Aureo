// src/pages/ProductDetails.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ACW_CATALOGUE } from "../data/acw-catalogue.js";
import { useOrder } from "../context/OrderContext.jsx";
import Input from "../components/ui/Input";

/**
 * ProductDetails — responsive hero + mobile-safe thumbnails + accessible lightbox
 *
 * - programmatic Image() detection to choose object-fit and hero heights
 * - mobile-first object-contain, sm+ object-cover
 * - Lightbox to display full gallery; keyboard support and focus management
 */

// colour constants & fallbacks
const LATEST_COLOURS = [
  { code: "W", name: "White" },
  { code: "B", name: "Black" },
  { code: "BR", name: "Bronze" },
  { code: "C", name: "Charcoal" },
  { code: "N", name: "Natural" },
];

const FALLBACK_DIMENSIONS = { width: 1200, height: 1500 };

// local uploaded sample path (for your local testing)
const UPLOADED_TEST_IMAGE = "/mnt/data/ASD911.jpg";

/* Reusable lightbox (same behaviour as Products page) */
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
      try {
        lastActiveEl.current?.focus?.();
      } catch {}
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
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
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
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
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
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Next"
        >
          →
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-90 flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(ev) => {
                ev.stopPropagation();
                setIndex(i);
              }}
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

  // find product
  const product = useMemo(() => {
    if (!ACW_CATALOGUE) return null;
    return (
      ACW_CATALOGUE[code] ||
      Object.values(ACW_CATALOGUE).find((p) => p.codePrefix === code || p.title === code) ||
      null
    );
  }, [code]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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
  const extraColourKeys = Object.keys(imagesByColour).filter((k) => !LATEST_COLOURS.find((c) => c.code === k));
  const mergedColourList = [...LATEST_COLOURS, ...extraColourKeys.map((k) => ({ code: k, name: k }))];

  const colourOptions = mergedColourList.map((c) => {
    const imgs =
      imagesByColour[c.code] && imagesByColour[c.code].length > 0
        ? imagesByColour[c.code]
        : product.image
        ? [product.image]
        : ["/placeholder.png"];
    return { ...c, images: imgs };
  });

  const unitPrice = typeof product.basePrice === "number" ? product.basePrice : Number(product.basePrice) || 0;
  const [selectedColour, setSelectedColour] = useState(colourOptions[0]?.code || mergedColourList[0]?.code || "W");
  const [selectedImage, setSelectedImage] = useState(
    colourOptions[0]?.images?.[0] || product.image || "/placeholder.png"
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const first = colourOptions[0];
    const firstCode = first?.code || mergedColourList[0]?.code || "W";
    const firstImg = first?.images?.[0] || product.image || "/placeholder.png";
    setSelectedColour(firstCode);
    setSelectedImage(firstImg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const [activeTab, setActiveTab] = useState("description");

  const relatedProducts = Object.entries(ACW_CATALOGUE)
    .map(([k, p]) => ({ code: k, ...p }))
    .filter((p) => p.code !== (product.codePrefix || code) && (p.category === product.category || p.codePrefix === product.codePrefix))
    .slice(0, 6);

  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`${product.title} — ${product.shortDescription || product.description || ""}`);
  const shareUrl = encodeURIComponent(pageUrl);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      alert("Link copied to clipboard");
    } catch {
      alert("Could not copy link — please copy manually");
    }
  };

  /* ---------- HERO: panorama detection & responsive safe rendering ---------- */
  const [isPanorama, setIsPanorama] = useState(false);
  const PANORAMA_THRESHOLD = 1.35; // tuned to catch moderate wides (like 1.5:1)
  const heroMobileHeight = 420; // mobile default
  const heroDesktopHeight = 560; // sm+ larger

  // detect aspect ratio via Image() (reliable with cache)
  useEffect(() => {
    setIsPanorama(false);
    if (!selectedImage) return;
    let cancelled = false;
    const img = new Image();
    img.onload = function () {
      if (cancelled) return;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      if (!w || !h) {
        setIsPanorama(false);
        return;
      }
      const ratio = w / h;
      setIsPanorama(ratio >= PANORAMA_THRESHOLD);
    };
    img.onerror = function () {
      if (cancelled) return;
      setIsPanorama(false);
    };
    img.src = selectedImage;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [selectedImage, product.codePrefix, code]);

  // compute hero styles
  const heroContainerStyle = {
    height: `${heroMobileHeight}px`,
    minHeight: `${heroMobileHeight}px`,
    maxHeight: `${heroMobileHeight}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const heroImageStyle = isPanorama
    ? {
        objectFit: "contain",
        width: "auto",
        height: "100%",
        display: "block",
      }
    : {
        objectFit: "cover",
        width: "100%",
        height: "100%",
        display: "block",
      };

  // Lightbox state & items
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryItems = (colourOptions.find((o) => o.code === selectedColour)?.images || [selectedImage]).map((s, i) => ({
    src: s,
    alt: `${product.title} ${i + 1}`,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 overflow-x-hidden">
      {/* inline CSS to increase hero height on sm+ and ensure thumbnails behave */}
      <style>{`
        @media (min-width: 640px) {
          .product-hero { height: ${heroDesktopHeight}px !important; min-height: ${heroDesktopHeight}px !important; max-height: ${heroDesktopHeight}px !important; }
        }
        /* Thumbnails use contain on mobile, cover on sm+ */
        .thumb-btn img { object-fit: contain; width: 100%; height: 100%; display: block; }
        @media (min-width:640px) {
          .thumb-btn img { object-fit: cover; }
        }
      `}</style>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="min-w-0">
          {/* HERO: wrapper uses .product-hero to get sm+ override */}
          <div
            className="rounded-2xl overflow-hidden border mb-4 bg-zinc-50 product-hero"
            style={heroContainerStyle}
            data-panorama={isPanorama ? "true" : "false"}
          >
            <img
              src={selectedImage || product.image || UPLOADED_TEST_IMAGE || "/placeholder.png"}
              alt={`${product.title} ${selectedColour}`}
              loading="lazy"
              style={heroImageStyle}
              className="w-full h-full cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            />
          </div>

          {/* Thumbnails + colour swatches */}
          <div className="flex gap-3 items-center flex-wrap overflow-x-auto -mx-1">
            <div className="flex gap-2 flex-wrap px-1">
              {(colourOptions.find((o) => o.code === selectedColour)?.images || [selectedImage])
                .slice(0, 8)
                .map((img, i) => (
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

      {/* Tabs, reviews, related products (unchanged, omitted here for brevity) */}
      {/* ... */}
      {lightboxOpen && <Lightbox items={galleryItems} startIndex={0} onClose={() => setLightboxOpen(false)} />}
    </div>
  );
}