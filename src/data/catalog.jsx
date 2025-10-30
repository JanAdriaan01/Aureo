// ====== AUREO Catalogue ======
// Complete product library: windows, doors, louvres.
// Base prices are placeholders in ZAR (incl. standard hardware, excl. delivery).
// Adjust freely — the app recalculates PDP prices with glazing/finish multipliers.

// ---------- WINDOWS ----------
export const PRODUCT_LIBRARY = {
  /* === WINDOWS === */
  "Sliding Window": {
    category: "Window",
    codePrefix: "SW",
    image: "/images/sliding1000.jpg",
    description:
      "Space-saving horizontal sliders for kitchens and living areas. Smooth rollers, secure interlocks.",
    sizes: {
      // width x height (mm) → base price (clear glass, white frame)
      "1200x900": 5200,
      "1500x1200": 6400,
      "1800x1200": 7200,
      "2100x1200": 7900,
    },
  },

  "Casement Window (Top Hung)": {
    category: "Window",
    codePrefix: "CWT",
    image: "/images/swift38.jpg",
    description:
      "Outward opening top-hung sashes—excellent for bathrooms and bedrooms; great rain performance.",
    sizes: {
      "600x900": 3100,
      "900x900": 3600,
      "900x1200": 4700,
      "1200x1500": 5900,
      "1500x1200": 5600,
    },
  },

  "Casement Window (Side Hung)": {
    category: "Window",
    codePrefix: "CWS",
    image: "/images/swift36.jpg",
    description:
      "Classic side-hung casements with strong ventilation and easy cleaning access.",
    sizes: {
      "600x900": 3250,
      "900x1200": 4900,
      "1200x1500": 6100,
      "1500x1500": 6600,
    },
  },

  "Fixed Window": {
    category: "Window",
    codePrefix: "FW",
    image: "/images/edge42.jpg",
    description:
      "Non-opening picture windows to maximise natural light and views. Pair with vents for airflow.",
    sizes: {
      "1200x1200": 4200,
      "1800x1200": 5200,
      "2100x1500": 6400,
      "2400x1500": 6900,
    },
  },

  "Tilt & Turn Window": {
    category: "Window",
    codePrefix: "TTW",
    image: "/images/serene52.jpg",
    description:
      "European tilt-in for secure ventilation and turn-open for cleaning—premium thermal performance.",
    sizes: {
      "900x1200": 9200,
      "1200x1500": 11200,
      "1500x1500": 12400,
    },
  },

  "Pivot Window": {
    category: "Window",
    codePrefix: "PVW",
    image: "/images/pivot38.jpg",
    description:
      "Center-pivot sash for large openings and balanced operation; ideal for architectural features.",
    sizes: {
      "1200x1200": 9800,
      "1500x1500": 12800,
    },
  },

  "Vertical Sliding (Sash) Window": {
    category: "Window",
    codePrefix: "VSW",
    image: "/images/vert70.jpg",
    description:
      "Traditional vertical sliders with modern balances—classic look with smooth action.",
    sizes: {
      "900x1200": 7400,
      "1200x1500": 9300,
      "1500x1500": 10400,
    },
  },

  "Shopfront Window (Clip 38/44)": {
    category: "Window",
    codePrefix: "SFW",
    image: "/images/clip44.jpg",
    description:
      "Commercial shopfront framing for large fixed lights and doors—robust and clean sightlines.",
    sizes: {
      "1800x1200": 6500,
      "2400x1500": 8900,
      "3000x2100": 13800,
    },
  },

  /* === LOUVRES === */
  "Louvre Window (Jalousie)": {
    category: "Louvre",
    codePrefix: "LVW",
    image: "/images/clip38.jpg",
    description:
      "Adjustable louvre blades for controlled airflow and privacy—great for bathrooms and service areas.",
    sizes: {
      "600x900": 3200,
      "900x1200": 4300,
      "1200x1200": 5100,
    },
  },

  /* === DOORS === */
  "Hinged Door (Single)": {
    category: "Door",
    codePrefix: "HD1",
    image: "/images/clip38.jpg",
    description:
      "Single leaf hinged aluminium door—strong stiles, compression seals, and quality hinges.",
    sizes: {
      "900x2100": 6900,
      "1000x2100": 7400,
    },
  },

  "Hinged Door (Double/French)": {
    category: "Door",
    codePrefix: "HD2",
    image: "/images/clip44.jpg",
    description:
      "Double French doors—symmetrical opening with elegant sightlines and robust locking.",
    sizes: {
      "1200x2100": 9800,
      "1500x2100": 11200,
      "1800x2100": 12600,
    },
  },

  "Sliding Door 700 Series": {
    category: "Door",
    codePrefix: "SD7",
    image: "/images/sliding1000.jpg",
    description:
      "Residential sliding patio door—space efficient with smooth operation and secure interlocks.",
    sizes: {
      "1800x2100": 11900,
      "2400x2100": 14800,
      "3000x2100": 17600,
    },
  },

  "Sliding Door 1000 Series": {
    category: "Door",
    codePrefix: "SD10",
    image: "/images/sliding1000.jpg",
    description:
      "High-performance sliding door for larger spans—heavier rollers and stronger profiles.",
    sizes: {
      "2400x2100": 17600,
      "3000x2100": 20400,
      "3600x2100": 23800,
    },
  },

  "Folding / Stacking (Bi-Fold) Door": {
    category: "Door",
    codePrefix: "BFD",
    image: "/images/elite.jpg",
    description:
      "Wide opening bi-fold system—top hung with smooth stacking for uninterrupted views.",
    sizes: {
      "2400x2100": 26800, // 3 panels
      "3000x2100": 31600, // 4 panels
      "3600x2100": 36900, // 5 panels
      "4200x2100": 41800, // 6 panels
    },
  },

  "Pivot Entrance Door": {
    category: "Door",
    codePrefix: "PVD",
    image: "/images/pivot38.jpg",
    description:
      "Architectural pivot door with oversized leaf and premium hardware—statement entrance.",
    sizes: {
      "1200x2400": 33800,
      "1500x2400": 39200,
    },
  },

  "Shopfront Door (Commercial)": {
    category: "Door",
    codePrefix: "SFD",
    image: "/images/clip44.jpg",
    description:
      "Commercial shopfront door with closer options and heavy-duty hardware.",
    sizes: {
      "900x2100": 9800,
      "1000x2100": 10400,
      "1200x2400": 14800,
    },
  },
};

