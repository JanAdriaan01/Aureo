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

  return (
    <div className={className}>
      {/* Main image */}
      <div className="rounded-2xl overflow-hidden border mb-4 bg-zinc-50 h-[420px] sm:h-[560px] flex items-center justify-center">
        <img
          src={selectedImage || "/placeholder.png"}
          alt=""
          className="w-full h-full object-contain cursor-zoom-in block"
          onClick={() => setLightboxOpen(true)}
        />
      </div>

      {/* Color palette only, no thumbnail images */}
      <div className="mt-4 flex gap-2 items-center flex-wrap">
        {colourOptions.map((o) => {
          const swatchStyle = o.hex ? { backgroundColor: o.hex } : { backgroundColor: "#eee" };
          const isSelected = o.code === selectedColour;
          return (
            <button
              key={o.code}
              onClick={() => setSelectedColour(o.code)}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                isSelected ? "ring-2 ring-indigo-500" : "border-zinc-300"
              }`}
              aria-pressed={isSelected}
              aria-label={`Select ${o.name}`}
              title={o.name}
            >
              <span className="w-8 h-8 rounded-full" style={swatchStyle} />
            </button>
          );
        })}
      </div>

      {lightboxOpen && (
        <Lightbox
          items={imagesForColour.map((s, i) => ({ src: s, alt: `${selectedColour || ""} ${i + 1}` }))}
          startIndex={Math.max(0, imagesForColour.indexOf(selectedImage))}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}