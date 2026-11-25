/**
 * Public assets are not rewritten by `next/image` under `output: "export"`, so the Pages
 * build (served from /teleambiente/) needs the base path applied by hand. Empty in the
 * server build, so production URLs stay clean.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function asset(path: string): string {
  return `${BASE_PATH}${path}`;
}