// ---------- ROOM PRESETS (for sidebar filtering) ----------
// These presets narrow sizes per typical room use. The shop only shows
// SKUs where the chosen size exists for that product type.
export const ROOM_PRESETS = {
  Bathroom: ["600x900", "600x1200", "900x900"],
  Bedroom: ["900x1200", "1200x1500", "1500x1200"],
  Kitchen: ["900x900", "1200x900", "1500x1200"],
  LivingRoom: ["1800x1200", "2100x1500", "2400x1200", "2400x1500"],
  Entrance: ["900x2100", "1000x2100", "1200x2400"],
  Patio: ["1800x2100", "2400x2100", "3000x2100", "3600x2100"],
  CommercialFront: ["2400x1500", "3000x2100", "1200x2400"],
};

// ---------- PRICE MULTIPLIERS ----------
export const GLASS_MULTIPLIER = {
  clear: 1.0,
  tinted: 1.08,
  laminated: 1.22,
  lowe: 1.28,
  // optional add-ons could be layered later (laminated+lowe etc.)
};

export const FINISH_MULTIPLIER = {
  white: 1.0,      // powder coat standard
  charcoal: 1.03,  // premium powder coat
  black: 1.03,
  bronze: 1.06,    // anodised bronze
};

// ---------- HELPERS ----------
export function makeSku(prefix, size) {
  return `${prefix}-${size}`; // e.g. "CWT-1200x1500"
}

export function parseSku(sku) {
  const [prefix, size] = (sku || "").split("-");
  return { prefix, size };
}

export function findProductByPrefix(prefix) {
  return Object.entries(PRODUCT_LIBRARY).find(
    ([, p]) => p.codePrefix === prefix
  );
} // ← This closing brace was misplaced

// ---------- PRODUCT REVIEWS DATA ----------
export const PRODUCT_REVIEWS = {
  "SW-1500x1200": [
    {
      id: "rev_001",
      customerName: "John D.",
      verified: true,
      rating: 5,
      date: "2024-01-15",
      title: "Perfect for our living room",
      comment: "The sliding mechanism is smooth and the finish is excellent. Installation team was professional.",
      helpful: 12,
      images: ["/images/reviews/sw-livingroom-1.jpg"]
    }
  ],
  "CWT-900x1200": [
    {
      id: "rev_002",
      customerName: "Mike T.",
      verified: true,
      rating: 5,
      date: "2024-01-20", 
      title: "Excellent bathroom windows",
      comment: "Top-hung design is perfect for ventilation without letting rain in. Very happy with the quality.",
      helpful: 15,
      images: ["/images/reviews/cwt-bathroom-1.jpg"]
    }
  ]
};

// Helper function to get reviews by SKU
export function getReviewsBySku(sku) {
  return PRODUCT_REVIEWS[sku] || [];
}
