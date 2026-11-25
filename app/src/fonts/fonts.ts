import localFont from "next/font/local";

/**
 * Two faces, both self-hosted (OFL, variable):
 * - Archivo  — broadcast/listings voice: labels, times, navigation, headlines.
 *   The width axis (62–125) is used to condense the schedule and timecodes.
 * - Source Serif 4 — reading voice for article body, 19px on a 66–70ch measure.
 */
export const archivo = localFont({
  src: [
    { path: "../fonts/archivo-latin.woff2", style: "normal", weight: "100 900" },
    { path: "../fonts/archivo-latin-ext.woff2", style: "normal", weight: "100 900" },
  ],
  display: "swap",
  variable: "--font-archivo",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: false,
});

export const sourceSerif = localFont({
  src: [
    { path: "../fonts/source-serif-4-latin.woff2", style: "normal", weight: "200 900" },
    { path: "../fonts/source-serif-4-latin-ext.woff2", style: "normal", weight: "200 900" },
  ],
  display: "swap",
  variable: "--font-source-serif",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: false,
});
