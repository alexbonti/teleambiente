import nextConfig from "eslint-config-next";

/**
 * Flat config. `eslint-config-next` v16 ships a flat-config array; the guard
 * keeps the file working if it ever ships a single object instead.
 */
const nextConfigs = Array.isArray(nextConfig) ? nextConfig : [nextConfig];

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "coverage/**"] },
  ...nextConfigs,
];

export default config;
