// scripts/buildCatalogue.js
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Candidate CSVs
const CSV_CANDIDATE_PATHS = [
  path.resolve(__dirname, "..", "data", "products.csv"),
  path.resolve(__dirname, "..", "src", "data", "products.csv"),
  path.resolve(__dirname, "..", "data", "doors.csv"),
  path.resolve(__dirname, "..", "src", "data", "doors.csv")
];

const availableCSVPaths = CSV_CANDIDATE_PATHS.filter((p) => fs.existsSync(p));
if (availableCSVPaths.length === 0) {
  console.error(
    "ERROR: No CSV files found. Place products.csv and/or doors.csv in one of:\n" +
    "  ./data/products.csv\n" +
    "  ./src/data/products.csv\n" +
    "  ./data/doors.csv\n" +
    "  ./src/data/doors.csv"
  );
  process.exit(1);
}

const OUT_PATH = path.resolve(__dirname, "..", "src", "data", "acw-catalogue.js");
const BACKUP_DIR = path.resolve(__dirname, "..", "src", "data", "backups");
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Colour map
const COLOUR_CODES = ["B", "BR", "W", "N", "C"];
const COLOUR_MAP = [
  { code: "B", name: "Black" },
  { code: "BR", name: "Bronze" },
  { code: "W", name: "White" },
  { code: "N", name: "Natural" },
  { code: "C", name: "Charcoal" },
];

// -------------------
// Utilities
function normKey(k) {
  return String(k || "").toLowerCase().replace(/[\s\-_()]+/g, "");
}

function getField(row, variants = []) {
  for (const v of variants) if (row[v] !== undefined) return row[v];
  const keys = Object.keys(row || {});
  const lowerMap = {};
  for (const k of keys) lowerMap[normKey(k)] = k;
  for (const v of variants) {
    const nk = normKey(v);
    if (lowerMap[nk]) return row[lowerMap[nk]];
  }
  return undefined;
}

function parseJsonSafe(val, fallback) {
  if (val === undefined || val === null) return fallback;
  const s = String(val).trim();
  if (!s) return fallback;
  try { return JSON.parse(s); } catch (e) {
    try {
      let fixed = s.replace(/'/g, '"').replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
      return JSON.parse(fixed);
    } catch { return null; }
  }
}

function extractImagesByColourFromText(text) {
  const imagesByColour = {};
  if (!text) return imagesByColour;
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

function buildImagesByColour(row, code) {
  const jsonVal = getField(row, [
    "Images By Colour (JSON)", "Images By Colour", "imagesbycolour", "images_by_colour",
    "imagesbycolour(json)", "imagesbycolourjson", "images_by_colour_(json)"
  ]);
  let imagesByColour = parseJsonSafe(jsonVal, null);
  if (!imagesByColour || typeof imagesByColour !== "object") imagesByColour = {};

  for (const c of COLOUR_CODES) {
    const candidates = [
      `images_${c}`, `images-${c}`, `images ${c}`, `images${c}`,
      `images_${c.toLowerCase()}`, `images${c.toLowerCase()}`
    ];
    const val = getField(row, candidates);
    if (val) {
      const parts = String(val).split(/;|,/).map(s => s.trim()).filter(Boolean);
      if (!imagesByColour[c]) imagesByColour[c] = [];
      for (const p of parts) {
        if (p.startsWith("/images/")) imagesByColour[c].push(p);
        else imagesByColour[c].push(`/images/${code}/${c}/${p}`);
      }
      imagesByColour[c] = Array.from(new Set(imagesByColour[c]));
    }
  }

  // fallback extraction from text
  const combinedText = [
    getField(row, ["Base Image", "BaseImage", "baseimage"]) || "",
    jsonVal || "",
    getField(row, ["Full Description", "FullDescription", "Full_Description", "fulldescription"]) || "",
    getField(row, ["Additional Information", "AdditionalInformation", "additionalinformation"]) || ""
  ].join(" ");
  const extracted = extractImagesByColourFromText(combinedText);
  for (const [k, arr] of Object.entries(extracted)) {
    const keyUpper = String(k).toUpperCase();
    if (!imagesByColour[keyUpper]) imagesByColour[keyUpper] = [];
    for (const p of arr) if (!imagesByColour[keyUpper].includes(p)) imagesByColour[keyUpper].push(p);
  }

  for (const c of COLOUR_CODES) if (!Array.isArray(imagesByColour[c])) imagesByColour[c] = [];
  return imagesByColour;
}

// -------------------
// CUSTOM THUMBNAIL RULES
function chooseThumbnail(baseImageField, imagesByColour, code) {
  // --- DOORS FIX: always use base image, ignore colours
  if (/^ASD\d+$/i.test(code)) return `/images/${code}/${code}.jpg`;

  // fallback normal behaviour for other products/windows
  if (baseImageField && String(baseImageField).trim()) return String(baseImageField).trim();
  if (imagesByColour.B && imagesByColour.B.length > 0) return imagesByColour.B[0];
  for (const c of COLOUR_CODES) {
    if (imagesByColour[c] && imagesByColour[c].length > 0) return imagesByColour[c][0];
  }
  return "/placeholder.png";
}

// -------------------
// CSV Utilities
function detectDelimiter(sampleText) {
  const lines = sampleText.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return ",";
  const headerLine = lines[0].replace(/^\uFEFF/, "");
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semiCount = (headerLine.match(/;/g) || []).length;
  return semiCount > commaCount ? ";" : ",";
}

function cleanHeader(h) {
  if (!h && h !== "") return h;
  let s = String(h).replace(/^\uFEFF/, "").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) s = s.slice(1, -1);
  return s.trim();
}

function readCsvWithDetection(csvPath) {
  return new Promise((resolve, reject) => {
    const sample = fs.readFileSync(csvPath, { encoding: "utf8" });
    const sep = detectDelimiter(sample);
    const rows = [];
    const stream = fs.createReadStream(csvPath);
    stream
      .pipe(csv({ separator: sep, mapHeaders: ({ header }) => cleanHeader(header), strict: false, skipLinesWithError: false }))
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve({ rows, separator: sep }))
      .on("error", (err) => reject(err));
  });
}

