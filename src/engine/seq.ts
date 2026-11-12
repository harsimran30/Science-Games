/**
 * Questions do not repeat, and no list of past questions is kept. Every level is a fixed, countable set of
 * questions. Question number i is found by walking that set in a scrambled order: slot = (i x P + S) mod N,
 * where P shares no factor with N. That visits every slot exactly once before any slot comes round again, so
 * the only thing to remember is i: one small counter per set.
 */
import { gcd } from "./num";

const stepCache = new Map<number, number>();
function stepFor(size: number): number {
  let p = stepCache.get(size);
  if (p === undefined) {
    p = Math.max(1, Math.floor(size * 0.6180339887)) | 1;
    while (gcd(p, size) !== 1) p++;
    if (stepCache.size < 256) stepCache.set(size, p);
  }
  return p;
}

/** Position i in a walk that visits each of 0..size-1 exactly once per lap. Sets here are far below 2^26, so plain numbers are exact. */
export function scramble(i: number, size: number, salt: number): number {
  if (size <= 1) return 0;
  const lap = Math.floor(i / size);
  const start = (Math.abs(salt) + lap * 7919) % size;
  return ((i % size) * stepFor(size) + start) % size;
}

export const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};
