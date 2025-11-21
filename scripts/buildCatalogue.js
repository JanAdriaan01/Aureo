// scripts/buildCatalogue.js
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try both possible CSV locations (preferred project root /data, fallback src/data)
const CSV_CANDIDATES = [
  path.resolve(__dirname, "..", "data", "products.csv"),
  path.resolve(__dirname, "..", "src", "data", "products.csv")
];

let CSV_PATH = CSV_CANDIDATES.find((p) => fs.existsSync(p));
if (!CSV_PATH) {
  console.error(
    "ERROR: CSV file not found. Put products.csv in one of:\n" +
    "  ./data/products.csv\n" +
    "  ./src/data/products.csv"
  );
  process.exit(1);
}

const OUT_PATH = path.resolve(__dirname, "..", "src", "data", "acw-catalogue.js");
const BACKUP_DIR = path.resolve(__dirname, "..", "src", "data", "backups");
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Colour map (your codes)
const COLOUR_CODES = ["B", "BR", "W", "N", "C"];
const COLOUR_MAP = [
  { code: "B", name: "Black" },
  { code: "BR", name: "Bronze" },
  { code: "W", name: "White" },
  { code: "N", name: "Natural" },
  { code: "C", name: "Charcoal" },
];

function parseJsonSafe(val, fallback) {
  if (val === undefined || val === null) return fallback;
  const s = String(val).trim();
  if (!s) return fallback;
  try {
    return JSON.parse(s);
  } catch (e) {
    // attempt simple fixes
    try {
      const fixed = s.replace(/'/g, '"');
      return JSON.parse(fixed);
    } catch {
      return null; // caller will fallback to regex extraction
    }
  }
}

// fallback extractor: find all /images/... paths and group by colour folder
function extractImagesByColourFromText(text) {
  const imagesByColour = {};
  if (!text) return imagesByColour;
  // regex: /images/<product>/<colour>/<filename...>
  const re = /\/images\/([^\/\s]+)\/([^\/\s]+)\/([^\s,"'\)\]]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const product = m[1];
    const colour = m[2];
    const file = `/images/${product}/${colour}/${m[3]}`;
    if (!imagesByColour[colour]) imagesByColour[colour] = [];
    if (!imagesByColour[colour].includes(file)) imagesByColour[colour].push(file);
  }
  return imagesByColour;
}

// normalize header keys to simple lowercase keys without spaces/underscores/hyphens
function normKey(k) {
  return String(k || "").toLowerCase().replace(/[\s\-_()]+/g, "");
}

// helper to get a field from row with many possible header names (case-insensitive)
function getField(row, variants = []) {
  for (const v of variants) {
    // try exact key
    if (row[v] !== undefined) return row[v];
  }
  // try normalized matching
  const keys = Object.keys(row || {});
  const lowerMap = {};
  for (const k of keys) lowerMap[normKey(k)] = k;
  for (const v of variants) {
    const nk = normKey(v);
    if (lowerMap[nk]) return row[lowerMap[nk]];
  }
  return undefined;
}

// build imagesByColour from either:
// - parsed JSON from Images By Colour (JSON) column
// - per-colour columns images_B etc.
// - regex extraction from any images-containing fields
function buildImagesByColour(row, code) {
  // 1) try JSON column variants
  const jsonVal = getField(row, [
    "Images By Colour (JSON)",
    "Images By Colour",
    "imagesbycolour",
    "images_by_colour",
    "imagesbycolour(json)",
    "imagesbycolourjson"
  ]);
  let imagesByColour = parseJsonSafe(jsonVal, null);
  if (!imagesByColour) imagesByColour = {};

  // 2) also check per-colour columns like images_B / images-B / images b / imagesb
  for (const c of COLOUR_CODES) {
    const candidates = [
      `images_${c}`, `images-${c}`, `images ${c}`,
      `images${c}`, `images_${c.toLowerCase()}`, `images${c.toLowerCase()}`
    ];
    const val = getField(row, candidates);
    if (val) {
      // allow semicolon or comma separated lists
      const parts = String(val).split(/;|,/).map(s => s.trim()).filter(Boolean);
      if (!imagesByColour[c]) imagesByColour[c] = [];
      for (const p of parts) {
        // if path looks like relative filename, expand to expected folder if needed
        if (p.startsWith("/images/")) {
          if (!imagesByColour[c].includes(p)) imagesByColour[c].push(p);
        } else {
          // try to construct path: /images/<code>/<c>/<p>
          const constructed = `/images/${code}/${c}/${p}`;
          if (!imagesByColour[c].includes(constructed)) imagesByColour[c].push(constructed);
        }
      }
    }
  }

  // 3) If still empty, try to extract all paths from multiple text fields
  const hasAny = Object.keys(imagesByColour).some(k => imagesByColour[k] && imagesByColour[k].length);
  if (!hasAny) {
    // try base image field, images JSON raw, description fields
    const combinedText = [
      getField(row, ["Base Image", "BaseImage", "baseimage"]) || "",
      jsonVal || "",
      getField(row, ["Full Description", "FullDescription", "Full_Description", "fulldescription"]) || "",
      getField(row, ["Additional Information", "AdditionalInformation", "additionalinformation"]) || ""
    ].join(" ");
    const extracted = extractImagesByColourFromText(combinedText);
    // ensure exported colours are included (only keep those that match COLOUR_CODES)
    for (const [k, arr] of Object.entries(extracted)) {
      const keyUpper = String(k).toUpperCase();
      if (!imagesByColour[keyUpper]) imagesByColour[keyUpper] = [];
      for (const p of arr) if (!imagesByColour[keyUpper].includes(p)) imagesByColour[keyUpper].push(p);
    }
  }

  // Ensure arrays exist for all codes
  for (const c of COLOUR_CODES) {
    if (!Array.isArray(imagesByColour[c])) imagesByColour[c] = [];
  }

  return imagesByColour;
}

function chooseThumbnail(baseImageField, imagesByColour, code) {
  // prefer explicit base image (if valid)
  if (baseImageField && String(baseImageField).trim()) return String(baseImageField).trim();
  // prefer first B image
  if (imagesByColour.B && imagesByColour.B.length > 0) return imagesByColour.B[0];
  // else pick first available image from any colour
  for (const c of COLOUR_CODES) {
    if (imagesByColour[c] && imagesByColour[c].length > 0) return imagesByColour[c][0];
  }
  // fallback placeholder
  return "/placeholder.png";
}

async function main() {
  console.log("Reading CSV from:", CSV_PATH);

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv({ mapHeaders: ({ header }) => header })) // preserve original header names
      .on("data", (data) => rows.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log("CSV loaded:", rows.length, "rows");

  const catalogue = {};
  const errors = [];

  for (const rawRow of rows) {
    // normalize find code/title etc
    const codeRaw = getField(rawRow, ["Code", "code", "Code Prefix", "codeprefix"]) || "";
    const code = String(codeRaw).trim();
    if (!code) {
      // skip empty rows but log if row has data
      continue;
    }

    const title = getField(rawRow, ["Title", "title"]) || code;
    const category = getField(rawRow, ["Category", "category"]) || "Project";

    // description fields
    const shortDescription = getField(rawRow, ["Short Description", "shortdescription", "short_description"]) || "";
    const fullDescription = getField(rawRow, ["Full Description", "FullDescription", "description", "Description"]) || "";
    const additionalInfo = getField(rawRow, ["Additional Information", "AdditionalInformation", "additionalinformation"]) || "";

    const glassType = getField(rawRow, ["Glass Type", "glassType", "glasstype"]) || "";
    const glazing = getField(rawRow, ["Glazing", "glazing"]) || "";
    const tinting = getField(rawRow, ["Tinting", "tinting"]) || "";

    const width = Number(getField(rawRow, ["Width (mm)", "Width_mm", "width", "width(mm)"]) || 0) || 0;
    const height = Number(getField(rawRow, ["Height (mm)", "Height_mm", "height", "height(mm)"]) || 0) || 0;
    const basePrice = Number(getField(rawRow, ["Base Price", "baseprice", "price", "BasePrice"]) || 0) || 0;

    const baseImageField = getField(rawRow, ["Base Image", "BaseImage", "baseimage"]) || "";

    // imagesByColour builder (handles JSON, per-colour, or regex extraction)
    let imagesByColour;
    try {
      imagesByColour = buildImagesByColour(rawRow, code);
    } catch (err) {
      imagesByColour = { B: [], BR: [], W: [], N: [], C: [] };
      errors.push(`Images parse error for ${code}: ${err.message}`);
    }

    // ensure unique entries and normalized paths
    for (const k of Object.keys(imagesByColour)) {
      imagesByColour[k] = Array.from(new Set((imagesByColour[k] || []).map(String).map(s => s.trim()).filter(Boolean)));
    }

    const image = chooseThumbnail(baseImageField, imagesByColour, code);

    // metadata and reviews if present
    let metadata = {};
    const metaVal = getField(rawRow, ["Metadata", "metadata"]) || "";
    if (metaVal) {
      const parsed = parseJsonSafe(metaVal, null);
      if (parsed && typeof parsed === "object") metadata = parsed;
    }

    let reviews = [];
    const reviewsVal = getField(rawRow, ["Reviews (JSON)", "Reviews", "reviews"]) || "";
    if (reviewsVal) {
      const parsed = parseJsonSafe(reviewsVal, null);
      if (Array.isArray(parsed)) reviews = parsed;
      else {
        // try regex to extract simple comments if JSON failed
        const found = String(reviewsVal).match(/\{[^}]+\}/g) || [];
        for (const f of found) {
          const p = parseJsonSafe(f, null);
          if (p) reviews.push(p);
        }
      }
    }

    // related codes
    const relatedRaw = getField(rawRow, ["Related Codes", "RelatedCodes", "relatedcodes", "related"]) || "";
    const relatedCodes = String(relatedRaw)
      .split(/[;,]/)
      .map(s => s.trim())
      .filter(Boolean);

    // -------------------------
    // NEW: prefer fullDescription, fallback to shortDescription
    const finalDescription = (String(fullDescription || "").trim()) || String(shortDescription || "").trim();

    // NEW: ensure additionalInfo is captured and copied into metadata
    const finalAdditional = String(additionalInfo || "").trim();
    if (finalAdditional && !metadata.additionalInfo) metadata.additionalInfo = finalAdditional;

    catalogue[code] = {
      title: String(title).trim(),
      category: String(category).trim(),
      codePrefix: String(code).trim(),
      image,
      imagesByColour,
      shortDescription: String(shortDescription || "").trim(),
      // prefer long full description
      description: finalDescription,
      // explicit additionalInfo field for UI use
      additionalInfo: finalAdditional,
      // export glass / glazing / tinting in metadata for compatibility
      dimensions: { width: Number(width) || 0, height: Number(height) || 0 },
      basePrice: Number(basePrice) || 0,
      metadata: {
        ...metadata,
        // keep glass / glazing / tinting at top-level metadata if provided in CSV
        ...(glassType ? { glassType: String(glassType).trim() } : {}),
        ...(glazing ? { glazing: String(glazing).trim() } : {}),
        ...(tinting ? { tinting: String(tinting).trim() } : {})
      },
      relatedCodes,
      reviews
    };
  }

  // backup old file
  if (fs.existsSync(OUT_PATH)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(BACKUP_DIR, `acw-catalogue.${timestamp}.js`);
    fs.copyFileSync(OUT_PATH, backupFile);
    console.log("Backup created:", backupFile);
  }

  const outContent =
    `// AUTO-GENERATED FILE — DO NOT EDIT\n` +
    `// Generated from ${CSV_PATH}\n\n` +
    `export const ACW_CATALOGUE = ${JSON.stringify(catalogue, null, 2)};\n\n` +
    `export const COLOUR_MAP = ${JSON.stringify(COLOUR_MAP, null, 2)};\n`;

  fs.writeFileSync(OUT_PATH, outContent, "utf8");
  console.log("ACW catalogue successfully written to:", OUT_PATH);
  console.log("Entries:", Object.keys(catalogue).length);
  if (errors.length) {
    console.warn("Warnings:", errors.length);
    fs.writeFileSync(path.resolve(__dirname, "buildCatalogue-warnings.log"), errors.join("\n"), "utf8");
    console.warn("See buildCatalogue-warnings.log for details.");
  }
}

main().catch((err) => {
  console.error("BUILD ERROR:", err);
  process.exit(1);
});