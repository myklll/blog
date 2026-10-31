const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
      },
      fontFamily: {
        // Cravelo DEMO only ships A–Z / a–z, so digits and punctuation
        // fall through to Geist Serif
        display: ["var(--font-cravelo)", "var(--font-geist-serif)"],
        serif: ["var(--font-geist-serif)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  },
};
