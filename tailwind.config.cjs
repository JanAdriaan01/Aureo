# Replace tailwind config with CJS
@'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
'@ | Set-Content -Encoding UTF8 tailwind.config.cjs

# (optional) remove the .js variant to avoid double-loading
Remove-Item tailwind.config.js -ErrorAction Ignore
