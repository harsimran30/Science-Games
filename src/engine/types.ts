import type { Rng } from "./rng";

export type Tier = 1 | 2 | 3;
export type Ink = "peri" | "area" | "vol" | "good" | "sun";

export interface Question {
  prompt: string;
  answer: string;
  options: string[];
  explain: string;
}

/**
 * One factual question: [question, right answer, wrong, wrong, wrong, one-line explanation, note for an adult?].
 * Each wrong option is a real misconception or a near neighbour, never filler. The optional 7th item flags a
 * fact that is simplified for primary school or that an adult may want to double-check.
 */
export type Entry = readonly [string, string, string, string, string, string, string?];

/** A countable set of questions. at(k) for k in 0..size-1 gives a different question for every k. */
export interface Mode {
  key: string;
  size: number;
  at(k: number, r: Rng): Question;
}

export interface Topic {
  id: string;
  name: string;
  blurb: string;
  ink: Ink;
  /** Australian Curriculum v9 content descriptions this topic draws on. */
  curriculum: string;
  tiers: readonly [string, string, string];
  bank: readonly [readonly Entry[], readonly Entry[], readonly Entry[]];
  gens: readonly [readonly Mode[], readonly Mode[], readonly Mode[]];
}

export const XP_PER_TIER: Record<Tier, number> = { 1: 10, 2: 15, 3: 20 };
