import { mcq, mode } from "../num";
import type { Topic } from "../types";
import { L1, L2, L3 } from "../bank/living";

/** Life-cycle stages add up. Wrong options each leave a stage out. */
const cycle = mode("l1cycle", [5, 11, 8], ([i, j, k], r) => {
  const a = i + 3, b = j + 10, c = k + 7, t = a + b + c;
  const u = (n: number) => `${n} days`;
  return mcq(r, `In this story a butterfly egg takes ${a} days to hatch. The caterpillar eats for ${b} days. The chrysalis rests for ${c} days. How many days from egg to butterfly?`, u(t),
    [u(b + c), u(a + b), u(a + c), u(b), u(t + 7)],
    `Every stage counts: ${a} + ${b} + ${c} = ${t} days.`);
});

/** Insects have 6 legs, spiders 8. Wrong options: swapped the two, treated all as insects, all as spiders, counted animals. */
const legs = mode("l2legs", [8, 8], ([i, j], r) => {
  const a = i + 2, b = j + 2, t = 6 * a + 8 * b;
  const u = (n: number) => `${n} legs`;
  return mcq(r, `A scientist counts ${a} ants and ${b} spiders in a tray of leaf litter. How many legs are there altogether?`, u(t),
    [u(8 * a + 6 * b), u(6 * (a + b)), u(8 * (a + b)), u(a + b), u(4 * (a + b))],
    `Ants are insects with 6 legs: ${a} × 6 = ${6 * a}. Spiders have 8: ${b} × 8 = ${8 * b}. Together ${6 * a} + ${8 * b} = ${t}.`);
});

/** Predators and prey numbers. Wrong options: forgot the nights, forgot the other owls, added instead. */
const NIGHTS = [2, 3, 5, 7, 10];
const owls = mode("l3owls", [3, 5, 5], ([i, j, k], r) => {
  const m = i + 2, o = j + 2, n = NIGHTS[k], t = m * o * n;
  const u = (x: number) => `${x} mice`;
  return mcq(r, `One barn owl eats ${m} mice each night. How many mice do ${o} owls eat in ${n} nights?`, u(t),
    [u(m * o), u(m * n), u(m + o + n), u(o * n), u(t + m), u(t - m)],
    `Each night ${o} owls eat ${o} × ${m} = ${m * o} mice. Over ${n} nights that is ${m * o} × ${n} = ${t}.`);
});

export const living: Topic = {
  id: "living", name: "Living things", blurb: "Life cycles, food chains and habitats", ink: "good",
  curriculum: "AC9S3U01 (Year 3), AC9S4U01 (Year 4)",
  tiers: ["Living or not, and life cycles", "Food chains and habitats", "Food webs and animal groups"],
  bank: [L1, L2, L3],
  gens: [[cycle], [legs], [owls]],
};
