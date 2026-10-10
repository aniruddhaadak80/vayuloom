#!/usr/bin/env node
/**
 * gen-assets.mjs — deterministic SVG generator for VayuLoom.
 *
 * Writes public/images/*.svg ONLY when the file is missing.
 * Never overwrites existing art (Agent A SVGs win).
 *
 * Usage: node scripts/gen-assets.mjs
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "images");
mkdirSync(dir, { recursive: true });

const NAVY = "#0B1026";
const CYAN = "#22D3EE";
const AMBER = "#F59E0B";

function banner() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="360" viewBox="0 0 1200 360">
  <rect width="1200" height="360" fill="${NAVY}"/>
  <circle cx="180" cy="180" r="110" fill="none" stroke="${CYAN}" stroke-width="10"/>
  <circle cx="180" cy="180" r="70" fill="none" stroke="${AMBER}" stroke-width="6"/>
  <text x="330" y="165" font-family="sans-serif" font-size="72" font-weight="bold" fill="#F8FAFC">VayuLoom</text>
  <text x="332" y="220" font-family="sans-serif" font-size="28" fill="${CYAN}">Air Safety OS for Indian schools — seed 7331</text>
  <rect x="332" y="250" width="220" height="14" fill="${AMBER}"/>
</svg>
`;
}

function og() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <circle cx="600" cy="270" r="150" fill="none" stroke="${CYAN}" stroke-width="14"/>
  <text x="600" y="290" text-anchor="middle" font-family="sans-serif" font-size="64" font-weight="bold" fill="#F8FAFC">VayuLoom</text>
  <text x="600" y="470" text-anchor="middle" font-family="sans-serif" font-size="32" fill="${AMBER}">GRAP autopilot for 12 Delhi zones</text>
</svg>
`;
}

function logo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="${NAVY}"/>
  <circle cx="64" cy="64" r="40" fill="none" stroke="${CYAN}" stroke-width="8"/>
  <circle cx="64" cy="64" r="24" fill="none" stroke="${AMBER}" stroke-width="5"/>
</svg>
`;
}

const files = {
  "banner.svg": banner(),
  "og.svg": og(),
  "logo.svg": logo(),
};

let wrote = 0;
let skipped = 0;
for (const [name, content] of Object.entries(files)) {
  const dest = join(dir, name);
  if (existsSync(dest)) {
    skipped++;
    continue;
  }
  writeFileSync(dest, content);
  wrote++;
}
console.log(`gen-assets: wrote ${wrote}, skipped ${skipped} (existing files preserved)`);
