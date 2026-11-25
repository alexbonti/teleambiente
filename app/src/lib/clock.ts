/**
 * The one sanctioned place where the render path reads the wall clock.
 *
 * Pages render a snapshot of "now" and hand it to client components, which correct it on
 * mount (see use-now.ts). React's purity lint forbids `Date.now()` during render, so the
 * impure call is isolated here instead of scattered through every page.
 */
export function nowMs(): number {
  return Date.now();
}

/** Minute precision, so a clock snapshot is a stable value between ticks. */
export function floorToMinute(ms: number): number {
  return Math.floor(ms / 60_000) * 60_000;
}
