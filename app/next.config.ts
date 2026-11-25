import type { NextConfig } from "next";

/**
 * Two build modes from one codebase:
 *
 * - default (`pnpm build`): server build for Vercel/local — ISR, next/image optimizer,
 *   security headers.
 * - `STATIC_EXPORT=true` (GitHub Pages preview): fully static export into `out/`, no
 *   server runtime, images served as-is. Public assets and links get `NEXT_PUBLIC_BASE_PATH`
 *   because Pages serves project sites from `/<repo>/`.
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(basePath ? { basePath } : {}),
  ...(isStaticExport ? { output: "export" as const, trailingSlash: true } : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "teleambiente.tv" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
    // GitHub Pages has no image optimizer; the CMS/CDN pipeline replaces this later.
    ...(isStaticExport ? { unoptimized: true } : {}),
  },
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              // The current site ships none of these; the rebuild must.
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