// -------------------
// MAIN
async function main() {
  console.log("CSV files to import:", availableCSVPaths.join(", "));
  let totalRows = 0;
  const catalogue = {};
  const errors = [];

  for (const csvPath of availableCSVPaths) {
    console.log("Reading CSV:", csvPath);
    let result;
    try { result = await readCsvWithDetection(csvPath); } 
    catch (err) { errors.push(`Failed to parse ${csvPath}: ${err}`); continue; }
    console.log(`  Detected delimiter: '${result.separator}' — rows: ${result.rows.length}`);
    totalRows += result.rows.length;

    for (const rawRow of result.rows) {
      const code = String(getField(rawRow, ["Code", "code", "Code Prefix", "codeprefix", "code_prefix"]) || "").trim();
      if (!code) continue;

      const title = getField(rawRow, ["Title", "title"]) || code;
      const category = getField(rawRow, ["Category", "category"]) || "Project";

      const shortDescription = getField(rawRow, ["Short Description", "shortdescription", "short_description"]) || "";
      const fullDescription = getField(rawRow, ["Full Description", "fulldescription", "full_description", "description", "Description"]) || "";
      const additionalInfo = getField(rawRow, ["Additional Information", "additionalinformation", "additional_information"]) || "";

      const width = Number(getField(rawRow, ["Width (mm)", "width"]) || 0);
      const height = Number(getField(rawRow, ["Height (mm)", "height"]) || 0);
      const basePrice = Number(getField(rawRow, ["Base Price", "baseprice", "price", "base_price"]) || 0);

      let imagesByColour = buildImagesByColour(rawRow, code);

      // --- CLEAR colours for doors
      if (/^ASD\d+$/i.test(code)) imagesByColour = {};

      const baseImageField = getField(rawRow, ["Base Image", "BaseImage", "baseimage", "base_image"]) || "";
      const image = chooseThumbnail(baseImageField, imagesByColour, code);

      let metadata = {};
      const metaVal = getField(rawRow, ["Metadata", "metadata"]) || "";
      if (metaVal) { const parsed = parseJsonSafe(metaVal, null); if (parsed && typeof parsed === "object") metadata = parsed; }

      let reviews = [];
      const reviewsVal = getField(rawRow, ["Reviews (JSON)", "Reviews", "reviews", "reviews_json"]) || "";
      if (reviewsVal) {
        const parsed = parseJsonSafe(reviewsVal, null);
        if (Array.isArray(parsed)) reviews = parsed;
      }

      const relatedRaw = getField(rawRow, ["Related Codes", "RelatedCodes", "relatedcodes", "related_codes", "related"]) || "";
      const relatedCodes = String(relatedRaw).split(/[;,]/).map(s => s.trim()).filter(Boolean);

      catalogue[code] = {
        title: String(title).trim(),
        category: String(category).trim(),
        codePrefix: code,
        image,
        imagesByColour,
        shortDescription: String(shortDescription || "").trim(),
        description: fullDescription || shortDescription,
        additionalInfo,
        dimensions: { width, height },
        basePrice,
        metadata,
        relatedCodes,
        reviews
      };
    }
  }

  if (fs.existsSync(OUT_PATH)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(BACKUP_DIR, `acw-catalogue.${timestamp}.js`);
    fs.copyFileSync(OUT_PATH, backupFile);
    console.log("Backup created:", backupFile);
  }

  const generatedFrom = availableCSVPaths.join(", ");
  const outContent =
    `// AUTO-GENERATED FILE — DO NOT EDIT\n` +
    `// Generated from: ${generatedFrom}\n\n` +
    `export const ACW_CATALOGUE = ${JSON.stringify(catalogue, null, 2)};\n\n` +
    `export const COLOUR_MAP = ${JSON.stringify(COLOUR_MAP, null, 2)};\n`;

  fs.writeFileSync(OUT_PATH, outContent, "utf8");
  console.log("ACW catalogue successfully written to:", OUT_PATH);
  console.log("Total CSV rows read:", totalRows);
  console.log("Entries:", Object.keys(catalogue).length);
}

main().catch(err => { console.error("BUILD ERROR:", err); process.exit(1); });