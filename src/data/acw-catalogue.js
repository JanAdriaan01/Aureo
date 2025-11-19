// src/data/acw-catalogue.js
// Standalone ACW product catalogue (images referenced from /public/images/...)
// Exported names: ACW_CATALOGUE, COLOUR_MAP

export const ACW_CATALOGUE = {
  ACW887: {
    title: "ACW887",
    category: "Project",
    codePrefix: "ACW887",
    // primary thumbnail (public/images/ACW887/B/ACW887B.png must exist)
    image: "/images/ACW887/B/ACW887B.png",
    // images grouped by colour code (optional; use arrays so UI can pick thumbnails)
    imagesByColour: {
      B: ["/images/ACW887/B/ACW887B.png", "/images/ACW887/B/ACW887BR.png"],
      BR: ["/images/ACW887/BR/ACW887BR.png"],
      BW: [], // white images (if any)
      BN: [], // natural/anodised images
      C: ["/images/ACW887/C/ACW887C.png"]
    },
    description: "ACW887 — standard aluminium system (demo description).",
    // dimensions in mm (used as fixed size in your ProductDetails if required)
    dimensions: { width: 1200, height: 1500 },
    // numeric base price (R)
    basePrice: 4200,
    metadata: {}
  },

  ACW888: {
    title: "ACW888",
    category: "Project",
    codePrefix: "ACW888",
    // If you have images for ACW888, place them in public/images/ACW888/... and update paths below
    image: "/images/ACW888/B/ACW888B.png", // if file exists; otherwise set to "" or a placeholder path
    imagesByColour: {
      B: ["/images/ACW888/B/ACW888B.png", "/images/ACW888/B/ACW888BR.png"],
      BR: ["/images/ACW888/BR/ACW888BR.png"],
      BW: [],
      BN: [],
      C: ["/images/ACW888/C/ACW888C.png"]
    },
    description: "ACW888 — aluminium system.",
    dimensions: { width: 1200, height: 1500 },
    basePrice: 4300,
    metadata: {}
  },

  ACW889: {
    title: "ACW889",
    category: "Project",
    codePrefix: "ACW889",
    image: "/images/ACW889/B/ACW889B.png",
    imagesByColour: {
      B: ["/images/ACW889/B/ACW889B.png", "/images/ACW889/B/ACW889BR.png"],
      BR: ["/images/ACW889/BR/ACW889BR.png"],
      BW: [],
      BN: [],
      C: ["/images/ACW889/C/ACW889C.png"]
    },
    description: "ACW889 — aluminium system.",
    dimensions: { width: 1200, height: 1500 },
    basePrice: 4400,
    metadata: {}
  },

  ACW890: {
    title: "ACW890",
    category: "Project",
    codePrefix: "ACW890",
    image: "/images/ACW890/B/ACW890B.png",
    imagesByColour: {
      B: ["/images/ACW890/B/ACW890B.png", "/images/ACW890/B/ACW890BR.png"],
      BR: ["/images/ACW890/BR/ACW890BR.png"],
      BW: [],
      BN: [],
      C: ["/images/ACW890/C/ACW890C.png"]
    },
    description: "ACW890 — aluminium system.",
    dimensions: { width: 1200, height: 1500 },
    basePrice: 4500,
    metadata: {}
  },

  // Example placeholder entries — update or remove as you add more
  ACW891: {
    title: "ACW891",
    category: "Project",
    codePrefix: "ACW891",
    image: "/images/ACW891/B/ACW891B.png",
    imagesByColour: {},
    description: "",
    dimensions: { width: 1200, height: 1500 },
    basePrice: 4000,
    metadata: {}
  },

  // Add further entries as required...
};

export const COLOUR_MAP = [
  { code: "B", name: "Black" },
  { code: "BR", name: "Bronze" },
  { code: "BW", name: "White" },
  { code: "BN", name: "Natural" },
  { code: "C", name: "Charcoal" }
];