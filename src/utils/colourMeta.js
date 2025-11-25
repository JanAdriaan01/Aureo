// src/utils/colourMeta.js
export const COLOUR_MAP = [
  { code: "W", name: "White", hex: "#FFFFFF" },
  { code: "B", name: "Black", hex: "#0B0B0B" },
  { code: "BR", name: "Bronze", hex: "#6B4F3A" },
  { code: "C", name: "Charcoal", hex: "#2F2F2F" },
  { code: "N", name: "Natural", hex: "#C0A97A" },
];

export function findColourMeta(code) {
  return COLOUR_MAP.find((c) => c.code === code) || { code, name: code, hex: "#E5E7EB" };
}