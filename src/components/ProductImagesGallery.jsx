// src/components/ProductImagesGallery.jsx
import React, { useEffect, useState } from "react";
import Lightbox from "./Lightbox";

export default function ProductImagesGallery({
  colourOptions = [],            // [{ code, name, images: [...] }, ...]
  selectedColour = "",          // currently selected colour code
  setSelectedColour = () => {}, // function to update colour in parent
  onImageSelect = null,         // optional: callback(selectedImage) to notify parent
  className = "",               // optional wrapper className
}) {
  // images for the currently selected colour (fallbacks handled)
  const imagesForColour = (() => {
    const opt = colourOptions.find((o) => o.code === selectedColour);
    if (opt && Array.isArray(opt.images) && opt.images.length > 0) return opt.images;
    // fallback to first available images set
    const first = colourOptions[0];
    if (first && Array.isArray(first.images) && first.images.length > 0) return first.images;
    return ["/placeholder.png"];
  })();

  // local selected image (main display). Keep in sync with selectedColour/imagesForColour.
  const [selectedImage, setSelectedImage] = useState(imagesForColour[0]);

  // lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // sync when selectedColour or colourOptions change
  useEffect(() => {
    const imgs = imagesForColour;
    const first = imgs && imgs.length > 0 ? imgs[0] : "/placeholder.png";
    setSelectedImage(first);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColour, JSON.stringify(colourOptions)]); // stringify to detect changes in arrays

  // notify parent when selectedImage changes (optional)
  useEffect(() => {
    if (typeof onImageSelect === "function") onImageSelect(selectedImage);
  }, [selectedImage, onImageSelect]);

  const thumbnails = Array.isArray(imagesForColour) ? imagesForColour : [selectedImage];

  return (
    <div className={className}>
      {/* Main image */}
      <div className="rounded-2xl overflow-hidden border mb-4 bg-zinc-50 h-[420px] sm:h-[560px] flex items-center justify-center">
        <img
          src={selectedImage || "/placeholder.png"}
          alt=""
          className="w-full h-full object-contain cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 items-center overflow-x-auto -mx-1">
        {/* small thumbnails for current colour */}
        <div className="flex gap-2 px-1">
          {thumbnails.slice(0, 8).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedImage(src)}
              className={`w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0 ${selectedImage === src ? "ring-2 ring-zinc-900" : ""}`}
              title={`Preview image ${i + 1}`}
            >
              <img src={src} alt={`thumb-${i}`} loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* colour swatches (switch colour sets) */}
        <div className="ml-4 flex gap-2 items-center px-1">
          {colourOptions.map((o) => {
            const thumb = (o.images && o.images[0]) || "/placeholder.png";
            return (
              <button
                key={o.code}
                onClick={() => {
                  setSelectedColour(o.code);
                  // selectedImage will auto-sync via useEffect above
                }}
                title={o.name}
                className={`flex flex-col items-center gap-1 text-xs ${selectedColour === o.code ? "opacity-100" : "opacity-80"}`}
                type="button"
              >
                <div className={`w-10 h-10 rounded-full overflow-hidden border ${selectedColour === o.code ? "ring-2 ring-zinc-900" : ""}`}>
                  <img src={thumb} alt={o.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="text-[10px] text-zinc-600">{o.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          items={thumbnails.map((s, i) => ({ src: s, alt: `${selectedColour || ""} ${i + 1}` }))}
          startIndex={thumbnails.indexOf(selectedImage) || 0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}