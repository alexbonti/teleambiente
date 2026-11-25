#!/usr/bin/env node
/**
 * Measure the real weight of the key templates of the current site.
 *
 * For each template we fetch the HTML, collect every same-origin asset it
 * references (CSS, JS, images incl. srcset) and HEAD them for content-length.
 * Output: data/audit/weight.json — quoted by docs/audit/digital-footprint.md.
 *
 * Run: pnpm audit:weight
 */
import { SITE, USER_AGENT, fetchText, pool, writeJson } from "./lib.mjs";

const TEMPLATES = [
  { name: "home", url: `${SITE}/` },
  { name: "hub", url: `${SITE}/categorie/attualita/` },
  { name: "article", url: `${SITE}/intelligenza-artificiale-opportunita-natura-video/` },
  { name: "live", url: `${SITE}/diretta-streaming/` },
  { name: "schedule", url: `${SITE}/palinsesto-televisivo/` },
];

function assetKind(url) {
  const path = new URL(url).pathname.toLowerCase();
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".js") || path.endsWith(".mjs")) return "js";
  if (/\.(png|jpe?g|webp|avif|gif|svg)$/.test(path)) return "image";
  if (/\.(woff2?|ttf|otf)$/.test(path)) return "font";
  if (/\.(mp4|webm|m3u8|mp3)$/.test(path)) return "media";
  return "other";
}

function collectAssets(html, baseUrl) {
  const urls = new Set();

  for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) urls.add(match[1]);
  for (const match of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const tag = match[0].toLowerCase();
    if (tag.includes("stylesheet") || tag.includes("preload")) urls.add(match[1]);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = /\bsrc=["']([^"']+)["']/i.exec(tag)?.[1];
    if (src) urls.add(src);
    const srcset = /\bsrcset=["']([^"']+)["']/i.exec(tag)?.[1];
    if (srcset) {
      for (const candidate of srcset.split(",")) {
        const candidateUrl = candidate.trim().split(/\s+/)[0];
        if (candidateUrl) urls.add(candidateUrl);
      }
    }
  }

  return [...urls]
    .map((value) => {
      try {
        return new URL(value, baseUrl).href;
      } catch {
        return null;
      }
    })
    .filter((value) => value !== null && value.startsWith(SITE) && !value.includes("wp-json"));
}

async function headSize(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(15000),
    });
    const length = response.headers.get("content-length");
    return { url, status: response.status, bytes: length === null ? null : Number(length) };
  } catch (error) {
    return { url, status: `ERR:${error.message}`, bytes: null };
  }
}

async function main() {
  const report = { generatedAt: new Date().toISOString(), site: SITE, templates: [] };

  for (const template of TEMPLATES) {
    const page = await fetchText(template.url);
    const assets = collectAssets(page.body, page.finalUrl || template.url);
    const sizes = await pool(assets, 10, 0, headSize);

    const totals = {};
    let measured = 0;
    for (const asset of sizes) {
      const kind = assetKind(asset.url);
      const bucket = (totals[kind] ??= { bytes: 0, requests: 0, unknown: 0 });
      bucket.requests += 1;
      if (asset.bytes === null) bucket.unknown += 1;
      else {
        bucket.bytes += asset.bytes;
        measured += asset.bytes;
      }
    }

    const heaviest = sizes
      .filter((asset) => asset.bytes !== null)
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10)
      .map((asset) => ({
        url: asset.url,
        kb: Math.round(asset.bytes / 1024),
        kind: assetKind(asset.url),
      }));

    report.templates.push({
      name: template.name,
      url: template.url,
      htmlBytes: page.bytes,
      status: page.status,
      ttfbMs: page.ttfbMs,
      requests: assets.length,
      measuredBytes: measured,
      measuredMb: Number((measured / 1024 / 1024).toFixed(2)),
      byKind: Object.fromEntries(
        Object.entries(totals).map(([kind, value]) => [
          kind,
          { requests: value.requests, kb: Math.round(value.bytes / 1024), unknownSize: value.unknown },
        ]),
      ),
      heaviest,
    });

    console.log(
      `${template.name.padEnd(9)} ${String(assets.length).padStart(3)} assets  ${(measured / 1024 / 1024).toFixed(2)} MB`,
    );
  }

  await writeJson("data/audit/weight.json", report);
  console.log("\nwrote data/audit/weight.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
