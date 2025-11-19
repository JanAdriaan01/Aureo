// scripts/generate-acw-catalogue.js
// Plain-language: scan your images, copy them into public/images/<PRODUCT>/<COLOUR>/,
// create public/projects-manifest.json, and create src/data/acw-catalogue.js
//
// Run like:
// node scripts/generate-acw-catalogue.js --src ./bulk-images --outPublic ./public/images --manifest ./public/projects-manifest.json --catalogue ./src/data/acw-catalogue.js

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const argv = require('minimist')(process.argv.slice(2));

// Source folder where your product images are currently stored
const SRC = path.resolve(argv.src || './bulk-images');
// Where to copy images that your website will serve from (public folder)
const OUT_PUBLIC = path.resolve(argv.outPublic || './public/images');
// JSON manifest that maps product -> colour -> [image paths]
const MANIFEST_PATH = path.resolve(argv.manifest || './public/projects-manifest.json');
// JS file exported into your app that contains catalogue data
const CATALOGUE_PATH = path.resolve(argv.catalogue || './src/data/acw-catalogue.js');

// The exact product codes you gave me
const ACW_CODES = [
  'ACW887','ACW888','ACW889','ACW890','ACW891',
  'ACW892','ACW893','ACW894','ACW895','ACW896','ACW897'
];

// Colour suffixes and friendly names
const COLOURS = [
  { code: 'B', name: 'Black' },
  { code: 'BR', name: 'Bronze' },
  { code: 'BW', name: 'White' },
  { code: 'BN', name: 'Natural' },
  { code: 'C', name: 'Charcoal' }
];

async function main() {
  try {
    // ensure destination exists
    await fs.ensureDir(OUT_PUBLIC);

    // find all image files under SRC (recursive). Matches jpg/jpeg/png/webp/svg
    const pattern = `${SRC.replace(/\\/g, '/')}/**/*.{jpg,jpeg,png,webp,svg}`;
    const files = glob.sync(pattern, { nocase: true, nodir: true });

    // build a lookup map by lowercase filename for fast matching
    const fileMap = files.reduce((acc, fullPath) => {
      const name = path.basename(fullPath).toLowerCase();
      acc[name] = fullPath;
      return acc;
    }, {});

    const manifest = {};
    const catalogueEntries = {};

    for (const code of ACW_CODES) {
      manifest[code] = {};

      for (const col of COLOURS) {
        // we will gather any file that starts with code+colour like:
        // ACW889BR.jpg  OR ACW889BR-1.jpg  OR ACW889BR_2.png
        const prefixes = [
          `${code}${col.code}`,
          `${code}_${col.code}`,
          `${code}-${col.code}`
        ].map(s => s.toLowerCase());

        const matches = Object.keys(fileMap)
          .filter(fn => prefixes.some(pref => fn.startsWith(pref)))
          .map(fn => fileMap[fn]);

        // copy found files into public/images/<code>/<colour>/
        const savedPaths = [];
        if (matches.length) {
          const targetDir = path.join(OUT_PUBLIC, code, col.code);
          await fs.ensureDir(targetDir);
          for (const srcFile of matches) {
            const destFile = path.join(targetDir, path.basename(srcFile));
            await fs.copyFile(srcFile, destFile);
            // web path is what the website will use
            const webPath = `/images/${code}/${col.code}/${path.basename(srcFile)}`;
            savedPaths.push(webPath);
            console.log(`Copied: ${srcFile} -> ${destFile}`);
          }
        } else {
          // no matches for this colour
          console.warn(`No images found for ${code}${col.code}`);
        }

        manifest[code][col.code] = savedPaths;
      }

      // pick first available image across colours for the product thumbnail
      let thumbnail = '/images/placeholder.jpg';
      for (const col of COLOURS) {
        const arr = manifest[code][col.code];
        if (arr && arr.length) {
          thumbnail = arr[0];
          break;
        }
      }

      // minimal catalogue entry (easy to edit later)
      catalogueEntries[code] = {
        title: code,
        category: 'Project',
        codePrefix: code,
        image: thumbnail,
        imagesByColour: manifest[code],
        description: '',
        dimensions: { width: 1200, height: 1500 },
        basePrice: null,
        metadata: {}
      };
    }

    // write the manifest JSON (human-readable)
    await fs.ensureDir(path.dirname(MANIFEST_PATH));
    await fs.writeJson(MANIFEST_PATH, manifest, { spaces: 2 });
    console.log(`Wrote manifest to ${MANIFEST_PATH}`);

    // write the JS catalogue file used by your React app
    await fs.ensureDir(path.dirname(CATALOGUE_PATH));
    const header = `// Auto-generated ACW catalogue — run scripts/generate-acw-catalogue.js to regenerate\n\n`;
    const exportContent =
      `export const ACW_PRODUCT_LIBRARY = ${JSON.stringify(catalogueEntries, null, 2)};\n\n` +
      `export const COLOUR_MAP = ${JSON.stringify(COLOURS, null, 2)};\n`;
    await fs.writeFile(CATALOGUE_PATH, header + exportContent, 'utf8');
    console.log(`Wrote catalogue to ${CATALOGUE_PATH}`);

    // summary output
    console.log('--- Summary ---');
    console.log(`Products processed: ${ACW_CODES.length}`);
    console.log(`Total image files scanned: ${files.length}`);
    console.log('Done.');
  } catch (err) {
    console.error('Script failed:', err);
    process.exit(1);
  }
}

main();