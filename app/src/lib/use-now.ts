"use client";

import { useSyncExternalStore } from "react";

import { floorToMinute } from "@/lib/clock";

const TICK_MS = 30_000;

function subscribe(onChange: () => void): () => void {
  const timer = setInterval(onChange, TICK_MS);
  return () => clearInterval(timer);
}

/**
 * The page's clock, in the browser.
 *
 * The on-air state must be true at the moment the viewer looks, not at build time — which
 * matters on a static host (GitHub Pages) and is still better than a 5-minute ISR window.
 * The server snapshot is the value baked into the HTML, so hydration cannot mismatch; the
 * client snapshot corrects it on mount and refreshes every 30 s.
 */
export function useRomeNow(initialNow: number): Date {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => floorToMinute(Date.now()),
    () => floorToMinute(initialNow),
  );
  return new Date(snapshot);
}
