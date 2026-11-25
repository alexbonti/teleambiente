#!/usr/bin/env node
/**
 * Screenshot + layout measurement through the Chrome DevTools Protocol.
 *
 * Chrome's `--screenshot` flag ignores window sizing on recent macOS builds, so the
 * prototype is shot with an explicit device-metrics override instead. Uses the system
 * Chrome and Node's built-in WebSocket: no browser download, no extra dependency.
 *
 * Usage: node scripts/dev/shot.mjs <url> <out.png> [width] [height] [--full]
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [url, out, widthArg, heightArg, flag] = process.argv.slice(2);

if (!url || !out) {
  console.error("usage: shot.mjs <url> <out.png> [width] [height] [--full]");
  process.exit(1);
}

const width = Number(widthArg ?? 1440);
const height = Number(heightArg ?? 1200);
const fullPage = flag === "--full";
const port = 9400 + Math.floor(Math.random() * 400);
const profile = resolve(".cache/chrome-cdp");

await mkdir(profile, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${port}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function version() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return await response.json();
    } catch {
      /* not up yet */
    }
    await sleep(150);
  }
  throw new Error("Chrome did not expose the debugging port");
}

await version();

async function pageTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await response.json();
    const page = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
    if (page) return page.webSocketDebuggerUrl;
    await sleep(150);
  }
  throw new Error("No page target found");
}

const { webSocketDebuggerUrl } = { webSocketDebuggerUrl: await pageTarget() };

class Cdp {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.waiting = new Map();
    this.listeners = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.method !== undefined) {
        for (const handler of this.listeners.get(message.method) ?? []) handler(message.params ?? {});
        return;
      }
      if (message.id !== undefined && this.waiting.has(message.id)) {
        const { resolve: done, reject } = this.waiting.get(message.id);
        this.waiting.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else done(message.result);
      }
    });
  }

  on(method, handler) {
    const handlers = this.listeners.get(method) ?? [];
    this.listeners.set(method, [...handlers, handler]);
  }

  send(method, params = {}) {
    this.id += 1;
    const id = this.id;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((done, reject) => this.waiting.set(id, { resolve: done, reject }));
  }
}

const socket = new WebSocket(webSocketDebuggerUrl);
await new Promise((done, reject) => {
  socket.addEventListener("open", done, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

const cdp = new Cdp(socket);

// Console + uncaught errors are part of the check: a hydration mismatch or a failed
// fetch shows up here and nowhere in the screenshot.
const consoleIssues = [];
cdp.on("Runtime.exceptionThrown", (params) => {
  const detail = params.exceptionDetails;
  consoleIssues.push(`exception: ${detail.exception?.description ?? detail.text}`);
});
cdp.on("Runtime.consoleAPICalled", (params) => {
  if (params.type !== "error" && params.type !== "warning") return;
  const text = (params.args ?? [])
    .map((arg) => arg.value ?? arg.description ?? arg.preview?.description ?? "")
    .join(" ")
    .slice(0, 300);
  consoleIssues.push(`${params.type}: ${text}`);
});
cdp.on("Log.entryAdded", (params) => {
  const entry = params.entry;
  if (entry.level !== "error") return;
  consoleIssues.push(`log: ${entry.text.slice(0, 200)} ${entry.url ?? ""}`.trim());
});

await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Log.enable");
await cdp.send("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 640,
});
await cdp.send("Page.navigate", { url });
await sleep(2500);

const metrics = await cdp.send("Runtime.evaluate", {
  expression: `JSON.stringify({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    h1: document.querySelector("h1")?.innerText?.slice(0, 80) ?? null,
    h1Count: document.querySelectorAll("h1").length,
    overflow: [...document.querySelectorAll("*")]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 8)
      .map((el) => el.tagName.toLowerCase() + "." + (el.className?.toString?.().slice(0, 60) ?? ""))
  })`,
  returnByValue: true,
});

const report = JSON.parse(metrics.result.value);
report.consoleIssues = consoleIssues;
console.log(JSON.stringify(report, null, 2));

// Optional interaction probe: PROBE_EXPR is evaluated in the page after load, which is how
// client-side behaviour (search filtering, the live player) is checked without a browser
// automation dependency.
const probeExpr = process.env.PROBE_EXPR;
if (probeExpr) {
  const probe = await cdp.send("Runtime.evaluate", {
    expression: `(async () => { ${probeExpr} })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  console.log(JSON.stringify({ probe: probe.result?.value ?? probe.exceptionDetails ?? null }, null, 2));
}

const shot = await cdp.send("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: fullPage,
  ...(fullPage
    ? {
        clip: {
          x: 0,
          y: 0,
          width,
          height: Math.min(report.scrollHeight, 20000),
          scale: 1,
        },
      }
    : {}),
});

const target = resolve(out);
await mkdir(dirname(target), { recursive: true });
await writeFile(target, Buffer.from(shot.data, "base64"));
console.log(`wrote ${target}`);

socket.close();
chrome.kill();
process.exit(0);
