// scripts/pushDoorImages.js
import fs from "fs";
import path from "path";
import csv from "csv-parser";

// --- Helper to parse command line arguments ---
function getArgValue(argName) {
  const arg = process.argv.find(a => a.startsWith(argName + "="));
  if (!arg) return null;
  return arg.split("=")[1].trim();
}

const SRC_DIR = path.resolve(getArgValue("--src"));
const CSV_PATH = path.resolve(getArgValue("--csv"));
const DEST_DIR = path.resolve("./public/images");

if (!SRC_DIR || !CSV_PATH) {
  console.error("Usage: node pushDoorImages.js --src=./bulk-door-images --csv=./src/data/doors.csv");
  process.exit(1);
}

if (!fs.existsSync(SRC_DIR)) {
  console.error("Source folder does not exist:", SRC_DIR);
  process.exit(1);
}

if (!fs.existsSync(CSV_PATH)) {
  console.error("CSV file does not exist:", CSV_PATH);
  process.exit(1);
}

console.log("Source folder:", SRC_DIR);
console.log("CSV path:", CSV_PATH);
console.log("Destination folder:", DEST_DIR);

const rows = [];

fs.createReadStream(CSV_PATH)
  .pipe(csv())
  .on("data", (data) => rows.push(data))
  .on("end", () => {
    console.log("CSV loaded. Rows:", rows.length);
    let totalCopied = 0;
    const missingBase = [];
    const missingOpen = [];
    const missingClosed = [];

    for (const row of rows) {
      const codeRaw = row["code"] || row["Code"] || row["Item Code"];
      const code = String(codeRaw || "").trim();
      if (!code) continue;

      // Prepare destination folder for this code
      const codeDir = path.join(DEST_DIR, code);
      if (!fs.existsSync(codeDir)) fs.mkdirSync(codeDir, { recursive: true });

      // Define expected images
      const baseImgName = `${code}.jpg`;
      const openImgName = `${code}O.jpg`;
      const closedImgName = `${code}C.jpg`;

      const imagesToCopy = [
        { src: path.join(SRC_DIR, baseImgName), dest: path.join(codeDir, baseImgName), label: "BASE" },
        { src: path.join(SRC_DIR, openImgName), dest: path.join(codeDir, openImgName), label: "OPEN" },
        { src: path.join(SRC_DIR, closedImgName), dest: path.join(codeDir, closedImgName), label: "CLOSED" }
      ];

      for (const img of imagesToCopy) {
        if (fs.existsSync(img.src)) {
          fs.copyFileSync(img.src, img.dest);
          totalCopied++;
        } else {
          switch (img.label) {
            case "BASE": missingBase.push(code); break;
            case "OPEN": missingOpen.push(code); break;
            case "CLOSED": missingClosed.push(code); break;
          }
        }
      }
    }

    console.log("\n=== PUSH IMAGES SUMMARY ===");
    console.log("Total codes processed:", rows.length);
    console.log("Total images copied:", totalCopied);
    if (missingBase.length) console.log("Missing BASE images:", missingBase.join(", "));
    if (missingOpen.length) console.log("Missing OPEN images:", missingOpen.join(", "));
    if (missingClosed.length) console.log("Missing CLOSED images:", missingClosed.join(", "));
  })
  .on("error", (err) => {
    console.error("CSV Read Error:", err);
  });
