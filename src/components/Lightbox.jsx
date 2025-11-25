// src/components/Lightbox.jsx
import React, { useEffect, useRef, useState } from "react";

export default function Lightbox({ items, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const overlayRef = useRef(null);

  useEffect(() => {
    overlayRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, onClose]);

  if (!items?.length) return null;

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10 max-w-[96vw] max-h-[92vh] w-full flex items-center justify-center">
        <button onClick={onClose} className="absolute top-3 right-3 text-white bg-black/40 px-3 py-2 rounded-md">✕</button>
        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 sm:left-4 text-white bg-black/30 p-2 rounded-full hidden sm:block">←</button>
        <div className="bg-white rounded-md overflow-hidden max-w-full max-h-full flex items-center justify-center">
          <img src={items[index].src} alt={items[index].alt || ""} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        </div>
        <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 sm:right-4 text-white bg-black/30 p-2 rounded-full hidden sm:block">→</button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={(ev) => { ev.stopPropagation(); setIndex(i); }} className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}