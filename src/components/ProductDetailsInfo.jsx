// src/components/ProductDetailsInfo.jsx
import React from "react";
import Input from "./ui/Input";

export default function ProductDetailsInfo({
  title,
  description,
  sizeLabel,
  glazing,
  tint,
  finish,
  selectedColour,
  onColourChange,
  colourOptions,
  quantity,
  setQuantity,
  unitPrice,
  handleAddToOrder,
  shareLinks,
  navigateBack,
}) {
  return (
    <div className="flex flex-col gap-4 min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold break-words">{title}</h1>
      <div className="text-zinc-600 break-words">{description}</div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Size</label>
          <div className="px-4 py-2 rounded-lg border bg-zinc-50 break-words">{sizeLabel}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Glazing</label>
          <div className="px-4 py-2 rounded-lg border bg-zinc-50">{glazing}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Tinting</label>
          <div className="px-4 py-2 rounded-lg border bg-zinc-50">{tint}</div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Finish</label>
          <div className="px-4 py-2 rounded-lg border bg-zinc-50">{selectedColour}</div>
        </div>
      </div>

      {/* Colour selector */}
      <select
        value={selectedColour}
        onChange={(e) => onColourChange(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      >
        {colourOptions.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name} ({o.code})
          </option>
        ))}
      </select>

      {/* Quantity & Add to Order */}
      <Input
        label="Quantity"
        type="number"
        value={quantity}
        onChange={(v) => setQuantity(Number(v))}
        required
      />
      <div className="text-2xl font-semibold">
        {unitPrice ? `R ${unitPrice.toLocaleString()}` : "Price on request"}
      </div>

      <div className="flex flex-col gap-3 mt-3">
        <button
          onClick={handleAddToOrder}
          className="px-6 py-3 rounded-xl bg-zinc-900 text-white w-full"
        >
          🛒 Add to Order
        </button>

        {/* Share buttons */}
        <div className="flex gap-2 flex-wrap mt-3">
          {shareLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg border inline-flex items-center gap-2"
            >
              {s.label}
            </a>
          ))}
        </div>

        <button onClick={navigateBack} className="px-4 py-3 rounded-xl border">
          Back
        </button>
      </div>
    </div>
  );
}