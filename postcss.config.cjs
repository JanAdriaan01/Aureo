# PostCSS config -> CJS
Remove-Item postcss.config.js -ErrorAction Ignore
@'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
'@ | Set-Content -Encoding UTF8 postcss.config.cjs

# Tailwind config -> CJS
Remove-Item tailwind.config.js -ErrorAction Ignore
@'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
'@ | Set-Content -Encoding UTF8 tailwind.config.cjs