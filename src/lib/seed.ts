// VayuLoom deterministic seed utilities (Track 01 Air).
//
// All stochastic-looking behaviour in the domain libs is derived from this
// single seed so builds, tests and demos are bit-for-bit reproducible.
// NOTE: mulberry32 PRNG state lives in the closure — create a fresh
// generator per call (never module-level mutable state) to stay pure.

/** Canonical project seed. Embedded "seed.json inline" per spec. */
export const SEED = 7331;

/** Inline seed manifest (equivalent of a seed.json file, kept in-code). */
export const SEED_JSON = {
  seed: 7331,
  project: "vayuloom",
  track: "01-air",
  prng: "mulberry32",
  note: "Deterministic demo data. Replace with live CPCB feeds in production.",
} as const;

/**
 * mulberry32 — tiny seeded PRNG. Returns a function yielding [0, 1).
 * Pure: same seed => same sequence, every time.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash → uint32. Used to derive per-entity sub-seeds. */
export function hashStringToSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic float in [min, max) from a generator. */
export function seededRange(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}
