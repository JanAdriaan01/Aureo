// src/components/ProductImagesGallery.jsx
import React, { useEffect, useState } from "react";
import Lightbox from "./Lightbox";

export default function ProductImagesGallery({
  colourOptions = [],
  selectedColour = "",
  setSelectedColour = () => {},
  onImageSelect = null,
  className = "",
}) {
  const imagesForColour = (() => {
    const opt = colourOptions.find((o) => o.code === selectedColour);
    if (opt && Array.isArray(opt.images) && opt.images.length > 0) return opt.images;
    const first = colourOptions[0];
    if (first && Array.isArray(first.images) && first.images.length > 0) return first.images;
    return ["/placeholder.png"];
  })();

  const [selectedImage, setSelectedImage] = useState(imagesForColour[0] || "/placeholder.png");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const imgs = imagesForColour;
    const first = imgs && imgs.length > 0 ? imgs[0] : "/placeholder.png";
    setSelectedImage(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColour, JSON.stringify(colourOptions)]);

  useEffect(() => {
    if (typeof onImageSelect === "function") onImageSelect(selectedImage);
  }, [selectedImage, onImageSelect]);

  const thumbnails = Array.isArray(imagesForColour) ? imagesForColour : [selectedImage];

  return (
    <div className={className}>
      {/* Main image: object-contain protects aspect and prevents overflow */}
      <div className="rounded-2xl overflow-hidden border mb-4 bg-zinc-50 h-[420px] sm:h-[560px] flex items-center justify-center">
        <img
          src={selectedImage || "/placeholder.png"}
          alt=""
          className="w-full h-full object-contain cursor-zoom-in block"
          onClick={() => setLightboxOpen(true)}
        />
      </div>

      {/* Thumbnails & swatches — no negative margins, nowrap to avoid pushing page width */}
      <div className="flex items-center overflow-x-auto px-1">
        <div className="flex gap-2 px-1 flex-nowrap">
          {thumbnails.slice(0, 8).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedImage(src)}
              className={`w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0 ${selectedImage === src ? "ring-2 ring-zinc-900" : ""}`}
              title={`Preview image ${i + 1}`}
              style={{ minWidth: 64 }}
            >
              <img src={src} alt={`thumb-${i}`} loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="ml-4 flex gap-2 items-center px-1 flex-nowrap">
          {colourOptions.map((o) => {
            const thumb = (o.images && o.images[0]) || "/placeholder.png";
            return (
              <button
                key={o.code}
                onClick={() => setSelectedColour(o.code)}
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

      {lightboxOpen && (
        <Lightbox
          items={thumbnails.map((s, i) => ({ src: s, alt: `${selectedColour || ""} ${i + 1}` }))}
          startIndex={Math.max(0, thumbnails.indexOf(selectedImage))}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}