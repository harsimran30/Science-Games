import { type Rng, shuffle } from "./rng";
import type { Mode, Question } from "./types";

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

const NNBSP = " ";
const group = (w: string): string => (w.length > 4 ? w.replace(/\B(?=(\d{3})+$)/g, NNBSP) : w);

/** Renders the integer i as i / 10^dp with no floating point involved. dec(1615, 2) -> "16.15" */
export function dec(i: number, dp: number): string {
  if (dp < 0) return dec(i * 10 ** -dp, 0);
  const neg = i < 0;
  const s = String(Math.abs(Math.round(i))).padStart(dp + 1, "0");
  const whole = s.slice(0, s.length - dp);
  const part = dp ? s.slice(-dp).replace(/0+$/, "") : "";
  return (neg ? "−" : "") + group(whole) + (part ? "." + part : "");
}
export const whole = (n: number): string => dec(n, 0);

type Maybe = string | null | undefined | false;

/** Builds a four-option question. Wrong options are tried in order, so put the real misconceptions first. */
export function mcq(r: Rng, prompt: string, answer: string, wrongs: Maybe[], explain: string): Question {
  const seen = new Set([answer]);
  const w: string[] = [];
  for (const x of wrongs) {
    if (!x || seen.has(x)) continue;
    seen.add(x);
    w.push(x);
    if (w.length === 3) break;
  }
  if (w.length < 3) throw new Error("Not enough wrong options for: " + prompt);
  return { prompt, answer, options: shuffle(r, [answer, ...w]), explain };
}

/**
 * A generator whose questions can be counted. dims lists how many values each parameter can take; question
 * number k is decoded into one index per parameter, so every k gives a different set of parameters.
 */
export function mode(key: string, dims: readonly number[], build: (v: number[], r: Rng) => Question): Mode {
  return {
    key,
    size: dims.reduce((a, b) => a * b, 1),
    at(k, r) {
      const v: number[] = [];
      for (const d of dims) {
        v.push(k % d);
        k = Math.floor(k / d);
      }
      return build(v, r);
    },
  };
}
