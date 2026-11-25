#!/usr/bin/env node
/**
 * Crawl the public sitemap graph and a deterministic stratified sample of pages.
 *
 * Outputs (all committed, they are the audit evidence):
 *   data/audit/urls.csv       every URL advertised in the sitemap index, with type
 *   data/audit/sample.csv     per-URL status, indexability, schema, H1, bytes
 *   data/audit/summary.json   aggregates quoted in docs/audit/digital-footprint.md
 *
 * Run: pnpm audit:crawl   (network: teleambiente.tv only)
 */
import { mkdir, writeFile } from "node:fs/promises";
import {
  SITE,
  canonical,
  count,
  fetchText,
  locs,
  makeRandom,
  metaContent,
  pool,
  sample,
  schemaTypes,
  sitemapKind,
  title,
  toCsv,
  writeJson,
} from "./lib.mjs";

const OUT_DIR = "data/audit";
const SAMPLES = { post: 60, category: 8, tag: 8, author: 6, page: 5 };

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // 1. Sitemap index -> child sitemaps -> URLs.
  const index = await fetchText(`${SITE}/sitemap_index.xml`);
  const childSitemaps = locs(index.body);
  const byKind = new Map();
  /** @type {Array<{url:string,type:string,sitemap:string}>} */
  const urls = [];

  await pool(childSitemaps, 4, 120, async (sitemapUrl) => {
    const kind = sitemapKind(sitemapUrl);
    try {
      const response = await fetchText(sitemapUrl);
      const entries = locs(response.body);
      for (const url of entries) urls.push({ url, type: kind, sitemap: sitemapUrl });
      byKind.set(kind, (byKind.get(kind) ?? 0) + entries.length);
    } catch (error) {
      console.error(`sitemap failed: ${sitemapUrl} — ${error.message}`);
      byKind.set(kind, byKind.get(kind) ?? 0);
    }
  });

  urls.sort((a, b) => a.url.localeCompare(b.url));
  await writeFile(
    `${OUT_DIR}/urls.csv`,
    toCsv(urls, ["url", "type", "sitemap"]),
    "utf8",
  );

  // 2. Deterministic stratified sample of pages to inspect in depth.
  const random = makeRandom();
  const picked = [];
  for (const [kind, howMany] of Object.entries(SAMPLES)) {
    const poolForKind = urls.filter((entry) => entry.type === kind);
    picked.push(...sample(poolForKind, howMany, random));
  }
  const extra = [
    { url: `${SITE}/`, type: "home" },
    { url: `${SITE}/diretta-streaming/`, type: "live" },
    { url: `${SITE}/palinsesto-televisivo/`, type: "schedule" },
    { url: `${SITE}/chi-siamo/`, type: "about" },
    { url: `${SITE}/?s=clima`, type: "search" },
    { url: `${SITE}/2026/11/24/`, type: "date-archive" },
  ];

  const rows = await pool([...picked, ...extra], 6, 180, async (entry) => {
    try {
      const response = await fetchText(entry.url);
      const html = response.body;
      const robots = metaContent(html, "robots") ?? "";
      return {
        type: entry.type,
        url: entry.url,
        status: response.status,
        ttfb_ms: response.ttfbMs,
        bytes: response.bytes,
        indexable: /noindex/i.test(robots) ? "no" : "yes",
        canonical: canonical(html) ?? "",
        self_canonical: (canonical(html) ?? "") === entry.url ? "yes" : "no",
        title: title(html) ?? "",
        h1: count(html, /<h1\b/gi),
        scripts: count(html, /<script\b/gi),
        stylesheets: count(html, /<link[^>]+rel=["']stylesheet["']/gi),
        images: count(html, /<img\b/gi),
        schema: schemaTypes(html).join("|"),
      };
    } catch (error) {
      return { type: entry.type, url: entry.url, status: `ERR:${error.message}` };
    }
  });

  const columns = [
    "type",
    "url",
    "status",
    "ttfb_ms",
    "bytes",
    "indexable",
    "canonical",
    "self_canonical",
    "title",
    "h1",
    "scripts",
    "stylesheets",
    "images",
    "schema",
  ];
  await writeFile(`${OUT_DIR}/sample.csv`, toCsv(rows, columns), "utf8");

  // 3. Aggregates actually quoted in the audit doc.
  const ok = rows.filter((row) => row.status === 200);
  const avg = (values) =>
    values.length === 0 ? null : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);

  const summary = {
    generatedAt: new Date().toISOString(),
    site: SITE,
    sitemap: {
      childSitemaps: childSitemaps.length,
      urlsByType: Object.fromEntries([...byKind.entries()].sort()),
      urlsTotal: urls.length,
    },
    sample: {
      pages: rows.length,
      ok: ok.length,
      notOk: rows.length - ok.length,
      avgHtmlBytes: avg(ok.map((row) => Number(row.bytes))),
      avgTtfbMs: avg(ok.map((row) => Number(row.ttfb_ms))),
      indexable: rows.filter((row) => row.indexable === "yes").length,
      noindex: rows.filter((row) => row.indexable === "no").length,
      missingH1: rows.filter((row) => row.h1 === 0).length,
      notSelfCanonical: rows.filter((row) => row.self_canonical === "no").length,
      avgScripts: avg(ok.map((row) => Number(row.scripts))),
      avgStylesheets: avg(ok.map((row) => Number(row.stylesheets))),
      schemaTypes: [...new Set(rows.flatMap((row) => String(row.schema).split("|")))].filter(Boolean).sort(),
    },
  };

  await writeJson(`${OUT_DIR}/summary.json`, summary);
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
